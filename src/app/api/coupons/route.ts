import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const items = await db.coupon.findMany({ where: { active: true } });
  return NextResponse.json({ coupons: items });
}
