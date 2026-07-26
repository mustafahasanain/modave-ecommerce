import { NextRequest } from "next/server";

// Behind a reverse proxy (or on a plain-HTTP demo box) `req.nextUrl.protocol`
// reflects what the proxy/server saw, not what the client actually used, so we
// also check the standard forwarded-proto header set by most proxies/CDNs.
export function isSecureRequest(req: NextRequest): boolean {
  if (req.nextUrl.protocol === "https:") return true;
  const forwardedProto = req.headers.get("x-forwarded-proto");
  return forwardedProto?.split(",")[0]?.trim() === "https";
}
