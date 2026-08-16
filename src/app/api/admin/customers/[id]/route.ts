import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { customerUpdateSchema, parseJson } from "@/lib/validation";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await db.customer.findUnique({ where: { id } });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ customer });
}

// PATCH /api/admin/customers/[id] — update editable contact fields only.
// Internal/statistical fields (orders, totalSpent, tier, joinedAt,
// passwordHash) are never accepted from the request body — only the fields
// validated by customerUpdateSchema are ever written to the database.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = await parseJson(req, customerUpdateSchema);
  if (parsed.error) return parsed.error;
  const { name, email, phone, notes } = parsed.data;

  try {
    const existing = await db.customer.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    // Normalize the same way signup/signin does, so lookups and uniqueness
    // checks stay consistent across the app.
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail !== existing.email) {
      const duplicate = await db.customer.findUnique({ where: { email: normalizedEmail } });
      if (duplicate && duplicate.id !== id) {
        return NextResponse.json(
          { error: "A customer with this email already exists." },
          { status: 409 }
        );
      }
    }

    const customer = await db.$transaction(async (tx) => {
      const updated = await tx.customer.update({
        where: { id },
        data: {
          name: name.trim(),
          email: normalizedEmail,
          phone: phone?.trim() || null,
          notes: notes?.trim() || null,
        },
      });

      // Preserve legacy order history across an email change by giving only
      // previously unlinked orders the account's stable id. The historical
      // contact snapshot on each order remains unchanged.
      if (normalizedEmail !== existing.email) {
        await tx.order.updateMany({
          where: { customerId: null, customerEmail: existing.email },
          data: { customerId: id },
        });
      }

      return updated;
    });
    return NextResponse.json({ customer });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        { error: "A customer with this email already exists." },
        { status: 409 }
      );
    }
    console.error("PATCH /api/admin/customers/[id] error:", e);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

// DELETE /api/admin/customers/[id] — remove the customer account while
// preserving their order history. Orders keep their own snapshot of contact
// info (customerName/customerEmail/customerPhone), so detaching customerId
// loses nothing except the live link to an account that no longer exists.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const deleted = await db.$transaction(async (tx) => {
      await tx.order.updateMany({ where: { customerId: id }, data: { customerId: null } });
      return tx.customer.deleteMany({ where: { id } });
    });
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/admin/customers/[id] error:", e);
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
