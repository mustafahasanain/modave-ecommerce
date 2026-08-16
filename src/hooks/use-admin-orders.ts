"use client";

import { useState, useEffect, useCallback } from "react";

const ADMIN_ORDERS_CHANGED_EVENT = "admin-orders-changed";

export function notifyAdminOrdersChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ADMIN_ORDERS_CHANGED_EVENT));
  }
}

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

interface UseAdminOrdersOptions {
  refreshInterval?: number;
}

export function useAdminOrders(
  statusFilter?: string,
  { refreshInterval = 0 }: UseAdminOrdersOptions = {}
): UseAdminOrders {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
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
    void fetchOrders();

    const refreshInBackground = () => void fetchOrders(false);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refreshInBackground();
    };

    window.addEventListener(ADMIN_ORDERS_CHANGED_EVENT, refreshInBackground);
    window.addEventListener("focus", refreshInBackground);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    const intervalId = refreshInterval
      ? window.setInterval(refreshInBackground, refreshInterval)
      : undefined;

    return () => {
      window.removeEventListener(ADMIN_ORDERS_CHANGED_EVENT, refreshInBackground);
      window.removeEventListener("focus", refreshInBackground);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, [fetchOrders, refreshInterval]);

  const refetch = useCallback(() => fetchOrders(true), [fetchOrders]);

  return { orders, loading, error, refetch };
}
