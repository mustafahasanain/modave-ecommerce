"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Loader2,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { Product } from "@/data/products";
import type { AdminOrder } from "@/hooks/use-admin-orders";
import { useAdminOrders } from "@/hooks/use-admin-orders";
import { useAdminProducts } from "@/hooks/use-admin-products";
import { useAdminCustomers } from "@/hooks/use-admin-customers";
import { useAdminDashboardPeriod } from "@/context/admin-dashboard-provider";
import { formatPrice } from "@/lib/format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Aggregation = "daily" | "weekly" | "monthly";
type OrderStatus = "paid" | "pending" | "cancelled";

const DAY_MS = 24 * 60 * 60 * 1000;

const statusStyles: Record<OrderStatus, { label: string; className: string }> = {
  paid: { label: "Paid", className: "bg-[#fff0f1] text-[#FF2D36]" },
  pending: { label: "Processing", className: "bg-[#eaf3fb] text-[#3479b5]" },
  cancelled: { label: "Cancelled", className: "bg-[#fff0ef] text-[#c45b55]" },
};

function normalizeStatus(status: string): OrderStatus {
  if (status === "paid" || status === "cancelled") return status;
  return "pending";
}

function inRange(value: string | Date, start: Date, end: Date) {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date >= start && date <= end;
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function formatTrend(value: number) {
  const rounded = Math.abs(value) < 0.05 ? 0 : value;
  return `${rounded >= 0 ? "+" : ""}${rounded.toFixed(1)}%`;
}

function formatShortDate(date: Date, includeYear = false) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(includeYear ? { year: "numeric" } : {}),
  });
}

function buildSalesData(
  orders: AdminOrder[],
  start: Date,
  end: Date,
  aggregation: Aggregation
) {
  const points: { date: Date; key: string; label: string; revenue: number }[] = [];

  if (aggregation === "monthly") {
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cursor <= end) {
      const date = new Date(cursor);
      points.push({
        date,
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        revenue: 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  } else {
    const step = aggregation === "weekly" ? 7 : 1;
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);
    let index = 0;
    while (cursor <= end) {
      const date = new Date(cursor);
      points.push({ date, key: String(index), label: formatShortDate(date), revenue: 0 });
      cursor.setDate(cursor.getDate() + step);
      index += 1;
    }
  }

  for (const order of orders) {
    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime()) || date < start || date > end) continue;
    let pointIndex = -1;
    if (aggregation === "monthly") {
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      pointIndex = points.findIndex((point) => point.key === key);
    } else {
      const divisor = aggregation === "weekly" ? 7 : 1;
      pointIndex = Math.floor((date.getTime() - start.getTime()) / DAY_MS / divisor);
    }
    if (points[pointIndex]) points[pointIndex].revenue += Number(order.total) || 0;
  }

  return points.map((point) => ({ ...point, revenue: Math.round(point.revenue * 100) / 100 }));
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  trend: number;
  tone: "red" | "blue" | "mint" | "purple";
}) {
  const tones = {
    red: "bg-[#fff0f1] text-[#FF2D36]",
    blue: "bg-[#eaf4fb] text-[#4188c0]",
    mint: "bg-[#fff0f1] text-[#FF2D36]",
    purple: "bg-[#f3ecfb] text-[#8c58bb]",
  };

  return (
    <section className="rounded-xl border border-[#e6ece8] bg-white p-4 shadow-[0_5px_18px_rgba(27,61,46,0.035)]">
      <div className="flex items-start gap-3">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="size-[18px]" strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-medium text-[#78837d]">{label}</p>
          <p className="mt-1 text-[21px] font-semibold leading-none tracking-[-0.035em] text-[#18211d]">{value}</p>
          <p className={`mt-2 flex items-center gap-1 text-[10px] font-semibold ${trend >= 0 ? "text-[#FF2D36]" : "text-[#d25f59]"}`}>
            <ArrowUpRight className={`size-3 ${trend < 0 ? "rotate-90" : ""}`} />
            {formatTrend(trend)}
            <span className="font-normal text-[#98a19d]">vs previous period</span>
          </p>
        </div>
      </div>
    </section>
  );
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`overflow-hidden rounded-xl border border-[#e6ece8] bg-white shadow-[0_5px_18px_rgba(27,61,46,0.03)] ${className}`}>
      {children}
    </section>
  );
}

