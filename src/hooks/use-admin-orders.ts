"use client";

import { useState, useEffect, useCallback } from "react";

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  country: string;
  town: string;
  street: string;
  postal: string | null;
  items: string; // JSON
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  status: string;
  estimatedDelivery: string | null;
  createdAt: string;
}

interface UseAdminOrders {
  orders: AdminOrder[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAdminOrders(statusFilter?: string): UseAdminOrders {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = statusFilter && statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/admin/orders${qs}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.orders);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { orders, loading, error, refetch };
}
