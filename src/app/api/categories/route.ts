import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [categories, counts] = await Promise.all([
    db.category.findMany({ where: { active: true }, orderBy: { id: "asc" } }),
    db.product.groupBy({ by: ["category"], _count: { _all: true } }),
  ]);
  const countByName = new Map(counts.map((c) => [c.category, c._count._all]));
  const withCounts = categories.map((c) => ({ ...c, itemCount: countByName.get(c.name) ?? 0 }));
  return NextResponse.json({ categories: withCounts });
}
