import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customerSessionCookie, getCustomerIdFromSession } from "@/lib/customer-auth";

// GET /api/orders — return only the signed-in customer's orders
export async function GET(req: NextRequest) {
  const customerId = getCustomerIdFromSession(req.cookies.get(customerSessionCookie.name)?.value);
  if (!customerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customer = await db.customer.findUnique({
    where: { id: customerId },
    select: { email: true },
  });
  if (!customer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await db.order.findMany({
    where: { customerEmail: customer.email },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders });
}

// POST /api/orders — create a new order from checkout
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderNumber,
      customer,
      items,
      subtotal,
      discount,
      shipping,
      total,
      paymentMethod,
      estimatedDelivery,
    } = body;

    if (!customer || !items || total == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const order = await db.order.create({
      data: {
        orderNumber: orderNumber || `MDV-${Date.now().toString().slice(-8)}`,
        customerName: `${customer.firstName} ${customer.lastName}`.trim(),
        customerEmail: customer.email,
        customerPhone: customer.phone || null,
        country: customer.country || "",
        town: customer.town || "",
        street: customer.street || "",
        postal: customer.postal || null,
        note: customer.note || null,
        items: JSON.stringify(items),
        subtotal: Number(subtotal) || 0,
        discount: Number(discount) || 0,
        shipping: Number(shipping) || 0,
        total: Number(total),
        paymentMethod: paymentMethod || "credit",
        status: "paid",
        estimatedDelivery: estimatedDelivery || null,
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (e) {
    console.error("POST /api/orders error:", e);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
