"use client";

import { useState, useEffect, useCallback } from "react";
import { products as staticProducts, type Product } from "@/data/products";

interface UseProducts {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Normalizes a DB product record into the Product shape the storefront expects.
function normalize(p: Record<string, unknown>): Product {
  return {
    id: p.id as number,
    name: p.name as string,
    nameAr: (p.nameAr as string) || (p.name as string),
    category: p.category as string,
    categoryAr: (p.categoryAr as string) || (p.category as string),
    price: p.price as number,
    originalPrice: (p.originalPrice as number | null) ?? undefined,
    discount: (p.discount as number | null) ?? undefined,
    rating: (p.rating as number) || 0,
    reviews: (p.reviews as number) || 0,
    sold: (p.sold as number) || 0,
    images: p.images as string[],
    colors: p.colors as { name: string; hex: string }[],
    sizes: p.sizes as string[],
    description: (p.description as string) || "",
    descriptionAr: (p.descriptionAr as string) || "",
    badge: (p.badge as "sale" | "new" | "hot" | undefined) ?? undefined,
    vendor: (p.vendor as string) || "Modave",
    sku: (p.sku as string) || "",
    stock: (p.stock as number) || 0,
    featured: (p.featured as boolean) ?? undefined,
    bestSeller: (p.bestSeller as boolean) ?? undefined,
    newArrival: (p.newArrival as boolean) ?? undefined,
  };
}

/**
 * Fetches products from the public /api/products API.
 * Falls back to the static product data if the API fails (e.g. during SSR or DB issues),
 * so the storefront always renders.
 */
export function useProducts(): UseProducts {
  const [products, setProducts] = useState<Product[]>(staticProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      const normalized = (data.products as Record<string, unknown>[]).map(normalize);
      // A successful empty response is a legitimate empty store (for example
      // after an admin reset), not an API failure that should restore demos.
      setProducts(normalized);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      // Keep the static fallback already set as initial state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { products, loading, error, refetch };
}

/**
 * Fetches a single product by id from the public API.
 * Falls back to the static product data.
 */
export function useProduct(id: number | null): {
  product: Product | null;
  loading: boolean;
} {
  // Lazy initializer: use static data immediately for SSR + first render
  const [product, setProduct] = useState<Product | null>(() =>
    id != null ? staticProducts.find((p) => p.id === id) ?? null : null
  );
  const [fetched, setFetched] = useState(false);
  const loading = id != null && !fetched;

  useEffect(() => {
    if (id == null) return;
    let cancelled = false;
    const controller = new AbortController();
    fetch(`/api/products`, { cache: "no-store", signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const found = (data.products as Record<string, unknown>[]).find((p) => p.id === id);
        setProduct(found ? normalize(found) : null);
        setFetched(true);
      })
      .catch((e) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        // keep static fallback
        setFetched(true);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [id]);

  return { product, loading };
}
