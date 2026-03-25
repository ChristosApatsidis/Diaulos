// api/admin/users-management/users/route.ts
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { couch } from "@/lib/db";

/**
 * API route handler for fetching all users in the system.
 * This route is protected and can only be accessed by authenticated admin users.
 * It retrieves the session from the request headers, checks the user's role,
 * and if authorized, fetches all user documents from the CouchDB database.
 * The response includes a JSON object with the list of users or an error message if unauthorized or if fetching fails.
 */
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)),
  );
  const skip = (page - 1) * limit;

  try {
    const db = couch.use("users");

    // Ensure we have an index on createdAt for efficient pagination
    await db.createIndex({
      index: { fields: ["createdAt", "role"] },
      name: "idx-createdAt-role",
    });

    // Fetch one page + total count in parallel
    const [result, rolesResult] = await Promise.all([
      db.find({
        selector: { createdAt: { $gt: null } },
        sort: [{ createdAt: "asc" }, { role: "asc" }],
        limit,
        skip,
      }),
      db.find({ selector: {}, fields: ["role"], limit: 100_000 }),
    ]);

    // Extract user documents from the result
    const users = result.docs;

    // Calculate role statistics
    const stats = rolesResult.docs.reduce(
      (acc, doc: any) => {
        acc.total++;
        if (doc.role === "admin") acc.admins++;
        else if (doc.role === "viewer") acc.viewers++;
        else if (doc.role === "user") acc.users++;
        return acc;
      },
      { total: 0, admins: 0, viewers: 0, users: 0 },
    );

    const totalPages = Math.ceil(stats.total / limit);

    // wait 2 seconds to simulate loading state (for demo purposes)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return NextResponse.json({ users, stats, page, totalPages, limit });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
