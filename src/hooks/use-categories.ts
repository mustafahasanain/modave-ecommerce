"use client";
import { useState, useEffect, useCallback } from "react";
import { collections as staticCats } from "@/data/products";

export interface StoreCategory {
  id?: number;
  name: string;
  nameAr: string;
  image: string;
  count?: number;
  itemCount?: number;
  slug?: string;
  active?: boolean;
}

export function useCategories() {
  const [categories, setCategories] = useState<StoreCategory[]>(staticCats);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      // Preserve the static fallback only for an actual request failure. An
      // empty response means the administrator intentionally has no categories.
      setCategories(data.categories || []);
    } catch {}
    setLoading(false);
  }, []);
  useEffect(() => { refetch(); }, [refetch]);
  return { categories, loading, refetch };
}
