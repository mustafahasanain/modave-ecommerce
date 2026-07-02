"use client";
import { useState, useEffect, useCallback } from "react";

const fallback = [
  { id: 1, label: "Free Shipping", labelAr: "شحن مجاني", price: 0, active: true },
  { id: 2, label: "Local", labelAr: "محلي", price: 35, active: true },
  { id: 3, label: "Flat Rate", labelAr: "سعر ثابت", price: 35, active: true },
];

export function useShippingOptions() {
  const [options, setOptions] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/shipping", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      if (data.options?.length > 0) setOptions(data.options);
    } catch {}
    setLoading(false);
  }, []);
  useEffect(() => { refetch(); }, [refetch]);
  return { options, loading, refetch };
}
