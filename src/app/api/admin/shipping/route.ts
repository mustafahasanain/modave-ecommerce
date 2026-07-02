import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const items = await db.shippingOption.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json({ options: items });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = await db.shippingOption.create({ data: body });
  return NextResponse.json({ option: item }, { status: 201 });
}
