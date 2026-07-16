"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Package, ShoppingBag } from "lucide-react";
import { CustomerGate } from "@/components/account/customer-gate";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

type Order = { id: string; orderNumber: string; total: number; status: string; createdAt: string };

export default function OrdersPage() {
  return <CustomerGate>{() => <OrdersContent />}</CustomerGate>;
}

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((response) => response.ok ? response.json() : { orders: [] })
      .then((data) => setOrders(data.orders ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:py-14">
      <Link href="/account" className="text-sm text-muted-foreground hover:text-foreground">← Back to account</Link>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">My Orders</h1>
      <p className="mt-2 text-sm text-muted-foreground">Track your purchases and their delivery status.</p>
      <div className="mt-8 space-y-3">
        {loading ? <p className="text-sm text-muted-foreground">Loading orders…</p> : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <Package className="mx-auto h-9 w-9 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">No orders yet</h2>
            <Button asChild className="mt-5 rounded-full"><Link href="/shop"><ShoppingBag /> Start shopping</Link></Button>
          </div>
        ) : orders.map((order) => (
          <div key={order.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
            <div><p className="font-semibold">{order.orderNumber}</p><p className="mt-1 text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p></div>
            <div className="text-end"><p className="font-semibold">{formatPrice(order.total)}</p><p className="mt-1 text-sm capitalize text-muted-foreground">{order.status}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
