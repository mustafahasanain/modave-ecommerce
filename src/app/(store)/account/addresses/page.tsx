"use client";

import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import { CustomerGate } from "@/components/account/customer-gate";
import { Button } from "@/components/ui/button";

export default function AddressesPage() {
  return <CustomerGate>{(customer) => (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:py-14">
      <Link href="/account" className="text-sm text-muted-foreground hover:text-foreground">← Back to account</Link>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">Addresses</h1>
      <p className="mt-2 text-sm text-muted-foreground">Manage the addresses you use at checkout.</p>
      <div className="mt-8 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
        <MapPin className="mx-auto h-9 w-9 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">No saved addresses</h2>
        <p className="mt-2 text-sm text-muted-foreground">Your checkout details will be available here once address saving is enabled for {customer.email}.</p>
        <Button asChild className="mt-5 rounded-full"><Link href="/checkout"><Plus /> Add an address</Link></Button>
      </div>
    </div>
  )}</CustomerGate>;
}
