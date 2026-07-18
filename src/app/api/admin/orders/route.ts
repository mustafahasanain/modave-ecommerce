import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/admin/orders?status=paid — list orders, optionally filtered
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const where = status && status !== "all" ? { status } : {};
    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 1000,
    });
    return NextResponse.json({ orders });
  } catch (e) {
    console.error("GET /api/admin/orders error:", e);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
