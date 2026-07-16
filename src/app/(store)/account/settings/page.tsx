"use client";

import Link from "next/link";
import { Mail, Phone, UserRound } from "lucide-react";
import { CustomerGate } from "@/components/account/customer-gate";

export default function AccountSettingsPage() {
  return <CustomerGate>{(customer) => (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:py-14">
      <Link href="/account" className="text-sm text-muted-foreground hover:text-foreground">← Back to account</Link>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">Account Settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">Your profile and contact details.</p>
      <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
        <Detail icon={<UserRound className="h-5 w-5" />} label="Name" value={customer.name} />
        <Detail icon={<Mail className="h-5 w-5" />} label="Email address" value={customer.email} />
        <Detail icon={<Phone className="h-5 w-5" />} label="Phone" value={customer.phone || "Not provided"} />
      </div>
    </div>
  )}</CustomerGate>;
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-center gap-4 p-5"><span className="text-muted-foreground">{icon}</span><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 font-medium">{value}</p></div></div>;
}
