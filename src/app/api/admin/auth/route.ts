import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/admin-auth";
import { createSessionCookie, SESSION_COOKIE_NAME, isValidSession } from "@/lib/auth";

// POST /api/admin/auth — login
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    const admin = await authenticateAdmin(email, password);
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const res = NextResponse.json({ success: true, admin: { id: admin.id, name: admin.name, email: admin.email } });
    res.cookies.set(SESSION_COOKIE_NAME, createSessionCookie(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

// DELETE /api/admin/auth — logout
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}

// GET /api/admin/auth — check session status
export async function GET() {
  // This runs server-side; the middleware already validates the cookie for protected routes.
  // For a simple status check, return ok (the cookie check is done client-side via the login redirect).
  return NextResponse.json({ authenticated: true });
}

// Re-export for middleware convenience
export { isValidSession };
