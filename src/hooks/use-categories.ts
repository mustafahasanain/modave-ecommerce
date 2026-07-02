"use client";
import { useState, useEffect, useCallback } from "react";
import { collections as staticCats } from "@/data/products";

export function useCategories() {
  const [categories, setCategories] = useState(staticCats);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      if (data.categories?.length > 0) setCategories(data.categories);
    } catch {}
    setLoading(false);
  }, []);
  useEffect(() => { refetch(); }, [refetch]);
  return { categories, loading, refetch };
}
