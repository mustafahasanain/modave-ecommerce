import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "modave_admin_session";
const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 7 * 1000; // 7 days

// Uses Web Crypto (crypto.subtle) instead of Node's `crypto` module because
// this file is imported by middleware.ts, which runs on the Edge runtime.
function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "ADMIN_SESSION_SECRET must be set in production. Generate one with `openssl rand -hex 32`."
    );
  }
  return "modave-development-only-admin-secret-do-not-use-in-production";
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(payload: string): Promise<string> {
  const key = await hmacKey(getSecret());
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toHex(signature);
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Creates a signed, expiring session token: `${adminId}.${expiresAt}.${signature}`.
export async function createSessionCookie(adminId: string): Promise<string> {
  const payload = `${adminId}.${Date.now() + SESSION_MAX_AGE_MS}`;
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

export async function isValidSession(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [adminId, expiresAt, signature] = parts;
  if (!adminId || !expiresAt || !signature) return false;
  if (!Number.isFinite(Number(expiresAt)) || Number(expiresAt) < Date.now()) return false;
  const expected = await sign(`${adminId}.${expiresAt}`);
  return timingSafeEqualHex(signature, expected);
}

// Extracts the admin id from an already-validated session token.
export function getAdminIdFromSession(value: string | undefined): string | null {
  if (!value) return null;
  const [adminId] = value.split(".");
  return adminId || null;
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

export function redirectToLogin(req: NextRequest): NextResponse {
  const loginUrl = new URL("/admin/login", req.url);
  loginUrl.searchParams.set("from", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}
