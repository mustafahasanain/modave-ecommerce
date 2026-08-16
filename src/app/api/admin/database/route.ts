import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  SESSION_COOKIE_NAME,
  getAdminIdFromSession,
  isValidSession,
} from "@/lib/auth";
import { verifyPassword } from "@/lib/customer-auth";
import { rateLimit } from "@/lib/rate-limit";
import { databaseOperationSchema, parseJson } from "@/lib/validation";

// The exact typed confirmation phrase required for each operation. Kept on
// the backend so a frontend bug can never enable deletion with the wrong text.
const CONFIRMATION_PHRASES: Record<string, string> = {
  delete_products: "DELETE ALL PRODUCTS",
  delete_categories: "DELETE ALL CATEGORIES",
  reset_store: "RESET STORE",
};

async function getAuthenticatedAdmin(req: NextRequest) {
  const session = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!(await isValidSession(session))) return null;

  const adminId = getAdminIdFromSession(session);
  if (!adminId) return null;

  return db.admin.findUnique({ where: { id: adminId } });
}

// GET /api/admin/database — counts shown in the Danger Zone so the admin
// knows how many records an operation will affect before confirming.
export async function GET(req: NextRequest) {
  const admin = await getAuthenticatedAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [products, categories] = await Promise.all([
      db.product.count(),
      db.category.count(),
    ]);
    return NextResponse.json({ products, categories });
  } catch (e) {
    console.error("GET /api/admin/database error:", e);
    return NextResponse.json({ error: "Failed to load database stats" }, { status: 500 });
  }
}

// POST /api/admin/database — runs one of a fixed set of bulk operations.
// This is intentionally not a generic database console: the operation is a
// closed enum, never a raw model name or SQL string from the client.
export async function POST(req: NextRequest) {
  const admin = await getAuthenticatedAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseJson(req, databaseOperationSchema);
  if (parsed.error) return parsed.error;
  const { operation, confirmation, password } = parsed.data;

  if (confirmation !== CONFIRMATION_PHRASES[operation]) {
    return NextResponse.json({ error: "Confirmation text does not match." }, { status: 400 });
  }

  try {
    if (operation === "delete_products") {
      const [, result] = await db.$transaction([
        db.review.deleteMany(),
        db.product.deleteMany(),
      ]);
      return NextResponse.json({ success: true, deleted: result.count });
    }

    if (operation === "delete_categories") {
      const result = await db.category.deleteMany({});
      return NextResponse.json({ success: true, deleted: result.count });
    }

    // reset_store requires the current admin's password, verified against the
    // Admin record tied to this session — never trusted from the frontend.
    if (!rateLimit(`admin-database-reset:${admin.id}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    }
    if (!password || !verifyPassword(password, admin.passwordHash)) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    // Atomic reset: every store/business table is cleared, the Admin record
    // is never touched. Order is deleted before Customer because Order holds
    // the FK — deleting in the other order would violate the constraint.
    await db.$transaction([
      db.review.deleteMany(),
      db.order.deleteMany(),
      db.customer.deleteMany(),
      db.product.deleteMany(),
      db.blogPost.deleteMany(),
      db.category.deleteMany(),
      db.siteSetting.deleteMany(),
      db.heroSlide.deleteMany(),
      db.testimonial.deleteMany(),
      db.shippingOption.deleteMany(),
      db.coupon.deleteMany(),
    ]);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("POST /api/admin/database error:", e);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
