"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Mail, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { formatPrice } from "@/lib/format";
import { useAdminCustomers, type AdminCustomer } from "@/hooks/use-admin-customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TierKey = "VIP" | "Regular" | "New";

const tierStyles: Record<TierKey, { label: string; className: string }> = {
  VIP: {
    label: "VIP",
    className: "border-transparent bg-[var(--sale)]/10 text-[var(--sale)]",
  },
  Regular: {
    label: "Regular",
    className: "border-transparent bg-foreground/5 text-foreground",
  },
  New: {
    label: "New",
    className: "border-transparent bg-secondary text-muted-foreground",
  },
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatJoined(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function AdminCustomersPage() {
  const { t, locale } = useLanguage();
  const [search, setSearch] = useState("");
  const { customers, loading } = useAdminCustomers();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [search, customers]);

  // Aggregate stats
  const totalSpent = customers.reduce((s, c) => s + c.totalSpent, 0);
  const totalOrders = customers.reduce((s, c) => s + c.orders, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {t.admin.dashboard}
        </span>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t.admin.customers}
        </h1>
      </motion.div>

      {/* Stat strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="grid grid-cols-2 gap-4 sm:grid-cols-3"
      >
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {t.admin.totalCustomers}
            </p>
            <p className="mt-1 font-display text-2xl font-semibold">{customers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {locale === "ar" ? "إجمالي الإنفاق" : "Total Spent"}
            </p>
            <p className="mt-1 font-display text-2xl font-semibold">
              {formatPrice(totalSpent)}
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {locale === "ar" ? "إجمالي الطلبات" : "Total Orders"}
            </p>
            <p className="mt-1 font-display text-2xl font-semibold">
              {totalOrders}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 gap-4 flex-wrap">
            <CardTitle className="font-display text-xl">
              {locale === "ar" ? "كل العملاء" : "All Customers"}
              <span className="ms-2 text-sm font-normal text-muted-foreground">
                ({filtered.length})
              </span>
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  locale === "ar" ? "بحث عن عميل..." : "Search customers..."
                }
                className="ps-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop table */}
            <div className="hidden overflow-x-auto custom-scroll md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="ps-6 text-[10px] uppercase tracking-[0.15em]">
                      {t.admin.customer}
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.15em]">
                      {locale === "ar" ? "الطلبات" : "Orders"}
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.15em]">
                      {locale === "ar" ? "إجمالي الإنفاق" : "Total Spent"}
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.15em]">
                      {locale === "ar" ? "تاريخ الانضمام" : "Joined"}
                    </TableHead>
                    <TableHead className="pe-6 text-[10px] uppercase tracking-[0.15em]">
                      {locale === "ar" ? "المستوى" : "Tier"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={`skel-${i}`}>
                        <TableCell colSpan={5} className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-9 animate-pulse rounded-full bg-secondary" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 w-32 animate-pulse rounded bg-secondary" />
                              <div className="h-2.5 w-48 animate-pulse rounded bg-secondary" />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-16 text-center text-muted-foreground">
                        {locale === "ar" ? "لا يوجد عملاء" : "No customers found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((c: AdminCustomer) => {
                      const tier = (c.tier as TierKey) || "New";
                      const st = tierStyles[tier];
                      return (
                        <TableRow key={c.id} className="text-sm">
                          <TableCell className="ps-6">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-foreground/5 text-foreground font-medium">
                                  {initials(c.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="truncate font-medium">{c.name}</p>
                                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Mail className="size-3" />
                                  <span className="truncate">{c.email}</span>
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1.5">
                              <ShoppingCart className="size-3.5 text-muted-foreground" />
                              {c.orders}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatPrice(c.totalSpent)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatJoined(c.joinedAt, locale)}
                          </TableCell>
                          <TableCell className="pe-6">
                            <Badge variant="outline" className={st.className}>
                              {st.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y md:hidden">
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {locale === "ar" ? "جارٍ التحميل..." : "Loading..."}
                </div>
              ) : (
                filtered.map((c: AdminCustomer) => {
                  const tier = (c.tier as TierKey) || "New";
                  const st = tierStyles[tier];
                  return (
                    <div key={c.id} className="flex items-center gap-3 p-4">
                      <Avatar className="size-11">
                        <AvatarFallback className="bg-foreground/5 text-foreground font-medium">
                          {initials(c.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-medium">{c.name}</p>
                          <Badge variant="outline" className={st.className}>
                            {st.label}
                          </Badge>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {c.email}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <ShoppingCart className="size-3" />
                            {c.orders} {locale === "ar" ? "طلب" : "orders"}
                          </span>
                          <span className="font-medium text-foreground">
                            {formatPrice(c.totalSpent)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {filtered.length === 0 && (
                <div className="py-16 text-center text-sm text-muted-foreground">
                  {locale === "ar" ? "لا يوجد عملاء" : "No customers found"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
