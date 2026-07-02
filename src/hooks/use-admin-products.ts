"use client";

import { useState, useEffect, useCallback } from "react";
import type { Product } from "@/data/products";

interface UseAdminProducts {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createProduct: (data: Partial<Product> & { name: string; price: number; stock?: number; category?: string; status?: string }) => Promise<boolean>;
  updateProduct: (id: number, data: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
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
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      await refetch();
      return true;
    } catch {
      return false;
    }
  }, [refetch]);

  const updateProduct: UseAdminProducts["updateProduct"] = useCallback(async (id, data) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      await refetch();
      return true;
    } catch {
      return false;
    }
  }, [refetch]);

  const deleteProduct: UseAdminProducts["deleteProduct"] = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await refetch();
      return true;
    } catch {
      return false;
    }
  }, [refetch]);

  return { products, loading, error, refetch, createProduct, updateProduct, deleteProduct };
}
