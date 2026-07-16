import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  createCustomerSession,
  customerSessionCookie,
  getCustomerIdFromSession,
  hashPassword,
  verifyPassword,
} from "@/lib/customer-auth";

const publicCustomer = (customer: { id: string; name: string; email: string; phone: string | null }) => ({
  id: customer.id,
  name: customer.name,
  email: customer.email,
  phone: customer.phone,
});

export async function GET(request: NextRequest) {
  const id = getCustomerIdFromSession(request.cookies.get(customerSessionCookie.name)?.value);
  if (!id) return NextResponse.json({ customer: null });

  const customer = await db.customer.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, phone: true },
  });
  return NextResponse.json({ customer: customer ? publicCustomer(customer) : null });
}

export async function POST(request: NextRequest) {
  try {
    const { action, name, email, password } = await request.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Enter a valid email and a password of at least 8 characters." }, { status: 400 });
    }

    let customer;
    if (action === "signup") {
      const displayName = typeof name === "string" ? name.trim() : "";
      if (!displayName) return NextResponse.json({ error: "Enter your name." }, { status: 400 });
      const existing = await db.customer.findUnique({ where: { email: normalizedEmail } });
      if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      customer = await db.customer.create({
        data: { name: displayName, email: normalizedEmail, passwordHash: hashPassword(password) },
        select: { id: true, name: true, email: true, phone: true },
      });
    } else if (action === "signin") {
      const existing = await db.customer.findUnique({ where: { email: normalizedEmail } });
      if (!existing?.passwordHash || !verifyPassword(password, existing.passwordHash)) {
        return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
      }
      customer = publicCustomer(existing);
    } else {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    const response = NextResponse.json({ customer: publicCustomer(customer) });
    response.cookies.set(customerSessionCookie.name, createCustomerSession(customer.id), customerSessionCookie.options);
    return response;
  } catch (error) {
    console.error("Customer authentication error:", error);
    return NextResponse.json({ error: "Unable to complete your request." }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(customerSessionCookie.name, "", { ...customerSessionCookie.options, maxAge: 0 });
  return response;
}
