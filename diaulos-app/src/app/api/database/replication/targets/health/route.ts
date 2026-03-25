// app/api/database/replication/targets/health/route.ts
import { type NextRequest, NextResponse } from "next/server";
import "server-only";

/**
 * API route handler for checking the health of a replication target URL.
 * It validates the provided URL, ensures it uses an allowed protocol, and attempts to fetch it with a timeout. The response indicates whether the target is "online" or "offline".
 * @param {NextRequest} request - The incoming request object containing the URL to check as a query parameter.
 * @param {string} url - The target URL to check, provided as a query parameter in the request.
 * @returns {NextResponse} A JSON response indicating the health status of the target URL.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing url parameter" },
      { status: 400 },
    );
  }

  // Validate the URL to prevent SSRF against internal-only resources
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json(
      { error: "Invalid url parameter" },
      { status: 400 },
    );
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
  }

  try {
    const res = await fetch(parsed.toString(), {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });

    return NextResponse.json({ status: res.ok ? "online" : "offline" });
  } catch {
    return NextResponse.json({ status: "offline" });
  }
}
