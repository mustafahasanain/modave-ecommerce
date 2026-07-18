import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [categories, counts] = await Promise.all([
    db.category.findMany({ orderBy: { id: "asc" } }),
    db.product.groupBy({ by: ["category"], _count: { _all: true } }),
  ]);
  const countByName = new Map(counts.map((c) => [c.category, c._count._all]));
  const withCounts = categories.map((c) => ({ ...c, itemCount: countByName.get(c.name) ?? 0 }));
  return NextResponse.json({ categories: withCounts });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { itemCount, ...rest } = body;
  const maxRow = await db.category.aggregate({ _max: { id: true } });
  const newId = (maxRow._max.id ?? 0) + 1;
  const slug = rest.slug || rest.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const cat = await db.category.create({ data: { id: newId, ...rest, slug, active: rest.active ?? true } });
  return NextResponse.json({ category: { ...cat, itemCount: 0 } }, { status: 201 });
}
