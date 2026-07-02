import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const categories = await db.category.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const maxRow = await db.category.aggregate({ _max: { id: true } });
  const newId = (maxRow._max.id ?? 0) + 1;
  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const cat = await db.category.create({ data: { id: newId, ...body, slug, active: body.active ?? true } });
  return NextResponse.json({ category: cat }, { status: 201 });
}
