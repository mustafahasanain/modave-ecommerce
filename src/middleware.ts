import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, isValidSession, redirectToLogin } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /admin PAGE routes EXCEPT /admin/login
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const session = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!isValidSession(session)) {
      return redirectToLogin(req);
    }
  }

  // Protect all /api/admin/ API routes EXCEPT /api/admin/auth (login/logout)
  if (pathname.startsWith("/api/admin/") && !pathname.startsWith("/api/admin/auth")) {
    const session = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!isValidSession(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // If already authenticated and visiting /admin/login, redirect to /admin
  if (pathname === "/admin/login") {
    const session = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (isValidSession(session)) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
