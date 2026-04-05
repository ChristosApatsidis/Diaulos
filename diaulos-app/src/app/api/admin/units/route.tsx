// api/units/route.tsx
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import nano from "@/lib/db";
import { HIERARCHY, VALID_PARENTS, BRANCH_ROOTS } from "@/lib/units/hierarchy";
import type { Unit, BranchType } from "@/types/units";
import type { MangoSelector } from "nano";

type UnitNode = Unit & {
  children?: UnitNode[];
};

function buildTree(units: Unit[], parentId: string | null = null): UnitNode[] {
  return units
    .filter((u) => u.parentId === parentId)
    .map((u) => ({ ...u, children: buildTree(units, u._id!) }));
}

export async function ensureIndexes() {
  const db = nano.db.use("units");

  await db.createIndex({
    index: { fields: ["type", "branch", "parentId"] },
    name: "type-branch-parentId-index",
  });

  await db.createIndex({
    index: { fields: ["type", "branch", "unitType"] },
    name: "type-branch-unitType-index",
  });
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const tree = searchParams.get("tree") === "true";
  const branch = searchParams.get("branch") as BranchType | null;

  // Ensure indexes exist (no-op if they already do)
  await ensureIndexes();

  try {
    const db = nano.db.use("units");
    const selector = {
      type: "unit",
      ...(branch ? { branch } : {}),
    } as MangoSelector;

    const result = await db.find({ selector, limit: 9999 });
    const units = result.docs as Unit[];

    return NextResponse.json({
      units: tree ? buildTree(units) : units,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch units", description: error.description },
      { status: error.statusCode || 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { branch, unitType, name, parentId, description } =
    body as Partial<Unit>;

  if (!branch || !unitType || !name) {
    return NextResponse.json(
      { error: "branch, unitType and name are required" },
      { status: 400 },
    );
  }

  try {
    const db = nano.db.use("units");

    if (parentId) {
      const parent = (await db.get(parentId)) as Unit;

      // Parent must be in the same branch
      if (parent.branch !== branch) {
        return NextResponse.json(
          { error: "Parent unit belongs to a different branch" },
          { status: 400 },
        );
      }

      const validParents = VALID_PARENTS[unitType];
      const isValid = validParents
        ? validParents.includes(parent.unitType)
        : HIERARCHY[unitType] === parent.unitType;

      if (!isValid) {
        const expected = validParents ?? [HIERARCHY[unitType]];
        return NextResponse.json(
          {
            error: `A ${unitType} must be under one of: ${expected.join(", ")}`,
          },
          { status: 400 },
        );
      }
    } else if (unitType !== BRANCH_ROOTS[branch]) {
      return NextResponse.json(
        {
          error: `Root unit for ${branch} must be of type "${BRANCH_ROOTS[branch]}"`,
        },
        { status: 400 },
      );
    }

    const unit: Unit = {
      type: "unit",
      branch,
      unitType,
      name,
      parentId: parentId ?? null,
      description,
      createdAt: new Date().toISOString(),
    };

    const response = await db.insert(unit);
    return NextResponse.json(
      { id: response.id, rev: response.rev },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create unit", description: error.description },
      { status: error.statusCode || 500 },
    );
  }
}
