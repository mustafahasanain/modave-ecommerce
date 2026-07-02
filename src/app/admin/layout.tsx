"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Store,
  Settings,
  Menu,
  Languages,
  LogOut,
  FileText,
  Layers,
  Star,
} from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  labelKey: string;
  icon: typeof LayoutDashboard;
};

const navItems: NavItem[] = [
  { href: "/admin", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/admin/products", labelKey: "products", icon: Package },
  { href: "/admin/categories", labelKey: "Categories", icon: Layers },
  { href: "/admin/orders", labelKey: "orders", icon: ShoppingCart },
  { href: "/admin/customers", labelKey: "customers", icon: Users },
  { href: "/admin/reviews", labelKey: "Reviews", icon: Star },
  { href: "/admin/blog", labelKey: "Blog", icon: FileText },
  { href: "/admin/settings", labelKey: "settings", icon: Settings },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-background/10 text-background"
                : "text-background/70 hover:bg-background/5 hover:text-background"
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span>{(t.admin as Record<string, string>)[item.labelKey] || item.labelKey}</span>
            {active && (
              <span className="ms-auto size-1.5 rounded-full bg-[var(--sale)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBrand() {
  return (
    <Link href="/admin" className="flex items-end gap-2 px-1">
      <span className="font-display text-2xl font-semibold tracking-tight text-background">
        Modave
      </span>
      <span className="pb-1 text-[10px] uppercase tracking-[0.2em] text-background/50">
        Admin
      </span>
    </Link>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const ar = locale === "ar";

  async function handleLogout() {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      toast.success(ar ? "تم تسجيل الخروج" : "Logged out");
      router.push("/admin/login");
      router.refresh();
    } catch {
      toast.error(ar ? "فشل الخروج" : "Logout failed");
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5 border-b border-background/10">
        <SidebarBrand />
      </div>
      <div className="flex-1 overflow-y-auto p-3 custom-scroll">
        <p className="px-3 pt-3 pb-2 text-[10px] uppercase tracking-[0.2em] text-background/40">
          {t.admin.overview}
        </p>
        <NavList onNavigate={onNavigate} />
        <Separator className="my-4 bg-background/10" />
        {onNavigate ? (
          <SheetClose asChild>
            <Link
              href="/"
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-background/70 hover:bg-background/5 hover:text-background transition-colors"
            >
              <Store className="size-4 shrink-0" />
              <span>View Store</span>
            </Link>
          </SheetClose>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-background/70 hover:bg-background/5 hover:text-background transition-colors"
          >
            <Store className="size-4 shrink-0" />
            <span>View Store</span>
          </Link>
        )}
        <Link
          href="#"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-background/70 hover:bg-background/5 hover:text-background transition-colors"
        >
          <Settings className="size-4 shrink-0" />
          <span>{t.admin.settings}</span>
        </Link>
      </div>
      <div className="border-t border-background/10 p-3">
        <div className="flex items-center gap-3 rounded-md p-2">
          <Avatar>
            <AvatarFallback className="bg-background/10 text-background">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-background">
              Admin User
            </p>
            <p className="truncate text-xs text-background/50">
              admin@modave.com
            </p>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Logout"
            className="flex size-8 items-center justify-center rounded-md text-background/50 transition-colors hover:bg-background/10 hover:text-background"
          >
            <LogOut className="size-4 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toggleLocale, locale } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-secondary/30">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-foreground text-background">
        <SidebarBody />
      </aside>

      {/* Mobile sidebar via Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-72 bg-foreground text-background border-0 p-0 flex flex-col"
        >
          <SidebarBody onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md lg:px-8">
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <div className="flex items-end gap-2">
            <span className="font-display text-xl font-semibold">
              Modave{" "}
              <span className="text-muted-foreground text-base">Admin</span>
            </span>
          </div>
          <div className="ms-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLocale}
              className="gap-1.5"
            >
              <Languages className="size-4" />
              <span className="uppercase text-xs tracking-widest">
                {locale === "en" ? "EN" : "AR"}
              </span>
            </Button>
            <Avatar>
              <AvatarFallback className="bg-foreground text-background">
                AD
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
