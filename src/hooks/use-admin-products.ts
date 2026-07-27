"use client";

import { useState, useEffect, useCallback } from "react";
import type { Product } from "@/data/products";

/** `null` means the write succeeded; a string is the reason it didn't. */
type WriteResult = Promise<string | null>;

interface UseAdminProducts {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createProduct: (data: Partial<Product> & { name: string; price: number; stock?: number; category?: string; status?: string }) => WriteResult;
  updateProduct: (id: number, data: Partial<Product>) => WriteResult;
  deleteProduct: (id: number) => WriteResult;
}

/**
 * The API answers a failed write with `{ error }` describing the exact
 * validation failure. Surfacing it beats a generic "Failed to create", which
 * left an admin with no way to tell that, say, the category was never picked.
 */
async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return typeof body?.error === "string" && body.error ? body.error : fallback;
  } catch {
    return fallback;
  }
}

export function useAdminProducts(): UseAdminProducts {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProducts(data.products);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createProduct: UseAdminProducts["createProduct"] = useCallback(async (data) => {
    setError(null);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await readError(res, "Failed to create product"));
      await refetch();
      return null;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create product";
      setError(message);
      return message;
    }
  }, [refetch]);

  const updateProduct: UseAdminProducts["updateProduct"] = useCallback(async (id, data) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await readError(res, "Failed to update product"));
      await refetch();
      return null;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to update product";
      setError(message);
      return message;
    }
  }, [refetch]);

  const deleteProduct: UseAdminProducts["deleteProduct"] = useCallback(async (id) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await readError(res, "Failed to delete product"));
      await refetch();
      return null;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to delete product";
      setError(message);
      return message;
    }
  }, [refetch]);

  return { products, loading, error, refetch, createProduct, updateProduct, deleteProduct };
}
