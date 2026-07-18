import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customerSessionCookie, getCustomerIdFromSession } from "@/lib/customer-auth";
import { computeTotalDiscount, type CouponLike } from "@/lib/discount";
import { orderSchema, parseJson } from "@/lib/validation";

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

function computeTier(totalSpent: number, orderCount: number): string {
  if (totalSpent >= 500) return "VIP";
  if (orderCount >= 2) return "Regular";
  return "New";
}

// POST /api/orders — create a new order from checkout.
// Prices, discounts, stock, and totals are always recomputed from the
// database; the client only supplies product ids, quantities, and the
// shipping/contact details. This prevents a client from forging a total.
export async function POST(req: NextRequest) {
  const parsed = await parseJson(req, orderSchema);
  if (parsed.error) return parsed.error;
  const body = parsed.data;

  try {
    // If the shopper is signed in, trust the session for identity — never
    // let a logged-in request attribute an order (and its stats) to a
    // different email than the account actually authenticated as.
    const sessionCustomerId = getCustomerIdFromSession(
      req.cookies.get(customerSessionCookie.name)?.value
    );
    const sessionCustomer = sessionCustomerId
      ? await db.customer.findUnique({ where: { id: sessionCustomerId } })
      : null;

    const customerEmail = sessionCustomer?.email ?? body.customer.email.toLowerCase();

    const ids = [...new Set(body.items.map((i) => i.id))];
    const products = await db.product.findMany({ where: { id: { in: ids } } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of body.items) {
      const product = productMap.get(item.id);
      if (!product || product.status !== "active") {
        return NextResponse.json(
          { error: `Product ${item.id} is no longer available.` },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Only ${product.stock} of "${product.name}" left in stock.` },
          { status: 400 }
        );
      }
    }

    const subtotal = body.items.reduce((sum, item) => {
      const product = productMap.get(item.id)!;
      return sum + product.price * item.quantity;
    }, 0);

    let coupon: CouponLike | null = null;
    if (body.couponCode) {
      const found = await db.coupon.findFirst({
        where: { code: body.couponCode.toUpperCase(), active: true },
      });
      if (!found || (found.expiresAt && found.expiresAt < new Date())) {
        return NextResponse.json(
          { error: `Coupon "${body.couponCode}" is invalid or expired.` },
          { status: 400 }
        );
      }
      coupon = found;
    }

    const settingsRows = await db.siteSetting.findMany();
    const settings = Object.fromEntries(settingsRows.map((s) => [s.key, s.value]));
    const discount = computeTotalDiscount(
      coupon ? [coupon] : [],
      coupon ? coupon.code : null,
      settings,
      subtotal
    );
    const shipping = 0; // Free shipping (matches storefront checkout behavior)
    const total = Math.max(0, subtotal - discount + shipping);

    const orderItems = body.items.map((item) => {
      const product = productMap.get(item.id)!;
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        image: JSON.parse(product.images)[0] ?? "",
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      };
    });

    const now = new Date();
    const estimatedDelivery = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
    const orderNumber = body.orderNumber || `MDV-${Date.now().toString().slice(-8)}`;

    const order = await db.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          customerId: sessionCustomer?.id ?? null,
          customerName: `${body.customer.firstName} ${body.customer.lastName}`.trim(),
          customerEmail,
          customerPhone: body.customer.phone || null,
          country: body.customer.country,
          town: body.customer.town,
          street: body.customer.street,
          postal: body.customer.postal || null,
          note: body.customer.note || null,
          items: JSON.stringify(orderItems),
          subtotal,
          discount,
          shipping,
          total,
          paymentMethod: body.paymentMethod,
          status: "paid",
          estimatedDelivery,
        },
      });

      for (const item of body.items) {
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity }, sold: { increment: item.quantity } },
        });
      }

      // Only accrue purchase stats for authenticated shoppers — a guest
      // checkout must not be able to inflate another account's stats or
      // tier just by typing that account's email address.
      if (sessionCustomer) {
        const newOrderCount = sessionCustomer.orders + 1;
        const newTotalSpent = sessionCustomer.totalSpent + total;
        await tx.customer.update({
          where: { id: sessionCustomer.id },
          data: {
            orders: newOrderCount,
            totalSpent: newTotalSpent,
            tier: computeTier(newTotalSpent, newOrderCount),
          },
        });
      }

      return created;
    });

    return NextResponse.json(
      { order: { ...order, items: orderItems, estimatedDelivery: estimatedDelivery.toISOString() } },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST /api/orders error:", e);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
