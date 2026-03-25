// api/database/status/replication/route.ts
import { NextResponse } from "next/server";
import "server-only";

const COUCHDB_URL = process.env.COUCHDB_URL;

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
