// api/admin/database/replication/targets/route.ts
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import "server-only";
import { auth } from "@/lib/auth/auth";
import { buildDatabaseAuthUrl } from "@/utils/database-auth-url";
import type { ReplicationDoc, ReplicationEndpoint } from "@/types";

const COUCHDB_URL = process.env.COUCHDB_URL;

/**
 * GET handler for fetching all replication targets and their associated replication jobs.
 * Combines data from the _scheduler and _replicator system databases to provide a comprehensive view of replication status.
 * Caches the response for 10 seconds to reduce load on CouchDB.
 *
 * Returns an array of replication targets, each containing:
 * - target_name: human-readable label for the target node (from _replicator)
 * - target_url: the base URL of the target node
 * - target_host: the hostname (and port if specified) of the target node
 * - replications: an array of replication jobs targeting that node, each with details like source, state, progress, etc.
 */
export async function GET() {
  if (!COUCHDB_URL) {
    return NextResponse.json(
      { error: "CouchDB URL not configured" },
      { status: 500 },
    );
  }

  try {
    const url = new URL(COUCHDB_URL);

    const headers = {
      Authorization: `Basic ${Buffer.from(`${url.username}:${url.password}`).toString("base64")}`,
      "Content-Type": "application/json",
    };

    const base = `${url.protocol}//${url.host}`;

    // 👇 fetch both in parallel
    const [schedulerRes, replicatorRes] = await Promise.all([
      fetch(`${base}/_scheduler/docs`, {
        headers,
        next: {
          revalidate: 10,
        },
      }),
      fetch(`${base}/_replicator/_all_docs?include_docs=true`, {
        headers,
        next: {
          revalidate: 10,
        },
      }),
    ]);

    if (!schedulerRes.ok || !replicatorRes.ok) {
      return NextResponse.json([], { status: 503 });
    }

    const [schedulerData, replicatorData] = await Promise.all([
      schedulerRes.json(),
      replicatorRes.json(),
    ]);

    // Build a map of custom fields from _replicator keyed by doc _id
    const customFieldsMap: Record<string, any> = {};
    replicatorData.rows.forEach((row: any) => {
      if (row.doc && !row.id.startsWith("_design")) {
        customFieldsMap[row.id] = {
          target_name: row.doc.target_name ?? null,
        };
      }
    });

    // Group by target and merge custom fields
    const groupedData: Array<{
      target_name: string;
      target_url: string;
      target_host: string;
      replications: any[];
    }> = [];

    schedulerData.docs.forEach((doc: any) => {
      const targetUrl = new URL(doc.target).origin;
      const targetHostname = new URL(doc.target).hostname;
      const targetPort = new URL(doc.target).port || "";

      let targetGroup = groupedData.find((g) => g.target_url === targetUrl);

      if (!targetGroup) {
        targetGroup = {
          target_name: customFieldsMap[doc.doc_id]?.target_name ?? targetUrl,
          target_url: targetUrl,
          target_host: targetHostname + (targetPort ? `:${targetPort}` : ""),
          replications: [],
        };
        groupedData.push(targetGroup);
      }

      targetGroup.replications.push({
        doc_id: doc.doc_id,
        node: doc.node,
        source: doc.source,
        target: doc.target,
        state: doc.state,
        info: {
          docs_read: doc.info?.docs_read,
          docs_written: doc.info?.docs_written,
          doc_write_failures: doc.info?.doc_write_failures,
          changes_pending: doc.info?.changes_pending,
        },
        error_count: doc.error_count,
        start_time: doc.start_time,
        last_updated: doc.last_updated,
      });
    });

    return NextResponse.json(groupedData);
  } catch (err: any) {
    console.error("Replication targets error:", err);
    return NextResponse.json(
      { error: err.message ?? "Unknown error", data: [] },
      { status: 503 },
    );
  }
}

/**
 * POST handler for creating a new CouchDB replication job.
 * Inserts a document into the _replicator database which triggers CouchDB to start replication.
 *
 * Expected body:
 * - source: { host: string, port: number, username: string, password: string, database: string }
 * - target: { host: string, port: number, username: string, password: string, database: string }
 * - target_name: string   — human-readable label for the target node
 * - continuous?: boolean  — whether the replication should be continuous (default: true)
 */
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!COUCHDB_URL) {
    return NextResponse.json(
      { error: "CouchDB URL not configured" },
      { status: 500 },
    );
  }

  const body = await request.json();
  const {
    source,
    target,
    target_name,
    continuous = true,
    create_target = false,
  } = body;

  if (
    !source?.host ||
    !source?.port ||
    !source?.database ||
    !target?.host ||
    !target?.port ||
    !target?.database ||
    !target_name
  ) {
    return NextResponse.json(
      {
        error:
          "source (host, port, username, password, database), target (host, port, username, password, database), and target_name are required",
      },
      { status: 400 },
    );
  }

  try {
    // Parse CouchDB URL for authentication details
    const url = new URL(COUCHDB_URL);

    // Prepare headers with basic auth for CouchDB API
    const couchHeaders = {
      Authorization: `Basic ${Buffer.from(`${url.username}:${url.password}`).toString("base64")}`,
      "Content-Type": "application/json",
    };

    // Use the base URL (without path) for API requests to the _replicator database
    const base = `${url.protocol}//${url.host}`;

    // Ensure the _replicator system database exists (CouchDB doesn't create it automatically)
    const dbCheckRes = await fetch(`${base}/_replicator`, {
      method: "HEAD",
      headers: couchHeaders,
    });

    // If the _replicator database doesn't exist, create it
    if (dbCheckRes.status === 404) {
      const createRes = await fetch(`${base}/_replicator`, {
        method: "PUT",
        headers: couchHeaders,
      });
      if (!createRes.ok && createRes.status !== 412) {
        // 412 = already exists (race condition), safe to ignore
        const createData = await createRes.json();
        return NextResponse.json(
          {
            error: createData.reason ?? "Failed to create _replicator database",
          },
          { status: createRes.status },
        );
      }
    }

    // Build the replication document with source and target URLs
    const sourceUrl = buildDatabaseAuthUrl(source as ReplicationEndpoint);
    const targetUrl = buildDatabaseAuthUrl(target as ReplicationEndpoint);

    // Generate a unique document ID for the replication job
    const docId = `${source.database}_to_${encodeURIComponent(target_name)}`;

    // Construct the replication document
    const replicatorDoc: ReplicationDoc = {
      _id: docId,
      source: sourceUrl,
      target: targetUrl,
      target_name,
      continuous,
      create_target,
    };

    // Insert the replication document into the _replicator database to start replication
    const res = await fetch(`${base}/_replicator`, {
      method: "POST",
      headers: couchHeaders,
      body: JSON.stringify(replicatorDoc),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.reason ?? "Failed to create replication job" },
        { status: res.status },
      );
    }

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
