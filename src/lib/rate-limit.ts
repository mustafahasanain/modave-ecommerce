interface Bucket {
  count: number;
  resetAt: number;
}

// In-memory fixed-window limiter. Per-process only — resets on restart and
// isn't shared across instances. That's acceptable for this single-instance
// deployment; a multi-instance deployment would need a shared store (e.g.
// Redis) instead.
const buckets = new Map<string, Bucket>();

function purgeExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/** Returns true if the request under `key` is allowed within the current window. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (buckets.size > 5000) purgeExpired(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
