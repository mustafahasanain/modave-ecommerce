"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Wallet,
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
  TrendingUp,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { useAdminOrders, type AdminOrder } from "@/hooks/use-admin-orders";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type OrderStatus = "paid" | "pending" | "cancelled";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type RangeKey = "3m" | "6m" | "8m" | "1y";
const RANGE_COUNT: Record<RangeKey, number> = {
  "3m": 3,
  "6m": 6,
  "8m": 8,
  "1y": 12,
};

const statusStyles: Record<OrderStatus, { label: string; className: string }> = {
  paid: {
    label: "Paid",
    className: "border-transparent bg-foreground/5 text-foreground",
  },
  pending: {
    label: "Pending",
    className: "border-transparent bg-[var(--sale)]/10 text-[var(--sale)]",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-transparent bg-destructive/10 text-destructive",
  },
};

function normalizeStatus(status: string): OrderStatus {
  if (status === "pending" || status === "cancelled" || status === "paid") return status;
  return "pending";
}

function buildMonthlyBuckets(orders: AdminOrder[], count: number) {
  const buckets: { month: string; key: string; sales: number }[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    buckets.push({ month: MONTH_NAMES[d.getMonth()], key, sales: 0 });
  }
  for (const o of orders) {
    const d = new Date(o.createdAt);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = buckets.find((b) => b.key === key);
    if (bucket) bucket.sales += Number(o.total) || 0;
  }
  return buckets.map(({ month, sales }) => ({ month, sales: Math.round(sales) }));
}

