import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, isValidSession, redirectToLogin } from "@/lib/auth";

const CUSTOMER_SESSION_COOKIE = "modave_customer_session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Do not serve the account dashboard unless a customer session exists. The
  // dashboard also verifies the signed session and expiry before rendering.
  if (
    pathname.startsWith("/account") &&
    pathname !== "/account/login" &&
    pathname !== "/account/register" &&
    !req.cookies.has(CUSTOMER_SESSION_COOKIE)
  ) {
    const loginUrl = new URL("/account/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect all /admin PAGE routes EXCEPT /admin/login
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const session = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!(await isValidSession(session))) {
      return redirectToLogin(req);
    }
  }

  // Protect all /api/admin/ API routes EXCEPT /api/admin/auth (login/logout)
  if (pathname.startsWith("/api/admin/") && !pathname.startsWith("/api/admin/auth")) {
    const session = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!(await isValidSession(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // If already authenticated and visiting /admin/login, redirect to /admin
  if (pathname === "/admin/login") {
    const session = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (await isValidSession(session)) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/account/:path*"],
};
