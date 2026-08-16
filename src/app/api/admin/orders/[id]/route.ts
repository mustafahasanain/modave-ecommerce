import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/admin/orders/[id] — single order with parsed items
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await db.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    let parsedItems: unknown = [];
    try {
      parsedItems = JSON.parse(order.items);
    } catch {
      parsedItems = [];
    }
    return NextResponse.json({ order: { ...order, items: parsedItems } });
  } catch (e) {
    console.error("GET order detail error:", e);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

// PATCH /api/admin/orders/[id] — update order status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;
    if (!["paid", "pending", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const order = await db.order.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ order });
  } catch (e) {
    console.error("PATCH order error:", e);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

// DELETE /api/admin/orders/[id] — permanently delete a cancelled order
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Keep the status check and deletion in one database statement so a
    // concurrent status update cannot make a paid or pending order deletable.
    const result = await db.order.deleteMany({
      where: { id, status: "cancelled" },
    });
    if (result.count === 1) {
      return NextResponse.json({ success: true });
    }

    const order = await db.order.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Only cancelled orders can be deleted" },
      { status: 409 }
    );
  } catch (e) {
    console.error("DELETE order error:", e);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
