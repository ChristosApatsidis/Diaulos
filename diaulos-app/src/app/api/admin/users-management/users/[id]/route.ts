// api/admin/users-management/users/[id]/route.ts
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import nano from "@/lib/db";

/**
 * GET handler for fetching a user by ID. Only accessible by admin users.
 * @param request - The incoming request object.
 * @param params - The route parameters containing the user ID to fetch.
 * @returns A JSON response with the user data or an error message.
 */
export async function GET(
  _request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const db = nano.db.use("users");

  try {
    const user = await db.get(id);
    return NextResponse.json({ user });
  } catch (err: any) {
    if (err.statusCode === 404) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

/**
 * DELETE handler for deleting a user by ID. Only accessible by admin users.
 * @param request - The incoming request object.
 * @param params - The route parameters containing the user ID to delete.
 * @returns A JSON response indicating success or failure of the delete operation.
 */
export async function DELETE(
  _request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  // Prevent admins from deleting their own account
  if (id === (session.user as any).id) {
    return NextResponse.json(
      { error: "Cannot delete your own account" },
      { status: 400 },
    );
  }

  const db = nano.db.use("users");

  try {
    const doc = await db.get(id);
    await db.destroy(id, doc._rev);

    // Delete all linked accounts and sessions
    const bulkDelete = async (dbName: string) => {
      const linkedDb = nano.db.use(dbName);
      const { docs } = await linkedDb.find({
        selector: { userId: id },
        limit: 1000,
      });
      if (docs.length > 0) {
        await linkedDb.bulk({
          docs: docs.map((d: any) => ({
            _id: d._id,
            _rev: d._rev,
            _deleted: true,
          })),
        });
      }
    };

    await Promise.all([bulkDelete("accounts"), bulkDelete("sessions")]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.statusCode === 404) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}

/**
 * PATCH handler for updating a user by ID. Only accessible by admin users. Accepts a JSON body with the fields to update.
 * @param request - The incoming request object containing the JSON body with the fields to update.
 * @param params - The route parameters containing the user ID to update.
 * @returns A JSON response indicating success or failure of the update operation.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const body = await request.json();

  // Whitelist only updatable fields to prevent mass assignment
  const {
    name,
    username,
    email,
    branch,
    combatArmsSupportBranch,
    rank,
    specialization,
    unitOfService,
    role,
    permissions,
  } = body;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (username !== undefined) updates.username = username;
  if (branch !== undefined) updates.branch = branch;
  if (combatArmsSupportBranch !== undefined)
    updates.combatArmsSupportBranch = combatArmsSupportBranch;
  if (rank !== undefined) updates.rank = rank;
  if (specialization !== undefined) updates.specialization = specialization;
  if (unitOfService !== undefined) updates.unitOfService = unitOfService;
  if (role !== undefined) updates.role = role;
  if (permissions !== undefined) updates.permissions = permissions;

  if (email !== undefined) {
    // Check if email is already taken by another user
    const db = nano.db.use("users");
    const { docs } = await db.find({
      selector: {
        email,
        _id: { $ne: id },
      },
      limit: 1,
    });

    if (docs.length > 0) {
      return NextResponse.json(
        { code: "EMAIL_TAKEN", error: "Email is already in use" },
        { status: 400 },
      );
    }

    updates.email = email;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { code: "NO_FIELDS_TO_UPDATE", error: "No fields to update" },
      { status: 400 },
    );
  }

  const db = nano.db.use("users");

  try {
    const doc = await db.get(id);
    const updated = { ...doc, ...updates };
    await db.insert(updated);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.statusCode === 404) {
      return NextResponse.json(
        { code: "USER_NOT_FOUND", error: "User not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { code: "UPDATE_ERROR", error: "Failed to update user" },
      { status: 500 },
    );
  }
}
