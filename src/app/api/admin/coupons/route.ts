import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { couponCreateSchema, parseJson } from "@/lib/validation";

export async function GET() {
  const items = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons: items });
}

export async function POST(req: NextRequest) {
  const parsed = await parseJson(req, couponCreateSchema);
  if (parsed.error) return parsed.error;
  const body = parsed.data;

  try {
    const item = await db.coupon.create({
      data: {
        code: body.code.toUpperCase(),
        type: body.type,
        value: body.value,
        active: body.active,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });
    return NextResponse.json({ coupon: item }, { status: 201 });
  } catch (e) {
    console.error("POST /api/admin/coupons error:", e);
    return NextResponse.json({ error: "Failed to create coupon (code may already exist)" }, { status: 500 });
  }
}
