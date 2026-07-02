import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/admin/customers — list all customers
export async function GET() {
  try {
    const customers = await db.customer.findMany({
      orderBy: { joinedAt: "desc" },
    });
    return NextResponse.json({ customers });
  } catch (e) {
    console.error("GET /api/admin/customers error:", e);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
