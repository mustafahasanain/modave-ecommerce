"use client";
import { useState, useEffect, useCallback } from "react";

const fallback = [
  { image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80", eyebrow: "Summer 2024", eyebrowAr: "صيف 2024", title: "Collection", titleAr: "المجموعة", subtitle: "Fresh styles just in!", subtitleAr: "إطلالات جديدة!", cta: "Explore", ctaAr: "استكشف", href: "/shop" },
];

export function useHeroSlides() {
  const [slides, setSlides] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hero", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      if (data.slides?.length > 0) setSlides(data.slides);
    } catch {}
    setLoading(false);
  }, []);
  useEffect(() => { refetch(); }, [refetch]);
  return { slides, loading, refetch };
}
