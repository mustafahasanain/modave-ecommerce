import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "modave_admin_session";
const SESSION_VALUE = "authenticated";

export function createSessionCookie(): string {
  return SESSION_VALUE;
}

export function isValidSession(value: string | undefined): boolean {
  return value === SESSION_VALUE;
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

export function redirectToLogin(req: NextRequest): NextResponse {
  const loginUrl = new URL("/admin/login", req.url);
  loginUrl.searchParams.set("from", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}
