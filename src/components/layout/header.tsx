"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  Phone,
  Mail,
} from "lucide-react";
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
  { key: "home", href: "/" },
  { key: "shop", href: "/shop" },
  { key: "products", href: "/shop" },
  { key: "blog", href: "/blog" },
] as const;

export function Header() {
  const { t, locale } = useLanguage();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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
    blog: t.nav.blog,
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white text-[#111111] transition-shadow duration-300 ${
        scrolled ? "shadow-[0_1px_12px_rgba(0,0,0,0.05)]" : "shadow-none"
      }`}
    >
      <div className="relative mx-auto grid h-[68px] w-full grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-8 lg:h-[84px] lg:px-16">
        <div className="flex items-center gap-3 justify-self-start">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side={locale === "ar" ? "right" : "left"}
              className="w-[300px] sm:w-[340px]"
            >
              <SheetHeader>
                <SheetTitle className="text-start">
                  <Image
                    src="/logo.svg"
                    alt="Modave"
                    width={144}
                    height={25}
                    className="h-auto w-[132px]"
                    priority
                  />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    {labelMap[item.key]}
                  </Link>
                ))}
              </nav>
              <div className="mt-6 border-t pt-4 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3" />
                  {t.topbar.phone}
                </p>
                <p className="mt-1 flex items-center gap-1.5">
                  <Mail className="h-3 w-3" />
                  {t.topbar.email}
                </p>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center" aria-label="Modave home">
            <Image
              src="/logo.svg"
              alt="Modave"
              width={144}
              height={25}
              className="h-auto w-[132px] lg:w-[144px]"
              priority
            />
          </Link>
        </div>

        <nav className="hidden items-center gap-[27px] justify-self-center lg:flex">
          {navItems.map((item) => {
            const active =
              (item.key === "home" && pathname === "/") ||
              (item.key === "shop" && pathname === "/shop") ||
              (item.key === "blog" && pathname === "/blog") ||
              (item.key === "pages" && pathname === "/collections");

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`group relative text-[17px] font-semibold leading-none transition-colors ${
                  active
                    ? "text-[#ff2d36]"
                    : "text-[#06080d] hover:text-[#ff2d36]"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {labelMap[item.key]}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 justify-self-end sm:gap-0.5">
          <button
            onClick={() => setCmdSearchOpen(true)}
            aria-label="Search"
            className="flex size-9 items-center justify-center text-[#141414] transition-colors hover:text-[#ff2d36] lg:size-10"
          >
            <Search className="h-[22px] w-[22px] stroke-[2.35]" />
          </button>

          <Link
            href="/account"
            aria-label="Account"
            className="hidden size-9 items-center justify-center text-[#141414] transition-colors hover:text-[#ff2d36] sm:flex lg:size-10"
          >
            <User className="h-[22px] w-[22px] stroke-[2.35]" />
          </Link>

          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative hidden size-9 items-center justify-center text-[#141414] transition-colors hover:text-[#ff2d36] sm:flex lg:size-10"
          >
            <Heart className="h-[24px] w-[24px] stroke-[2.25]" />
            {wishlist > 0 && (
              <span className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff2d36] px-1 text-[10px] font-bold leading-none text-white">
                {wishlist}
              </span>
            )}
          </Link>

          <button
            onClick={() => setCartOpen(true)}
            aria-label="Cart"
            className="relative flex size-9 items-center justify-center text-[#141414] transition-colors hover:text-[#ff2d36] lg:size-10"
          >
            <ShoppingBag className="h-[23px] w-[23px] stroke-[2.25]" />
            <span className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff2d36] px-1 text-[10px] font-bold leading-none text-white">
              {count}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
