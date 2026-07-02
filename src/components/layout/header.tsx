"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Search, User, Heart, ShoppingBag, Menu, ChevronDown, Settings, Globe, Phone, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/language-provider";
import { useCart } from "@/lib/cart-store";
import { useUI } from "@/lib/ui-store";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { key: "buyTheme", href: "/shop", accent: true },
  { key: "blog", href: "/blog" },
  { key: "collections", href: "/collections" },
  { key: "products", href: "/shop", mega: true },
  { key: "shop", href: "/shop", mega: true },
  { key: "home", href: "/" },
] as const;

export function Header() {
  const { t, locale, toggleLocale } = useLanguage();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const count = useCart((s) => s.count());
  const wishlist = useCart((s) => s.wishlist.length);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const setCmdSearchOpen = useUI((s) => s.setSearchOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const labelMap: Record<string, string> = {
    home: t.nav.home,
    shop: t.nav.shop,
    products: t.nav.products,
    collections: t.common.shop,
    blog: t.nav.blog,
    buyTheme: t.nav.buyTheme,
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
            : "bg-background border-b border-border/50"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 lg:py-4">
          {/* LEFT: Logo + mobile menu */}
          <div className="flex items-center gap-2 shrink-0">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={locale === "ar" ? "right" : "left"} className="w-[300px] sm:w-[340px]">
                <SheetHeader>
                  <SheetTitle className="text-start">
                    <span className="font-display text-2xl font-semibold tracking-tight">Modave</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1">
                  {navItems.map((item) => (
                    <Link key={item.key} href={item.href} onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between rounded-md px-3 py-3 text-sm font-medium hover:bg-accent transition-colors">
                      {labelMap[item.key]}
                      <ChevronDown className="h-4 w-4 opacity-50 rtl-flip" />
                    </Link>
                  ))}
                </nav>
                <div className="mt-6 border-t pt-4 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{t.topbar.phone}</p>
                  <p className="mt-1 flex items-center gap-1.5"><Mail className="h-3 w-3" />{t.topbar.email}</p>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2">
              <span className="font-display text-2xl font-semibold tracking-tight lg:text-[28px]">Modave</span>
            </Link>
          </div>

          {/* CENTER: Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.key} href={item.href}
                  className={`group relative text-sm font-medium tracking-wide transition-colors ${
                    active ? "text-foreground" : "text-foreground/80 hover:text-foreground"
                  } ${item.accent ? "text-foreground font-semibold" : ""}`}>
                  <span className="inline-flex items-center gap-1">
                    {labelMap[item.key]}
                    {item.mega && <ChevronDown className="h-3.5 w-3.5 opacity-60 rtl-flip" />}
                  </span>
                  <span className="absolute -bottom-1.5 start-0 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: Action icons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Link href="/wishlist" aria-label="Wishlist"
              className="relative hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 transition-colors hover:text-foreground">
              <Heart className="h-[19px] w-[19px]" />
              {wishlist > 0 && (
                <span className="absolute -top-0 -end-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--sale)] px-1 text-[10px] font-semibold text-white">
                  {wishlist}
                </span>
              )}
            </Link>

            <Link href="/account" aria-label="Account"
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 transition-colors hover:text-foreground">
              <User className="h-[19px] w-[19px]" />
            </Link>

            <button onClick={() => setCmdSearchOpen(true)} aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 transition-colors hover:text-foreground">
              <Search className="h-[19px] w-[19px]" />
            </button>

            <button onClick={() => setSettingsOpen(true)} aria-label="Settings"
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 transition-colors hover:text-foreground">
              <Settings className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating side buttons on the RIGHT edge (matches original: cart on top, RTL below) */}
      <div className="fixed end-0 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-2">
        {/* Cart button */}
        <button
          onClick={() => setCartOpen(true)}
          aria-label="Cart"
          className="relative flex h-12 w-12 items-center justify-center rounded-s-lg bg-foreground text-background shadow-lg transition-colors hover:bg-foreground/90"
        >
          <ShoppingBag className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-1 -start-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--sale)] px-1 text-[10px] font-bold text-white">
              {count}
            </span>
          )}
        </button>
        {/* RTL/LTR language toggle */}
        <button
          onClick={toggleLocale}
          className="flex h-12 w-12 items-center justify-center rounded-s-lg bg-foreground text-[11px] font-bold uppercase tracking-widest text-background shadow-lg transition-colors hover:bg-foreground/90"
          aria-label="Toggle RTL/LTR"
        >
          {locale === "ar" ? "LTR" : "RTL"}
        </button>
      </div>

      {/* Settings side drawer (language + currency) */}
      <SettingsDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

function SettingsDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t, locale, setLocale } = useLanguage();
  const [currency, setCurrency] = useState("USD");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="end" className="w-[320px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-start">
            <Globe className="h-4 w-4" />
            {locale === "ar" ? "الإعدادات" : "Settings"}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Language */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {locale === "ar" ? "اللغة" : "Language"}
            </h4>
            <div className="grid gap-2">
              <button
                onClick={() => setLocale("en")}
                className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors ${
                  locale === "en" ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/50"
                }`}
              >
                <span>🇬🇧 English</span>
                <span className="text-xs text-muted-foreground">LTR</span>
              </button>
              <button
                onClick={() => setLocale("ar")}
                className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors ${
                  locale === "ar" ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/50"
                }`}
              >
                <span>🇸🇦 العربية</span>
                <span className="text-xs text-muted-foreground">RTL</span>
              </button>
            </div>
          </div>

          {/* Currency */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {locale === "ar" ? "العملة" : "Currency"}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {["USD", "EUR", "GBP", "AED", "SAR", "EGP"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    currency === c ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="border-t border-border pt-4 text-xs text-muted-foreground">
            <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{t.topbar.phone}</p>
            <p className="mt-1 flex items-center gap-1.5"><Mail className="h-3 w-3" />{t.topbar.email}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
