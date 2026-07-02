import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const items = await db.shippingOption.findMany({ where: { active: true }, orderBy: { id: "asc" } });
  return NextResponse.json({ options: items });
}
