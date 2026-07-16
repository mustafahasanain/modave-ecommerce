"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type Customer = { id: string; name: string; email: string; phone: string | null };

export function CustomerGate({ children }: { children: (customer: Customer) => React.ReactNode }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/account/auth")
      .then((response) => response.json())
      .then((data) => {
        if (data.customer) setCustomer(data.customer);
        else router.replace("/account/login?from=/account");
      })
      .catch(() => router.replace("/account/login?from=/account"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !customer) return null;
  return <>{children(customer)}</>;
}
