"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Flame,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft,
  Tag,
  ShieldCheck,
  Truck,
  ChevronRight,
  Bookmark,
  ShoppingBag,
} from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { ProductCard } from "@/components/product/product-card";
import { products } from "@/data/products";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useCoupons } from "@/hooks/use-coupons";
import {
  computeTotalDiscount,
  getFreeShipThreshold,
  getCartCountdownMinutes,
} from "@/lib/discount";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const SHIPPING_OPTIONS = [
  { id: "free", labelKey: "freeShipping", price: 0 },
  { id: "local", labelKey: "local", price: 35 },
  { id: "flat", labelKey: "flatRate", price: 35 },
] as const;

export default function CartPage() {
  const { t, locale, dir } = useLanguage();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  const items = useCart((s) => s.items);
  const savedForLater = useCart((s) => s.savedForLater);
  const subtotal = useCart((s) => s.subtotal());
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const saveForLater = useCart((s) => s.saveForLater);
  const moveToCart = useCart((s) => s.moveToCart);
  const removeSaved = useCart((s) => s.removeSaved);
  const applyCoupon = useCart((s) => s.applyCoupon);
  const coupon = useCart((s) => s.coupon);

  // Dynamic business config from site settings + active coupons from the DB.
  const { settings } = useSiteSettings();
  const { coupons } = useCoupons();
  const FREE_SHIP_THRESHOLD = getFreeShipThreshold(settings);
  const countdownMinutes = getCartCountdownMinutes(settings);

  // Countdown timer (duration configurable via `cartCountdownMinutes` setting)
  const [secondsLeft, setSecondsLeft] = useState(countdownMinutes * 60);
  // Re-sync the start value when the setting first loads from the API.
  useEffect(() => {
    setSecondsLeft(countdownMinutes * 60);
  }, [countdownMinutes]);
  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((p) => (p > 0 ? p - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  // Shipping selection
  const [shippingId, setShippingId] = useState<string>("free");
  const shipping = SHIPPING_OPTIONS.find((o) => o.id === shippingId)?.price ?? 0;

  // Coupon input
  const [couponInput, setCouponInput] = useState("");
  // Discount = applied coupon (if it matches an active coupon) OR auto-discount
  // (threshold/percentage/max from site settings). Coupon takes precedence.
  const discount = useMemo(
    () => computeTotalDiscount(coupons, coupon, settings, subtotal),
    [coupons, coupon, settings, subtotal]
  );

  const total = Math.max(0, subtotal - discount + shipping);

  // Free ship progress
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
  const progress = Math.min((subtotal / FREE_SHIP_THRESHOLD) * 100, 100);
  const freeShipUnlocked = subtotal >= FREE_SHIP_THRESHOLD;

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      toast.error(locale === "ar" ? "أدخل كود الخصم" : "Enter a coupon code");
      return;
    }
    // If coupons have loaded, validate the code against the active coupons
    // from the DB. If they're still loading, fall back to optimistic apply
    // (the discount computation will simply yield 0 for unknown codes).
    if (coupons.length > 0 && !coupons.some((c) => c.code.toUpperCase() === code)) {
      toast.error(
        locale === "ar"
          ? `كود الخصم "${code}" غير صالح أو منتهي`
          : `Coupon "${code}" is invalid or expired`
      );
      return;
    }
    applyCoupon(code);
    toast.success(
      locale === "ar" ? `تم تطبيق الكوبون: ${code}` : `Coupon applied: ${code}`
    );
    setCouponInput("");
  };

  const youMightLike = useMemo(
    () => products.filter((p) => p.featured || p.newArrival).slice(0, 4),
    []
  );

  const isEmpty = items.length === 0;

  return (
    <>
      {/* PAGE HEADER */}
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:py-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {t.cart.title}
            </h1>
            {/* Breadcrumb */}
            <nav
              aria-label="breadcrumb"
              className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
            >
              <Link href="/" className="hover:text-foreground">
                {t.common.home}
              </Link>
              <ChevronRight className="h-3 w-3 rtl-flip" />
              <Link href="/shop" className="hover:text-foreground">
                {t.common.shop}
              </Link>
              <ChevronRight className="h-3 w-3 rtl-flip" />
              <span className="text-foreground">{t.cart.title}</span>
            </nav>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
        {/* CART EXPIRY COUNTDOWN */}
        {!isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-[var(--sale)]/25 bg-[var(--sale)]/5 px-4 py-3"
          >
            <Flame className="h-5 w-5 shrink-0 text-[var(--sale)]" />
            <p className="text-sm text-foreground/80">
              {t.cart.expireMsg}{" "}
              <span className="font-mono font-semibold text-[var(--sale)]">
                {mm}:{ss}
              </span>{" "}
              {t.cart.minutes}
            </p>
          </motion.div>
        )}

        {/* FREE SHIPPING PROGRESS */}
        {!isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mb-8 rounded-lg border border-border bg-card p-4 sm:p-5"
          >
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              {freeShipUnlocked ? (
                <p className="text-sm font-medium text-green-700">
                  {t.cart.freeShipUnlocked}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t.cart.freeShipMsg.replace(
                    "$70.00",
                    formatPrice(remaining)
                  )}
                </p>
              )}
            </div>
            <Progress
              value={progress}
              className="mt-3 h-2 bg-secondary"
            />
          </motion.div>
        )}

        {isEmpty ? (
          <EmptyCart t={t} Arrow={Arrow} />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
            {/* LEFT — CART ITEMS TABLE */}
            <div>
              {/* Table header (desktop) */}
              <div className="hidden grid-cols-[3fr_1fr_1.3fr_1fr_auto] gap-4 border-b border-border pb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground lg:grid">
                <div>{t.cart.product}</div>
                <div>{t.cart.price}</div>
                <div>{t.cart.qty}</div>
                <div>{t.cart.total}</div>
                <div className="w-8" />
              </div>

              <div className="divide-y divide-border">
                {items.map((item) => (
                  <motion.div
                    key={`${item.id}-${item.size}-${item.color}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 gap-4 py-5 sm:grid-cols-[80px_1fr] sm:gap-4 lg:grid-cols-[3fr_1fr_1.3fr_1fr_auto] lg:items-center lg:gap-4"
                  >
                    {/* Product cell */}
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/product/${item.id}`}
                        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-secondary"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </Link>
                      <div className="min-w-0">
                        <Link
                          href={`/product/${item.id}`}
                          className="line-clamp-2 text-sm font-medium hover:text-foreground/70"
                        >
                          {item.name}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {item.color && (
                            <span className="inline-flex items-center gap-1">
                              <span className="h-2.5 w-2.5 rounded-full border border-border" style={{ backgroundColor: getColorHex(item.color) }} />
                              {item.color}
                            </span>
                          )}
                          {item.size && (
                            <span>
                              {locale === "ar" ? "المقاس" : "Size"}: {item.size}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price (desktop) */}
                    <div className="hidden text-sm lg:block">
                      {item.originalPrice && (
                        <span className="mr-2 text-xs text-muted-foreground line-through">
                          {formatPrice(item.originalPrice)}
                        </span>
                      )}
                      <span className="font-medium">{formatPrice(item.price)}</span>
                    </div>

                    {/* Quantity stepper */}
                    <div className="flex items-center">
                      <div className="inline-flex items-center rounded-full border border-border">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1, item.size, item.color)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-s-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-8 text-center text-sm font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1, item.size, item.color)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-e-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Line total */}
                    <div className="text-sm font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </div>

                    {/* Save for later + Remove */}
                    <div className="flex items-center justify-end gap-1.5 lg:justify-center">
                      <button
                        onClick={() => {
                          saveForLater(item.id, item.size, item.color);
                          toast.success(
                            locale === "ar" ? "تم الحفظ لوقت لاحق" : "Saved for later"
                          );
                        }}
                        className="hidden sm:inline-flex h-8 items-center gap-1 rounded-full border border-border px-2.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                        aria-label={t.cart.saveForLater}
                      >
                        <Bookmark className="h-3 w-3" />
                        {t.cart.saveForLater}
                      </button>
                      <button
                        onClick={() => {
                          removeItem(item.id, item.size, item.color);
                          toast.success(
                            locale === "ar" ? "تمت الإزالة من السلة" : "Removed from cart"
                          );
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-[var(--sale)]/10 hover:text-[var(--sale)]"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Mobile compact price row */}
                    <div className="flex items-center justify-between text-sm sm:col-span-2 lg:hidden">
                      <span className="text-muted-foreground">
                        {t.cart.price}:{" "}
                        {item.originalPrice && (
                          <span className="mr-1 text-xs line-through">
                            {formatPrice(item.originalPrice)}
                          </span>
                        )}
                        {formatPrice(item.price)}
                      </span>
                      <span className="font-semibold">
                        {t.cart.total}: {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Continue shopping link */}
              <div className="mt-6">
                <Link
                  href="/shop"
                  className="group inline-flex items-center gap-2 text-sm font-medium hover:text-foreground/70"
                >
                  <ArrowLeft className="h-4 w-4 rtl-flip" />
                  {t.common.continueShopping}
                </Link>
              </div>
            </div>

            {/* RIGHT — ORDER SUMMARY */}
            <motion.aside
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:sticky lg:top-24 lg:self-start"
            >
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  {t.cart.orderSummary}
                </h2>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t.cart.subtotal}</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t.cart.discounts}</span>
                    <span className="font-medium text-[var(--sale)]">
                      {discount > 0 ? `-${formatPrice(discount)}` : formatPrice(0)}
                    </span>
                  </div>

                  {/* Shipping options */}
                  <div>
                    <span className="text-muted-foreground">{t.cart.shipping}</span>
                    <RadioGroup
                      value={shippingId}
                      onValueChange={setShippingId}
                      className="mt-2 space-y-2"
                    >
                      {SHIPPING_OPTIONS.map((opt) => (
                        <Label
                          key={opt.id}
                          htmlFor={`ship-${opt.id}`}
                          className="flex cursor-pointer items-center justify-between rounded-md border border-border px-3 py-2 transition-colors hover:bg-secondary has-[:checked]:border-foreground has-[:checked]:bg-secondary"
                        >
                          <span className="flex items-center gap-2.5">
                            <RadioGroupItem id={`ship-${opt.id}`} value={opt.id} />
                            <span className="text-sm">
                              {t.cart[opt.labelKey as keyof typeof t.cart] as string}
                            </span>
                          </span>
                          <span className="text-sm font-medium">
                            {opt.price === 0 ? formatPrice(0) : formatPrice(opt.price)}
                          </span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                </div>

                <Separator className="my-5" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-widest">
                    {t.cart.total}
                  </span>
                  <span className="font-display text-2xl font-semibold">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Coupon */}
                <div className="mt-5">
                  <Label htmlFor="coupon" className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                    {t.cart.coupon}
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="coupon"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder={coupons[0]?.code || "DISCOUNT10"}
                        className="ps-9"
                      />
                    </div>
                    <Button type="button" variant="outline" onClick={handleApplyCoupon}>
                      {t.cart.apply}
                    </Button>
                  </div>
                  {coupon && (
                    <p className="mt-2 text-xs text-green-700">
                      {locale === "ar" ? "تم تطبيق الكوبون" : "Coupon applied"}: {coupon}
                    </p>
                  )}
                </div>

                {/* Terms */}
                <div className="mt-5">
                  <Label htmlFor="terms" className="flex cursor-pointer items-start gap-2.5 text-xs text-muted-foreground">
                    <Checkbox id="terms" className="mt-0.5" />
                    <span>{t.cart.agreeTerms}</span>
                  </Label>
                </div>

                {/* Checkout button */}
                <Button asChild size="lg" className="mt-5 w-full rounded-full">
                  <Link href="/checkout">
                    {t.cart.processToCheckout}
                    <Arrow className="h-4 w-4 rtl-flip" />
                  </Link>
                </Button>

                <div className="mt-4 text-center">
                  <Link
                    href="/shop"
                    className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    {t.common.continueShopping}
                  </Link>
                </div>

                {/* Secure checkout note */}
                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  <span>
                    {locale === "ar" ? "دفع آمن ومشفّر" : "Secure & encrypted checkout"}
                  </span>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </div>

      {/* SAVED FOR LATER */}
      {savedForLater.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-6 pt-4">
          <div className="mb-5 border-y border-border py-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              {t.cart.savedItems}
              <span className="ms-2 text-sm font-normal text-muted-foreground">
                ({savedForLater.length})
              </span>
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">{t.cart.savedItemsDesc}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedForLater.map((item) => (
              <div
                key={`${item.id}-${item.size}-${item.color}`}
                className="flex gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col">
                  <Link
                    href={`/product/${item.id}`}
                    className="line-clamp-2 text-sm font-medium hover:text-foreground/70"
                  >
                    {item.name}
                  </Link>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    {item.color && <span className="rounded bg-secondary px-1.5 py-0.5">{item.color}</span>}
                    {item.size && <span className="rounded bg-secondary px-1.5 py-0.5">{item.size}</span>}
                  </div>
                  <p className="mt-1 text-sm font-semibold">{formatPrice(item.price)}</p>
                  <div className="mt-auto flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        moveToCart(item.id, item.size, item.color);
                        toast.success(locale === "ar" ? "تم النقل إلى السلة" : "Moved to cart");
                      }}
                      className="h-8 rounded-full px-3 text-xs"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      {t.cart.moveToCart}
                    </Button>
                    <button
                      onClick={() => {
                        removeSaved(item.id, item.size, item.color);
                        toast.success(locale === "ar" ? "تمت الإزالة" : "Removed");
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-[var(--sale)]/10 hover:text-[var(--sale)]"
                      aria-label={t.cart.remove}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* YOU MAY ALSO LIKE */}
      {!isEmpty && (
        <section className="border-t border-border bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 py-14 lg:py-20">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-8 text-center"
            >
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {locale === "ar" ? "مختاراتنا" : "Our picks"}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {t.cart.youMightLike}
              </h2>
            </motion.div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {youMightLike.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function EmptyCart({
  t,
  Arrow,
}: {
  t: ReturnType<typeof useLanguage>["t"];
  Arrow: typeof ArrowRight;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
        <Tag className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mt-5 font-display text-2xl font-semibold">
        {t.cart.emptyTitle}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{t.cart.emptyDesc}</p>
      <Button asChild size="lg" className="mt-6 rounded-full px-7">
        <Link href="/shop">
          {t.common.exploreProducts}
          <Arrow className="h-4 w-4 rtl-flip" />
        </Link>
      </Button>
    </motion.div>
  );
}

// Resolve a color name back to a hex (fallback neutral) for the swatch
function getColorHex(name: string): string {
  const map: Record<string, string> = {
    Gray: "#9ca3af",
    Beige: "#e7d7c1",
    Black: "#1a1a1a",
    White: "#f5f5f0",
    Brown: "#6b4f3a",
    Olive: "#6b6b3a",
    Cream: "#ede4d3",
    Navy: "#2b3a4a",
    Rust: "#9c4a2a",
  };
  return map[name] ?? "#d4d4d4";
}
