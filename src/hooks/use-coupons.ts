"use client";

import { useEffect, useState } from "react";

/**
 * Public coupon shape returned by `/api/coupons`.
 * `type` is "percentage" (value = percent off, e.g. 10 = 10%) or
 * "fixed" (value = flat currency amount off).
 */
export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  active: boolean;
  expiresAt?: string | null;
}

/**
 * Fetch the list of active coupons from the public `/api/coupons` endpoint.
 *
 * Used by storefront cart/checkout pages to compute discounts dynamically
 * (instead of hardcoding coupon codes like "MODEVE10").
 *
 * Returns `{ coupons, loading }`. Failures degrade gracefully to an empty
 * list so the UI never breaks if the API is unreachable.
 */
export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/coupons", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { coupons: [] }))
      .then((data: { coupons?: Coupon[] }) => {
        if (cancelled) return;
        setCoupons(Array.isArray(data.coupons) ? data.coupons : []);
      })
      .catch(() => {
        if (!cancelled) setCoupons([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { coupons, loading };
}
