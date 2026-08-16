"use client";

import { useState, useEffect, useCallback } from "react";

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  orders: number;
  totalSpent: number;
  tier: string;
  joinedAt: string;
}

export interface CustomerEditableFields {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

/** `null` means the write succeeded; a string is the reason it didn't. */
type WriteResult = Promise<string | null>;

interface UseAdminCustomers {
  customers: AdminCustomer[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateCustomer: (id: string, data: CustomerEditableFields) => WriteResult;
  deleteCustomer: (id: string) => WriteResult;
}

/**
 * The API answers a failed write with `{ error }` describing the exact
 * validation failure (e.g. a duplicate email). Surfacing it beats a generic
 * "Failed to update", which would leave an admin unable to tell why it failed.
 */
async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return typeof body?.error === "string" && body.error ? body.error : fallback;
  } catch {
    return fallback;
  }
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

  const updateCustomer: UseAdminCustomers["updateCustomer"] = useCallback(async (id, data) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await readError(res, "Failed to update customer"));
      await refetch();
      return null;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to update customer";
      setError(message);
      return message;
    }
  }, [refetch]);

  const deleteCustomer: UseAdminCustomers["deleteCustomer"] = useCallback(async (id) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await readError(res, "Failed to delete customer"));
      await refetch();
      return null;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to delete customer";
      setError(message);
      return message;
    }
  }, [refetch]);

  return { customers, loading, error, refetch, updateCustomer, deleteCustomer };
}
