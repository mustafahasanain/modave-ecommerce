"use client";
import { useState, useEffect, useCallback } from "react";

/**
 * Default site settings used for the very first client render (matches the
 * values seeded by the orchestrator) so SSR/initial markup is stable and
 * there's no hydration mismatch. The real values are fetched from
 * `/api/settings` on mount and override these defaults.
 *
 * Business-logic keys (added when the hardcoded coupon/countdown/size-guide
 * values were moved into the DB):
 *   - `freeShipThreshold`     (default "70")  — free shipping subtotal threshold.
 *   - `cartCountdownMinutes`  (default "15")  — cart-expiry countdown duration.
 *   - `discountThreshold`     (default "200") — auto-discount qualifying subtotal.
 *   - `discountPercentage`    (default "10")  — auto-discount percent off.
 *   - `maxDiscount`           (default "80")  — auto-discount hard cap.
 *   - `countdownHours`        (default "48")  — HOT SALE product-card countdown window.
 *   - `sizeGuide`             (default JSON)  — `[{size, chest, waist, hips}]` rows.
 */
const DEFAULT_SIZE_GUIDE = JSON.stringify([
  { size: "S", chest: "84-88", waist: "64-68", hips: "90-94" },
  { size: "M", chest: "88-92", waist: "68-72", hips: "94-98" },
  { size: "L", chest: "92-96", waist: "72-76", hips: "98-102" },
  { size: "XL", chest: "96-102", waist: "76-82", hips: "102-108" },
  { size: "XXL", chest: "102-108", waist: "82-88", hips: "108-114" },
]);

const fallback: Record<string, string> = {
  logoText: "Modave", phone: "315-666-6688", email: "themesflat@gmail.com",
  address: "549 Oak St. Crystal Lake, IL 60014",
  announcement1: "FREE SHIPPING ON ALL ORDERS OVER $20.00",
  announcement2: "RETURNS ARE FREE WITHIN 14 DAYS",
  freeShipThreshold: "70", instagramHandle: "@modave",
  cartCountdownMinutes: "15",
  discountThreshold: "200",
  discountPercentage: "10",
  maxDiscount: "80",
  countdownHours: "48",
  sizeGuide: DEFAULT_SIZE_GUIDE,
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<Record<string, string>>(fallback);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      if (data.settings) setSettings({ ...fallback, ...data.settings });
    } catch {}
    setLoading(false);
  }, []);
  useEffect(() => { refetch(); }, [refetch]);
  return { settings, loading, refetch };
}
