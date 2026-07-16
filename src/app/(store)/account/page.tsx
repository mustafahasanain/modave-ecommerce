"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  Heart,
  MapPin,
  Package,
  Settings,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language-provider";
import { useCart } from "@/lib/cart-store";
import { toast } from "sonner";

type Customer = { id: string; name: string; email: string; phone: string | null };

export default function AccountPage() {
  const { dir, locale, t } = useLanguage();
  const router = useRouter();
  const wishlistCount = useCart((state) => state.wishlist.length);
  const Arrow = dir === "rtl" ? ArrowLeft : ChevronRight;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    fetch("/api/account/auth")
      .then((response) => response.json())
      .then((data) => {
        if (data.customer) {
          setCustomer(data.customer);
        } else {
          router.replace("/account/login?from=/account");
        }
      })
      .catch(() => router.replace("/account/login?from=/account"))
      .finally(() => setCheckingSession(false));
  }, [router]);

  const signOut = async () => {
    await fetch("/api/account/auth", { method: "DELETE" });
    setCustomer(null);
    toast.success("Signed out successfully.");
    router.replace("/account/login");
  };

  const copy = locale === "ar"
    ? {
        title: "حسابي",
        subtitle: "سجّل الدخول لإدارة طلباتك وعناوينك ومفضلاتك.",
        welcome: "مرحباً بك في موداف",
        message: "أنشئ حساباً لتتبع طلباتك وحفظ بياناتك لتجربة تسوق أسرع.",
        signIn: "تسجيل الدخول",
        create: "إنشاء حساب",
        orders: "طلباتي",
        ordersDesc: "تتبع الطلبات والإرجاعات",
        addresses: "العناوين",
        addressesDesc: "إدارة عناوين الشحن",
        wishlist: "المفضلة",
        wishlistDesc: "المنتجات التي حفظتها",
        settings: "إعدادات الحساب",
        settingsDesc: "الملف الشخصي والتفضيلات",
        saved: "منتجات محفوظة",
      }
    : {
        title: "My Account",
        subtitle: "Sign in to manage your orders, addresses, and saved items.",
        welcome: "Welcome to Modave",
        message: "Create an account to track your orders and save your details for a faster checkout.",
        signIn: "Sign In",
        create: "Create Account",
        orders: "My Orders",
        ordersDesc: "Track orders and returns",
        addresses: "Addresses",
        addressesDesc: "Manage shipping addresses",
        wishlist: "Wishlist",
        wishlistDesc: "Products you have saved",
        settings: "Account Settings",
        settingsDesc: "Profile and preferences",
        saved: "saved items",
      };

  const sections = [
    { icon: Package, title: copy.orders, description: copy.ordersDesc, href: "/account/orders" },
    { icon: MapPin, title: copy.addresses, description: copy.addressesDesc, href: "/account/addresses" },
    { icon: Heart, title: copy.wishlist, description: copy.wishlistDesc, href: "/wishlist", count: wishlistCount },
    { icon: Settings, title: copy.settings, description: copy.settingsDesc, href: "/account/settings" },
  ];

  if (checkingSession || !customer) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:py-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="border-b border-border pb-8"
      >
        <nav className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">{t.common.home}</Link>
          <ChevronRight className="h-3 w-3 rtl-flip" />
          <span className="text-foreground">{copy.title}</span>
        </nav>
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>
      </motion.div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="rounded-2xl bg-[#111111] px-6 py-8 text-white sm:px-8 sm:py-10"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <UserRound className="h-6 w-6" />
          </div>
          <h2 className="mt-6 font-display text-3xl font-semibold">
            {`${locale === "ar" ? "مرحباً،" : "Welcome back,"} ${customer.name}`}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/70">
            {customer.email}
          </p>
          <Button onClick={signOut} variant="outline" className="mt-7 rounded-full border-white/30 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white">
            {locale === "ar" ? "تسجيل الخروج" : "Sign Out"}
          </Button>
        </motion.section>

        <section className="grid gap-3 sm:grid-cols-2">
          {sections.map(({ icon: Icon, title, description, href, count }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.06 }}
            >
              <Link href={href} className="group flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2 font-semibold">
                    {title}
                    {typeof count === "number" && count > 0 && (
                      <span className="rounded-full bg-[#ff2d36] px-2 py-0.5 text-xs font-bold text-white">{count}</span>
                    )}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">{description}</span>
                  {title === copy.wishlist && (
                    <span className="mt-3 block text-xs font-medium text-muted-foreground">{wishlistCount} {copy.saved}</span>
                  )}
                </span>
                <Arrow className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 rtl-flip" />
              </Link>
            </motion.div>
          ))}
        </section>
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          {locale === "ar" ? "هل تريد مواصلة التسوق؟" : "Looking for something new?"}
        </p>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/shop">
            <ShoppingBag className="h-4 w-4" />
            {t.common.exploreProducts}
          </Link>
        </Button>
      </div>
    </div>
  );
}
