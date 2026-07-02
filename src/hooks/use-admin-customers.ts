"use client";

import { useState, useEffect, useCallback } from "react";

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  orders: number;
  totalSpent: number;
  tier: string;
  joinedAt: string;
}

interface UseAdminCustomers {
  customers: AdminCustomer[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAdminCustomers(): UseAdminCustomers {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/customers", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setCustomers(data.customers);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { customers, loading, error, refetch };
}
