import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const items = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons: items });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = await db.coupon.create({ data: { ...body, code: body.code.toUpperCase() } });
  return NextResponse.json({ coupon: item }, { status: 201 });
}
