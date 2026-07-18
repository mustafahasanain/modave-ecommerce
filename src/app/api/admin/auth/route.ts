import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/admin-auth";
import { createSessionCookie, SESSION_COOKIE_NAME, isValidSession } from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { adminAuthSchema, parseJson } from "@/lib/validation";

// POST /api/admin/auth — login
export async function POST(req: NextRequest) {
  if (!rateLimit(`admin-login:${getClientIp(req)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429 });
  }

  const parsed = await parseJson(req, adminAuthSchema);
  if (parsed.error) return parsed.error;
  const { email, password } = parsed.data;

  try {
    const admin = await authenticateAdmin(email, password);
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const res = NextResponse.json({ success: true, admin: { id: admin.id, name: admin.name, email: admin.email } });
    res.cookies.set(SESSION_COOKIE_NAME, await createSessionCookie(admin.id), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
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
export async function GET(req: NextRequest) {
  const session = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return NextResponse.json({ authenticated: await isValidSession(session) });
}