function formatDate(iso: string, locale: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  delay,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  trend: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2 min-w-0">
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {label}
              </span>
              <span className="font-display text-3xl font-semibold tracking-tight">
                {value}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground/70">
                <span className="inline-flex items-center gap-0.5 rounded-full bg-foreground/5 px-1.5 py-0.5 text-[var(--sale)]">
                  <ArrowUpRight className="size-3" />
                  {trend}
                </span>
                <span className="text-muted-foreground">vs last month</span>
              </span>
            </div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
              <Icon className="size-5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const { t, locale } = useLanguage();
  const [range, setRange] = useState<RangeKey>("8m");
  const { orders, loading } = useAdminOrders();

  const chartData = useMemo(
    () => buildMonthlyBuckets(orders, RANGE_COUNT[range]),
    [orders, range]
  );

  const recentOrders = useMemo(() => {
    return orders
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)
      .map((o) => ({
        id: o.orderNumber || o.id,
        customer: o.customerName,
        date: formatDate(o.createdAt, locale),
        amount: Number(o.total) || 0,
        status: normalizeStatus(o.status),
      }));
  }, [orders, locale]);

  const totals = useMemo(() => {
    const totalSales = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const totalOrders = orders.length;
    const uniqueCustomers = new Set(
      orders.map((o) => o.customerEmail?.toLowerCase()).filter(Boolean)
    ).size;
    const paidOrders = orders.filter((o) => normalizeStatus(o.status) === "paid");
    const lastMonth = (() => {
      const now = new Date();
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return `${lm.getFullYear()}-${lm.getMonth()}`;
    })();
    const thisMonth = (() => {
      const now = new Date();
      return `${now.getFullYear()}-${now.getMonth()}`;
    })();
    const lastMonthSales = paidOrders
      .filter((o) => {
        const d = new Date(o.createdAt);
        return `${d.getFullYear()}-${d.getMonth()}` === lastMonth;
      })
      .reduce((s, o) => s + (Number(o.total) || 0), 0);
    const thisMonthSales = paidOrders
      .filter((o) => {
        const d = new Date(o.createdAt);
        return `${d.getFullYear()}-${d.getMonth()}` === thisMonth;
      })
      .reduce((s, o) => s + (Number(o.total) || 0), 0);
    const salesTrendPct =
      lastMonthSales > 0
        ? `${((thisMonthSales - lastMonthSales) / lastMonthSales) * 100 >= 0 ? "+" : ""}${(((thisMonthSales - lastMonthSales) / lastMonthSales) * 100).toFixed(1)}%`
        : "+0.0%";
    return {
      totalSales,
      totalOrders,
      uniqueCustomers,
      salesTrendPct,
    };
  }, [orders]);

  const topProducts = [...products]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5)
    .map((p) => ({
      ...p,
      revenue: p.sold * p.price,
      name: locale === "ar" ? p.nameAr : p.name,
    }));

  // Category breakdown for the bar chart
  const categoryData = (() => {
    const map = new Map<string, number>();
    for (const p of products) {
      const cat = locale === "ar" ? p.categoryAr : p.category;
      map.set(cat, (map.get(cat) ?? 0) + p.sold * p.price);
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  })();

  const stats = [
    { icon: Wallet, label: t.admin.totalSales, value: formatPrice(totals.totalSales), trend: totals.salesTrendPct },
    { icon: ShoppingCart, label: t.admin.totalOrders, value: totals.totalOrders.toLocaleString(), trend: "+0.0%" },
    { icon: Package, label: t.admin.totalProducts, value: String(products.length), trend: "+0.0%" },
    { icon: Users, label: t.admin.totalCustomers, value: totals.uniqueCustomers.toLocaleString(), trend: "+0.0%" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 lg:space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {t.admin.overview}
        </span>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t.admin.welcome}
        </h1>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.08} />
        ))}
      </div>

      {/* Sales chart + top products */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 flex-wrap gap-3">
              <div>
                <CardTitle className="font-display text-xl">
                  {t.admin.salesOverview}
                </CardTitle>
                <CardDescription className="mt-1">
                  {locale === "ar" ? "أداء المبيعات" : "Sales performance"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-2.5 py-1 text-xs font-medium text-foreground/70">
                  <TrendingUp className="size-3.5 text-[var(--sale)]" />
                  {totals.salesTrendPct}
                </span>
                <div className="flex items-center rounded-full border border-border p-0.5">
                  {([
                    { k: "3m", l: "3M" },
                    { k: "6m", l: "6M" },
                    { k: "8m", l: "8M" },
                    { k: "1y", l: "1Y" },
                  ] as { k: RangeKey; l: string }[]).map((opt) => (
                    <button
                      key={opt.k}
                      onClick={() => setRange(opt.k)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        range === opt.k
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full sm:h-[320px]">
                {loading ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <Loader2 className="size-5 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 8, left: -16, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--foreground)" stopOpacity={0.18} />
                          <stop offset="100%" stopColor="var(--foreground)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `$${v / 1000}k`}
                      />
                      <Tooltip
                        cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                        contentStyle={{
                          background: "var(--popover)",
                          border: "1px solid var(--border)",
                          borderRadius: "0.375rem",
                          fontSize: "12px",
                          color: "var(--popover-foreground)",
                        }}
                        formatter={(value: number) => [formatPrice(value), "Sales"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="var(--foreground)"
                        strokeWidth={2}
                        fill="url(#salesFill)"
                        dot={{ r: 0 }}
                        activeDot={{
                          r: 4,
                          fill: "var(--sale)",
                          stroke: "var(--background)",
                          strokeWidth: 2,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-display text-xl">
                {t.admin.topProducts}
              </CardTitle>
              <CardDescription>Best sellers this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-5 text-center font-display text-lg font-semibold text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-secondary">
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.sold} {locale === "ar" ? "وحدة" : "units"}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold">
                    {formatPrice(p.revenue)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Category breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">
              {locale === "ar" ? "الأداء حسب الفئة" : "Sales by Category"}
            </CardTitle>
            <CardDescription>
              {locale === "ar" ? "أعلى الفئات إيراداً هذا الموسم" : "Top-performing categories this season"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--accent)" }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--background)",
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [formatPrice(v), locale === "ar" ? "الإيراد" : "Revenue"]}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
                    {categoryData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i === 0 ? "var(--sale)" : "var(--foreground)"}
                        fillOpacity={i === 0 ? 1 : 0.85 - i * 0.1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">
              {t.admin.recentOrders}
            </CardTitle>
            <CardDescription>Latest 6 transactions</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto custom-scroll">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="ps-6 text-[10px] uppercase tracking-[0.15em]">
                      {t.admin.order}
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.15em]">
                      {t.admin.customer}
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.15em]">
                      {t.admin.date}
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.15em]">
                      {t.admin.amount}
                    </TableHead>
                    <TableHead className="pe-6 text-[10px] uppercase tracking-[0.15em]">
                      {t.admin.status}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                        <Loader2 className="mx-auto size-5 animate-spin" />
                      </TableCell>
                    </TableRow>
                  ) : recentOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                        {locale === "ar" ? "لا توجد طلبات بعد" : "No orders yet"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentOrders.map((o) => {
                      const st = statusStyles[o.status];
                      return (
                        <TableRow key={o.id} className="text-sm">
                          <TableCell className="ps-6 font-medium font-mono">
                            {o.id}
                          </TableCell>
                          <TableCell>{o.customer}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {o.date}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatPrice(o.amount)}
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
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
