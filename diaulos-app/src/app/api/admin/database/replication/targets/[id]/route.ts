// api/admin/database/replication/targets/[id]/route.ts
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import "server-only";
import { auth } from "@/lib/auth/auth";

const COUCHDB_URL = process.env.COUCHDB_URL;

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET handler for fetching a specific replication target by its document ID.
 * Reads the document directly from the _replicator database.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
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

  const { id } = await params;

  try {
    const url = new URL(COUCHDB_URL);
    const base = `${url.protocol}//${url.host}`;
    const couchHeaders = {
      Authorization: `Basic ${Buffer.from(`${url.username}:${url.password}`).toString("base64")}`,
      "Content-Type": "application/json",
    };

    const res = await fetch(`${base}/_replicator/${encodeURIComponent(id)}`, {
      headers: couchHeaders,
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        res.status === 404
          ? "Replication target not found"
          : (data.reason ?? "Failed to fetch replication target");
      return NextResponse.json({ error: message }, { status: res.status });
    }

    return NextResponse.json({ target: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE handler for removing a replication target by its document ID.
 * Fetches the current _rev then deletes the document from _replicator.
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
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

  const { id } = await params;

  try {
    const url = new URL(COUCHDB_URL);
    const base = `${url.protocol}//${url.host}`;
    const couchHeaders = {
      Authorization: `Basic ${Buffer.from(`${url.username}:${url.password}`).toString("base64")}`,
      "Content-Type": "application/json",
    };

    // First fetch the document to get the current _rev
    const getRes = await fetch(
      `${base}/_replicator/${encodeURIComponent(id)}`,
      { headers: couchHeaders },
    );

    if (!getRes.ok) {
      const getData = await getRes.json();
      const message =
        getRes.status === 404
          ? "Replication target not found"
          : (getData.reason ?? "Failed to fetch replication target");
      return NextResponse.json({ error: message }, { status: getRes.status });
    }

    const doc = await getRes.json();
    const rev = doc._rev;

    // Delete the document using its _rev
    const deleteRes = await fetch(
      `${base}/_replicator/${encodeURIComponent(id)}?rev=${encodeURIComponent(rev)}`,
      { method: "DELETE", headers: couchHeaders },
    );

    const deleteData = await deleteRes.json();

    if (!deleteRes.ok) {
      return NextResponse.json(
        { error: deleteData.reason ?? "Failed to delete replication target" },
        { status: deleteRes.status },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Replication target deleted successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
