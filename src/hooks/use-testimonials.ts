"use client";
import { useState, useEffect, useCallback } from "react";

const fallback = [
  { text: "Fantastic shop! Great selection and fair prices.", name: "Sybil Sharp", role: "Verified Buyer", product: "Contrasting sheepskin sweatshirt", price: "$60.00", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80" },
];

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/testimonials", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setTestimonials(data.testimonials || []);
    } catch {}
    setLoading(false);
  }, []);
  useEffect(() => { refetch(); }, [refetch]);
  return { testimonials, loading, refetch };
}
