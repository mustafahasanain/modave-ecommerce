"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  CircleUserRound,
  FileText,
  Home,
  Languages,
  Layers3,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Star,
  Store,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/language-provider";
import {
  AdminDashboardProvider,
  type DashboardPeriod,
  useAdminDashboardPeriod,
} from "@/context/admin-dashboard-provider";
import { useAdminOrders } from "@/hooks/use-admin-orders";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = {
  href: string;
  labelKey?: string;
  label?: string;
  icon: typeof Home;
};

const navItems: NavItem[] = [
  { href: "/admin", labelKey: "overview", icon: Home },
  { href: "/admin/orders", labelKey: "orders", icon: ShoppingCart },
  { href: "/admin/products", labelKey: "products", icon: Package },
  { href: "/admin/categories", labelKey: "categories", icon: Layers3 },
  { href: "/admin/customers", labelKey: "customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/settings", labelKey: "settings", icon: Settings },
];

function getActiveNav(pathname: string) {
  return (
    navItems.find((item) =>
      item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
    ) ?? navItems[0]
  );
}

function NavList({ orderCount, onNavigate }: { orderCount: number; onNavigate?: () => void }) {
  const { t } = useLanguage();
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const label = item.labelKey
          ? (t.admin as Record<string, string>)[item.labelKey] || item.labelKey
          : item.label;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-all",
              active
                ? "bg-[#fff0f1] text-[#FF2D36]"
                : "text-[#59645f] hover:bg-[#f4f7f5] hover:text-[#17201c]"
            )}
          >
            <Icon className="size-[17px] shrink-0" strokeWidth={1.8} />
            <span className="truncate">{label}</span>
            {item.href === "/admin/orders" && orderCount > 0 && (
              <span className="ms-auto rounded-full bg-[#f1f4f2] px-2 py-0.5 text-[10px] font-semibold text-[#68736e] group-aria-[current=page]:bg-white/70">
                {orderCount > 99 ? "99+" : orderCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({
  orderCount,
  revenue,
  onNavigate,
}: {
  orderCount: number;
  revenue: number;
  onNavigate?: () => void;
}) {
  const { locale } = useLanguage();
  const router = useRouter();

  async function handleLogout() {
    try {
      const response = await fetch("/api/admin/auth", { method: "DELETE" });
      if (!response.ok) throw new Error();
      toast.success(locale === "ar" ? "تم تسجيل الخروج" : "Logged out successfully");
      router.push("/admin/login");
      router.refresh();
    } catch {
      toast.error(locale === "ar" ? "تعذر تسجيل الخروج" : "Could not log out");
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex h-[72px] shrink-0 items-center border-b border-[#edf1ee] px-5">
        <Link href="/admin" onClick={onNavigate} className="inline-flex items-center gap-2.5" aria-label="Modave dashboard">
          <span className="flex size-9 items-center justify-center rounded-lg bg-[#FF2D36] text-white shadow-sm shadow-red-700/15">
            <ShoppingBag className="size-[19px]" strokeWidth={1.8} />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-[#18221d]">Modave</span>
        </Link>
      </div>

      <div className="custom-scroll flex-1 overflow-y-auto px-3 py-4">
        <NavList orderCount={orderCount} onNavigate={onNavigate} />
      </div>

      <div className="shrink-0 space-y-3 px-3 pb-4">
        <div className="rounded-xl border border-[#e8edea] bg-[#fbfdfc] p-3.5 shadow-[0_4px_16px_rgba(29,61,47,0.03)]">
          <p className="text-[10px] font-medium text-[#75807b]">Total Revenue</p>
          <p className="mt-0.5 text-[9px] text-[#9aa39f]">Selected period</p>
          <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#17201c]">
            {formatPrice(revenue)}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[#FF2D36]">
            <span>Live</span>
            <span className="size-1.5 rounded-full bg-[#FF2D36]" />
          </div>
          <svg viewBox="0 0 130 30" className="mt-2 h-7 w-full" role="img" aria-label="Revenue activity sparkline">
            <path
              d="M1 26 L12 22 L22 24 L32 15 L42 19 L52 12 L63 18 L73 9 L83 16 L94 7 L105 12 L116 4 L129 8"
              fill="none"
              stroke="#FF2D36"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2.5 rounded-lg border border-[#e8edea] bg-white p-2 text-left transition-colors hover:bg-[#f7faf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D36]/30">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#fff0f1] text-[#FF2D36]">
                <CircleUserRound className="size-[19px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-semibold text-[#26302b]">Store Admin</span>
                <span className="block truncate text-[9px] text-[#89928e]">Administrator</span>
              </span>
              <ChevronDown className="size-3.5 text-[#88928d]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-52 rounded-xl border-[#e5ebe7] p-1.5">
            <DropdownMenuItem asChild className="rounded-lg text-xs">
              <Link href="/" onClick={onNavigate}><Store />View storefront</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg text-xs">
              <Link href="/admin/settings" onClick={onNavigate}><Settings />Account settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout} variant="destructive" className="rounded-lg text-xs">
              <LogOut />Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function DateRangeMenu() {
  const { period, setPeriod, range } = useAdminDashboardPeriod();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="hidden h-9 items-center gap-2 rounded-lg border border-[#e3e9e5] bg-white px-3 text-[11px] font-medium text-[#4e5953] shadow-sm shadow-slate-900/[0.02] transition-colors hover:border-[#cdd8d1] hover:bg-[#fbfdfc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D36]/25 sm:flex">
          <span>{range.label}</span>
          <CalendarDays className="size-3.5 text-[#89938e]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-xl border-[#e5ebe7] p-1.5">
        <DropdownMenuLabel className="text-[11px] text-[#7d8782]">Dashboard period</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={period} onValueChange={(value) => setPeriod(value as DashboardPeriod)}>
          <DropdownMenuRadioItem value="30d" className="rounded-lg text-xs">Last 30 days</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="90d" className="rounded-lg text-xs">Last 90 days</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="1y" className="rounded-lg text-xs">Last 12 months</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const { toggleLocale, locale, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { orders } = useAdminOrders();
  const { range } = useAdminDashboardPeriod();
  const activeItem = getActiveNav(pathname);
  const pageTitle = activeItem.labelKey
    ? (t.admin as Record<string, string>)[activeItem.labelKey] || activeItem.labelKey
    : activeItem.label;
  const periodOrders = orders.filter((order) => {
    const createdAt = new Date(order.createdAt);
    return createdAt >= range.start && createdAt <= range.end;
  });
  const periodRevenue = periodOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const pendingCount = orders.filter((order) => order.status === "pending").length;

  async function handleLogout() {
    try {
      const response = await fetch("/api/admin/auth", { method: "DELETE" });
      if (!response.ok) throw new Error();
      router.push("/admin/login");
      router.refresh();
    } catch {
      toast.error("Could not log out");
    }
  }

  return (
    <div className="admin-dashboard-theme flex min-h-screen bg-[#f4f7f5] text-[#17201c]">
      <aside className="sticky top-0 hidden h-screen w-[228px] shrink-0 border-e border-[#e8edea] lg:block">
        <SidebarBody orderCount={orders.length} revenue={periodRevenue} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side={locale === "ar" ? "right" : "left"} className="w-[280px] border-0 p-0">
          <SidebarBody
            orderCount={orders.length}
            revenue={periodRevenue}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-[#e8edea] bg-white/95 px-4 backdrop-blur-lg sm:px-6 lg:px-7">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-lg text-[#4f5a54] lg:hidden"
            aria-label="Open navigation menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-[19px]" />
          </Button>
          <h1 className="truncate text-[15px] font-semibold tracking-[-0.02em] text-[#17201c]">
            {pageTitle}
          </h1>

          <div className="ms-auto flex items-center gap-2.5">
            <DateRangeMenu />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative flex size-9 items-center justify-center rounded-lg text-[#59635e] transition-colors hover:bg-[#f3f7f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D36]/25" aria-label="Notifications">
                  <Bell className="size-[17px]" strokeWidth={1.8} />
                  {pendingCount > 0 && (
                    <span className="absolute end-1.5 top-1.5 size-2 rounded-full border-2 border-white bg-[#ee6b6b]" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 rounded-xl border-[#e5ebe7] p-2">
                <DropdownMenuLabel className="flex items-center justify-between text-xs">
                  Notifications
                  {pendingCount > 0 && <span className="text-[10px] font-medium text-[#FF2D36]">{pendingCount} new</span>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {pendingCount > 0 ? (
                  <DropdownMenuItem asChild className="rounded-lg p-2.5 text-xs">
                    <Link href="/admin/orders?status=pending" className="items-start">
                      <span className="mt-0.5 size-2 shrink-0 rounded-full bg-[#f4b342]" />
                      <span><span className="block font-medium">Orders need attention</span><span className="mt-0.5 block text-[10px] text-[#7f8984]">Review {pendingCount} pending {pendingCount === 1 ? "order" : "orders"}</span></span>
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <div className="px-3 py-6 text-center text-xs text-[#85908a]">You’re all caught up.</div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex size-9 items-center justify-center rounded-full bg-[#fff0f1] text-[#FF2D36] ring-1 ring-[#ffd8da] transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D36]/35" aria-label="Open profile menu">
                  <CircleUserRound className="size-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl border-[#e5ebe7] p-1.5">
                <DropdownMenuLabel>
                  <span className="block text-xs font-semibold">Store Admin</span>
                  <span className="block text-[10px] font-normal text-[#85908a]">admin@modave.com</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={toggleLocale} className="rounded-lg text-xs">
                  <Languages />{locale === "en" ? "Switch to Arabic" : "Switch to English"}
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg text-xs">
                  <Link href="/"><Store />View storefront</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout} variant="destructive" className="rounded-lg text-xs">
                  <LogOut />Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="min-h-[calc(100vh-72px)] p-3 sm:p-5 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <AdminDashboardProvider>
      <AdminShell>{children}</AdminShell>
    </AdminDashboardProvider>
  );
}
