import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";
import { isSecureRequest } from "@/lib/request-protocol";

const COOKIE_NAME = "modave_customer_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function getSessionSecret(): string {
  const secret = process.env.CUSTOMER_SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "CUSTOMER_SESSION_SECRET must be set in production. Generate one with `openssl rand -hex 32`."
    );
  }
  return "modave-development-only-customer-secret-do-not-use-in-production";
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const derivedHash = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derivedHash, "hex"));
}

export function createCustomerSession(customerId: string) {
  const payload = `${customerId}.${Date.now() + SESSION_MAX_AGE * 1000}`;
  const signature = createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function getCustomerIdFromSession(value: string | undefined) {
  if (!value) return null;
  const [customerId, expiresAt, signature] = value.split(".");
  if (!customerId || !expiresAt || !signature || Number(expiresAt) < Date.now()) return null;
  const payload = `${customerId}.${expiresAt}`;
  const expected = createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  return customerId;
}

export const customerSessionCookie = {
  name: COOKIE_NAME,
  options: (req: NextRequest) => ({
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isSecureRequest(req),
    maxAge: SESSION_MAX_AGE,
    path: "/",
  }),
};
