// api/units/route.tsx
import { NextResponse } from "next/server";
import nano from "@/lib/db";

export async function GET() {
  const units = [
    { id: 1, name: "Unit 1", description: "Description for Unit 1" },
    { id: 2, name: "Unit 2", description: "Description for Unit 2" },
    { id: 3, name: "Unit 3", description: "Description for Unit 3" },
  ];

  return NextResponse.json(units);
}