function ProductImage({ product, sizes }: { product: Product; sizes: string }) {
  const src = product.images?.[0];
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#f2f5f3] text-[#a3aca7]">
        <Package className="size-5" strokeWidth={1.5} />
      </div>
    );
  }

  return <Image src={src} alt={product.name} fill sizes={sizes} className="object-cover" />;
}

function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#fff0f1] text-[8px] font-bold text-[#FF2D36]">
      {initials || "CU"}
    </span>
  );
}

export default function AdminDashboardPage() {
  const { range } = useAdminDashboardPeriod();
  const [aggregation, setAggregation] = useState<Aggregation>("daily");
  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useAdminOrders();
  const {
    products,
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useAdminProducts();
  const {
    customers,
    loading: customersLoading,
    error: customersError,
    refetch: refetchCustomers,
  } = useAdminCustomers();

  const periodLength = range.end.getTime() - range.start.getTime() + 1;
  const previousEnd = new Date(range.start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - periodLength + 1);

  const currentOrders = useMemo(
    () => orders.filter((order) => inRange(order.createdAt, range.start, range.end)),
    [orders, range]
  );
  const previousOrders = useMemo(
    () => orders.filter((order) => inRange(order.createdAt, previousStart, previousEnd)),
    [orders, previousStart, previousEnd]
  );
  const currentCustomers = useMemo(
    () => customers.filter((customer) => inRange(customer.joinedAt, range.start, range.end)),
    [customers, range]
  );
  const previousCustomers = useMemo(
    () => customers.filter((customer) => inRange(customer.joinedAt, previousStart, previousEnd)),
    [customers, previousStart, previousEnd]
  );

  const currentRevenue = currentOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const previousRevenue = previousOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const currentPaidRate = currentOrders.length
    ? (currentOrders.filter((order) => normalizeStatus(order.status) === "paid").length / currentOrders.length) * 100
    : 0;
  const previousPaidRate = previousOrders.length
    ? (previousOrders.filter((order) => normalizeStatus(order.status) === "paid").length / previousOrders.length) * 100
    : 0;

  const chartData = useMemo(
    () => buildSalesData(currentOrders, range.start, range.end, aggregation),
    [currentOrders, range, aggregation]
  );

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [orders]
  );

  const inventoryAlerts = useMemo(
    () => [...products].filter((product) => product.stock <= 25).sort((a, b) => a.stock - b.stock).slice(0, 3),
    [products]
  );
  const topProducts = useMemo(
    () => [...products].sort((a, b) => b.sold - a.sold).slice(0, 5),
    [products]
  );

  const customerSegments = useMemo(() => {
    const segments = [
      { key: "New", label: "New Customers", color: "#FF2D36", count: 0 },
      { key: "Regular", label: "Returning Customers", color: "#3b91d1", count: 0 },
      { key: "VIP", label: "Loyal Customers", color: "#f0b23f", count: 0 },
    ];
    for (const customer of customers) {
      const segment = segments.find((item) => item.key.toLowerCase() === customer.tier.toLowerCase());
      if (segment) segment.count += 1;
      else segments[1].count += 1;
    }
    return segments;
  }, [customers]);

  const segmentTotal = customerSegments.reduce((sum, segment) => sum + segment.count, 0);
  let segmentCursor = 0;
  const segmentGradient = segmentTotal
    ? `conic-gradient(${customerSegments
        .map((segment) => {
          const start = segmentCursor;
          segmentCursor += (segment.count / segmentTotal) * 360;
          return `${segment.color} ${start}deg ${segmentCursor}deg`;
        })
        .join(", ")})`
    : "conic-gradient(#edf1ee 0deg 360deg)";

  const loading = ordersLoading || productsLoading || customersLoading;
  const dataError = ordersError || productsError || customersError;
  const stats = [
    {
      icon: CircleDollarSign,
      label: "Total Revenue",
      value: formatPrice(currentRevenue),
      trend: percentChange(currentRevenue, previousRevenue),
      tone: "red" as const,
    },
    {
      icon: ShoppingBag,
      label: "Orders",
      value: currentOrders.length.toLocaleString(),
      trend: percentChange(currentOrders.length, previousOrders.length),
      tone: "blue" as const,
    },
    {
      icon: UsersRound,
      label: "Customers",
      value: currentCustomers.length.toLocaleString(),
      trend: percentChange(currentCustomers.length, previousCustomers.length),
      tone: "mint" as const,
    },
    {
      icon: TrendingUp,
      label: "Conversion Rate",
      value: `${currentPaidRate.toFixed(1)}%`,
      trend: currentPaidRate - previousPaidRate,
      tone: "purple" as const,
    },
  ];

  async function refetchAll() {
    await Promise.all([refetchOrders(), refetchProducts(), refetchCustomers()]);
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-3.5 sm:space-y-4">
      {dataError && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-[#f0d6d3] bg-[#fff8f7] px-4 py-3 text-xs text-[#9c4e49]">
          <span className="flex-1">Some dashboard data could not be loaded. Existing sections remain available.</span>
          <button onClick={refetchAll} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 font-semibold shadow-sm ring-1 ring-[#efd8d5] hover:bg-[#fff3f1]">
            <RefreshCw className="size-3.5" />Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-[minmax(0,2.15fr)_minmax(260px,0.92fr)]">
        <SectionCard className="min-h-[344px]">
          <div className="flex flex-wrap items-start justify-between gap-3 px-4 pb-1 pt-4 sm:px-5 sm:pt-5">
            <div>
              <h2 className="text-[13px] font-semibold text-[#1b241f]">Sales Overview</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-[22px] font-semibold tracking-[-0.04em] text-[#18211d]">{formatPrice(currentRevenue)}</p>
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${percentChange(currentRevenue, previousRevenue) >= 0 ? "text-[#FF2D36]" : "text-[#d25f59]"}`}>
                  <ArrowUpRight className={`size-3 ${percentChange(currentRevenue, previousRevenue) < 0 ? "rotate-90" : ""}`} />
                  {formatTrend(percentChange(currentRevenue, previousRevenue))}
                </span>
                <span className="text-[9px] text-[#9aa39f]">vs previous period</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex h-8 items-center gap-2 rounded-lg border border-[#e4eae6] bg-white px-3 text-[10px] font-medium capitalize text-[#54605a] transition-colors hover:bg-[#f7faf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D36]/25">
                  {aggregation}<ChevronDown className="size-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-32 rounded-xl border-[#e5ebe7] p-1.5">
                <DropdownMenuRadioGroup value={aggregation} onValueChange={(value) => setAggregation(value as Aggregation)}>
                  <DropdownMenuRadioItem value="daily" className="rounded-lg text-xs">Daily</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="weekly" className="rounded-lg text-xs">Weekly</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="monthly" className="rounded-lg text-xs">Monthly</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="h-[255px] w-full px-1 pb-3 pe-3 pt-2 sm:px-3 sm:pe-5">
            {ordersLoading ? (
              <div className="flex h-full items-center justify-center text-[#8d9792]"><Loader2 className="size-5 animate-spin" /></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 12, right: 4, left: -21, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashboardSalesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3c91d0" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#3c91d0" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#edf1ee" strokeDasharray="0" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} minTickGap={36} tick={{ fill: "#8e9893", fontSize: 9 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} width={48} tick={{ fill: "#8e9893", fontSize: 9 }} tickFormatter={(value) => value >= 1000 ? `$${Math.round(value / 1000)}K` : `$${value}`} />
                  <Tooltip
                    cursor={{ stroke: "#cdd8d2", strokeDasharray: "3 3" }}
                    contentStyle={{ border: "1px solid #e2e9e5", borderRadius: 9, boxShadow: "0 8px 24px rgba(22,55,40,.09)", fontSize: 10 }}
                    formatter={(value) => [formatPrice(Number(value)), "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#2f86c6" strokeWidth={2} fill="url(#dashboardSalesFill)" dot={false} activeDot={{ r: 4, fill: "#2f86c6", stroke: "white", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

        <SectionCard className="min-h-[344px]">
          <div className="flex h-[52px] items-center justify-between border-b border-[#edf1ee] px-4 sm:px-5">
            <h2 className="text-[13px] font-semibold text-[#1b241f]">Inventory Alerts</h2>
            {inventoryAlerts.length > 0 && <span className="rounded-full bg-[#fff6e8] px-2 py-1 text-[9px] font-semibold text-[#c98224]">Low stock</span>}
          </div>
          <div className="divide-y divide-[#f0f3f1] px-4 sm:px-5">
            {productsLoading ? (
              <div className="flex h-[226px] items-center justify-center text-[#8d9792]"><Loader2 className="size-5 animate-spin" /></div>
            ) : inventoryAlerts.length === 0 ? (
              <div className="flex h-[226px] flex-col items-center justify-center text-center">
                <span className="flex size-10 items-center justify-center rounded-full bg-[#fff0f1] text-[#FF2D36]"><Package className="size-[18px]" /></span>
                <p className="mt-3 text-xs font-semibold text-[#53605a]">Inventory looks healthy</p>
                <p className="mt-1 max-w-[190px] text-[10px] leading-4 text-[#929c97]">Low-stock products will appear here automatically.</p>
              </div>
            ) : (
              inventoryAlerts.map((product) => (
                <Link key={product.id} href={`/admin/products?product=${product.id}`} className="group flex items-center gap-3 py-3 transition-opacity hover:opacity-75">
                  <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-[#f1f4f2]"><ProductImage product={product} sizes="44px" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[10px] font-semibold text-[#334039]">{product.name}</span>
                    <span className="mt-0.5 block text-[9px] text-[#8d9792]">Stock running low</span>
                  </span>
                  <span className="shrink-0 text-[9px] font-semibold text-[#d1892a]">{product.stock} left</span>
                </Link>
              ))
            )}
          </div>
          <Link href="/admin/products" className="flex h-[45px] items-center justify-between border-t border-[#edf1ee] px-4 text-[10px] font-semibold text-[#46524c] transition-colors hover:bg-[#f8faf9] sm:px-5">
            View all products<ChevronRight className="size-3.5" />
          </Link>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-[minmax(0,2.15fr)_minmax(260px,0.92fr)]">
        <SectionCard className="min-h-[286px]">
          <div className="flex h-[52px] items-center justify-between border-b border-[#edf1ee] px-4 sm:px-5">
            <h2 className="text-[13px] font-semibold text-[#1b241f]">Recent Orders</h2>
            <Link href="/admin/orders" className="rounded-lg border border-[#e4eae6] px-2.5 py-1.5 text-[9px] font-semibold text-[#5f6964] transition-colors hover:bg-[#f7faf8]">View all</Link>
          </div>
          <div className="custom-scroll overflow-x-auto">
            <table className="w-full min-w-[650px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#edf1ee] text-[9px] font-medium text-[#818b86]">
                  <th className="px-5 py-2.5">Order ID</th>
                  <th className="px-3 py-2.5">Customer</th>
                  <th className="px-3 py-2.5">Date</th>
                  <th className="px-3 py-2.5">Amount</th>
                  <th className="px-3 py-2.5 pe-5">Status</th>
                </tr>
              </thead>
              <tbody>
                {ordersLoading ? (
                  <tr><td colSpan={5} className="h-[180px] text-center text-[#8d9792]"><Loader2 className="mx-auto size-5 animate-spin" /></td></tr>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="h-[180px] text-center">
                      <ShoppingBag className="mx-auto size-5 text-[#a4ada8]" />
                      <p className="mt-2 text-xs font-semibold text-[#69746e]">No orders yet</p>
                      <p className="mt-1 text-[10px] text-[#9aa39f]">New purchases will appear here.</p>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const status = statusStyles[normalizeStatus(order.status)];
                    return (
                      <tr key={order.id} className="border-b border-[#f0f3f1] text-[10px] transition-colors last:border-0 hover:bg-[#fbfdfc]">
                        <td className="px-5 py-3 font-semibold text-[#4c5852]">#{order.orderNumber || order.id.slice(-8).toUpperCase()}</td>
                        <td className="px-3 py-3">
                          <span className="flex items-center gap-2 text-[#3f4b45]"><InitialsAvatar name={order.customerName} /><span className="max-w-[140px] truncate">{order.customerName}</span></span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-[#7f8984]">{formatShortDate(new Date(order.createdAt), true)}</td>
                        <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#35413b]">{formatPrice(Number(order.total) || 0)}</td>
                        <td className="px-3 py-3 pe-5"><span className={`inline-flex rounded-full px-2 py-1 text-[8px] font-semibold ${status.className}`}>{status.label}</span></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard className="min-h-[286px]">
          <div className="flex h-[52px] items-center border-b border-[#edf1ee] px-4 sm:px-5">
            <h2 className="text-[13px] font-semibold text-[#1b241f]">Customer Segments</h2>
          </div>
          {customersLoading ? (
            <div className="flex h-[232px] items-center justify-center text-[#8d9792]"><Loader2 className="size-5 animate-spin" /></div>
          ) : (
            <div className="flex h-[232px] flex-col items-center justify-center px-5 sm:flex-row xl:flex-col 2xl:flex-row">
              <div className="relative size-[126px] shrink-0 rounded-full" style={{ background: segmentGradient }} aria-label={`${segmentTotal} total customers`}>
                <div className="absolute inset-[22px] flex flex-col items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_rgba(230,236,232,.7)]">
                  <span className="text-[15px] font-semibold tracking-[-0.03em] text-[#29342e]">{segmentTotal.toLocaleString()}</span>
                  <span className="text-[8px] text-[#8e9893]">Total</span>
                </div>
              </div>
              <div className="mt-4 w-full max-w-[230px] space-y-2.5 sm:ms-7 sm:mt-0 xl:ms-0 xl:mt-4 2xl:ms-7 2xl:mt-0">
                {customerSegments.map((segment) => (
                  <div key={segment.key} className="flex items-center text-[9px]">
                    <span className="me-2 size-2 rounded-full" style={{ backgroundColor: segment.color }} />
                    <span className="flex-1 text-[#65706a]">{segment.label}</span>
                    <span className="font-semibold text-[#3e4943]">{segmentTotal ? Math.round((segment.count / segmentTotal) * 100) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard>
        <div className="flex h-[52px] items-center justify-between border-b border-[#edf1ee] px-4 sm:px-5">
          <h2 className="text-[13px] font-semibold text-[#1b241f]">Top Products</h2>
          <Link href="/admin/products" className="rounded-lg border border-[#e4eae6] px-2.5 py-1.5 text-[9px] font-semibold text-[#5f6964] transition-colors hover:bg-[#f7faf8]">View all products</Link>
        </div>
        {productsLoading ? (
          <div className="flex h-[218px] items-center justify-center text-[#8d9792]"><Loader2 className="size-5 animate-spin" /></div>
        ) : topProducts.length === 0 ? (
          <div className="flex h-[218px] flex-col items-center justify-center text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-[#fff0f1] text-[#FF2D36]"><Package className="size-[18px]" /></span>
            <p className="mt-3 text-xs font-semibold text-[#626d67]">No products to rank yet</p>
            <p className="mt-1 text-[10px] text-[#97a09c]">Add products to start tracking best sellers.</p>
            <Link href="/admin/products" className="mt-3 rounded-lg bg-[#FF2D36] px-3 py-2 text-[10px] font-semibold text-white transition-colors hover:bg-[#e52630]">Add a product</Link>
          </div>
        ) : (
          <div className="no-scrollbar grid auto-cols-[164px] grid-flow-col gap-3 overflow-x-auto p-4 sm:auto-cols-[minmax(0,1fr)] sm:grid-cols-3 sm:grid-flow-row lg:grid-cols-5 sm:p-5">
            {topProducts.map((product) => (
              <Link key={product.id} href={`/admin/products?product=${product.id}`} className="group min-w-0 rounded-xl border border-[#edf1ee] bg-white p-2 transition-all hover:-translate-y-0.5 hover:border-[#ffd8da] hover:shadow-md hover:shadow-red-950/5">
                <div className="relative aspect-[1.45/1] overflow-hidden rounded-lg bg-[#f1f4f2]"><ProductImage product={product} sizes="(max-width: 640px) 148px, 18vw" /></div>
                <p className="mt-2 truncate text-[10px] font-semibold text-[#3a463f]">{product.name}</p>
                <p className="mt-1 text-[8px] text-[#929b97]">{product.sold.toLocaleString()} sold</p>
                <p className="mt-1.5 text-[10px] font-semibold text-[#FF2D36]">{formatPrice(product.price * product.sold)}</p>
              </Link>
            ))}
          </div>
        )}
      </SectionCard>

      {loading && <span className="sr-only" aria-live="polite">Loading dashboard data</span>}
    </div>
  );
}
