// api/database/info/route.ts
import { NextResponse } from "next/server";
import "server-only";

const COUCHDB_URL = process.env.COUCHDB_URL;

/**
 * Fetches CouchDB server info, list of databases, and stats, then returns a structured JSON response.
 * Caches the response for 10 seconds to reduce load on CouchDB.
 */
export async function GET() {
  // Ensure the CouchDB URL is configured
  if (!COUCHDB_URL) {
    return NextResponse.json(
      { error: "CouchDB URL not configured" },
      { status: 500 },
    );
  }

  try {
    // Parse the CouchDB URL to extract credentials and host information
    const url = new URL(COUCHDB_URL);

    // Prepare Basic Auth headers
    const headers = {
      Authorization: `Basic ${Buffer.from(`${url.username}:${url.password}`).toString("base64")}`,
      "Content-Type": "application/json",
    };

    // Construct the base URL for CouchDB API requests
    const base = `${url.protocol}//${url.host}`;

    // Fetch server info, list of databases, stats, and replicator config in parallel
    const [infoRes, dbsRes, statsRes, replicatorConfigRes] = await Promise.all([
      fetch(`${base}/`, { headers, next: { revalidate: 10 } }),
      fetch(`${base}/_all_dbs`, { headers, next: { revalidate: 10 } }),
      fetch(`${base}/_node/_local/_stats`, {
        headers,
        next: { revalidate: 10 },
      }),
      fetch(`${base}/_node/_local/_config/replicator`, {
        headers,
        next: { revalidate: 10 },
      }),
    ]);

    // Check if all responses are successful
    if (!infoRes.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch CouchDB info",
        },
        {
          status: 500,
        },
      );
    }
    if (!dbsRes.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch CouchDB databases",
        },
        {
          status: 500,
        },
      );
    }
    if (!statsRes.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch CouchDB stats",
        },
        {
          status: 500,
        },
      );
    }

    // Parse the JSON responses
    const [info, databases, stats, replicatorConfig] = await Promise.all([
      infoRes.json(),
      dbsRes.json(),
      statsRes.json(),
      replicatorConfigRes.ok ? replicatorConfigRes.json() : Promise.resolve({}),
    ]);

    // Extract relevant stats with safe access and default to null if not available
    const c = stats?.couchdb;
    const httpd = c?.httpd;
    const methods = c?.httpd_request_methods;
    const codes = c?.httpd_status_codes;
    const mango = stats?.mango;
    const replicator = stats?.couch_replicator;
    const ddocCache = stats?.ddoc_cache;

    return NextResponse.json({
      host: url.host,
      version: info.version,
      vendor: info.vendor?.name ?? "Apache CouchDB",
      databases,
      storage: {
        openDatabases: c?.open_databases?.value ?? null,
        openFiles: c?.open_os_files?.value ?? null,
        commits: c?.commits?.value ?? null,
        fsyncCount: stats?.fsync?.count?.value ?? null,
      },

      documents: {
        reads: c?.database_reads?.value ?? null,
        writes: c?.document_writes?.value ?? null,
        inserts: c?.document_inserts?.value ?? null,
        localWrites: c?.local_document_writes?.value ?? null,
        dbChanges: c?.database_writes?.value ?? null,
        purges: c?.database_purges?.value ?? null,
      },

      httpd: {
        totalRequests: httpd?.requests?.value ?? null,
        bulkRequests: httpd?.bulk_requests?.value ?? null,
        viewReads: httpd?.view_reads?.value ?? null,
        clientsChanges: httpd?.clients_requesting_changes?.value ?? null,
        abortedRequests: httpd?.aborted_requests?.value ?? null,
        methods: {
          GET: methods?.GET?.value ?? null,
          POST: methods?.POST?.value ?? null,
          PUT: methods?.PUT?.value ?? null,
          DELETE: methods?.DELETE?.value ?? null,
        },
        statusCodes: {
          "200": codes?.["200"]?.value ?? null,
          "201": codes?.["201"]?.value ?? null,
          "400": codes?.["400"]?.value ?? null,
          "401": codes?.["401"]?.value ?? null,
          "404": codes?.["404"]?.value ?? null,
          "500": codes?.["500"]?.value ?? null,
        },
      },

      mango: {
        docsExamined: mango?.docs_examined?.value ?? null,
        resultsReturned: mango?.results_returned?.value ?? null,
        unindexedQueries: mango?.unindexed_queries?.value ?? null,
        tooManyDocsScanned: mango?.too_many_docs_scanned?.value ?? null,
      },

      replication: {
        requests: replicator?.requests?.value ?? null,
        workersStarted: replicator?.workers_started?.value ?? null,
        failedStarts: replicator?.failed_starts?.value ?? null,
        runningJobs: replicator?.jobs?.running?.value ?? null,
        pendingJobs: replicator?.jobs?.pending?.value ?? null,
        crashedJobs: replicator?.jobs?.crashed?.value ?? null,
        retries_per_request: replicatorConfig?.retries_per_request ?? null,
        max_retry_timeout_msec:
          replicatorConfig?.max_retry_timeout_msec ?? null,
        min_retry_timeout_msec:
          replicatorConfig?.min_retry_timeout_msec ?? null,
      },

      cache: {
        ddocHits: ddocCache?.hit?.value ?? null,
        ddocMisses: ddocCache?.miss?.value ?? null,
        authCacheHits: c?.auth_cache_hits?.value ?? null,
        authCacheMisses: c?.auth_cache_misses?.value ?? null,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message,
      },
      {
        status: 500,
      },
    );
  }
}
