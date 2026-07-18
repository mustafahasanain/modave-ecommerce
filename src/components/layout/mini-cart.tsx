"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ArrowLeft, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useUI } from "@/lib/ui-store";
import { useLanguage } from "@/context/language-provider";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";

const FREE_SHIP_THRESHOLD = 70;

export function MiniCart() {
  const { t, locale, dir } = useLanguage();
  const open = useUI((s) => s.cartOpen);
  const setOpen = useUI((s) => s.setCartOpen);
  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const subtotal = useCart((s) => s.subtotal());
  const count = useCart((s) => s.count());

  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const side = dir === "rtl" ? "left" : "right";

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px]"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: dir === "rtl" ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: dir === "rtl" ? "-100%" : "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            className={`fixed top-0 ${side}-0 z-[90] flex h-full w-full max-w-md flex-col bg-background shadow-2xl`}
            role="dialog"
            aria-label="Mini cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                <h2 className="font-display text-lg font-semibold">
                  {t.cart.title}
                </h2>
                {count > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-[11px] font-semibold text-background">
                    {count}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setOpen(false)}
                aria-label={t.common.close}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {items.length === 0 ? (
              /* Empty */
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                  <ShoppingBag className="h-9 w-9 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold">{t.cart.emptyTitle}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{t.cart.emptyDesc}</p>
                </div>
                <Button asChild className="mt-2 rounded-full px-7" onClick={() => setOpen(false)}>
                  <Link href="/shop">
                    {t.common.exploreProducts}
                    <Arrow className="h-4 w-4 rtl-flip" />
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Free shipping progress */}
                <div className="border-b border-border bg-secondary/30 px-5 py-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Truck className="h-4 w-4 shrink-0 text-muted-foreground" />
                    {remaining > 0 ? (
                      <span className="text-muted-foreground">
                        {locale === "ar" ? "أضف" : "Add"}{" "}
                        <span className="font-semibold text-foreground">{formatPrice(remaining)}</span>{" "}
                        {locale === "ar" ? "للحصول على شحن مجاني" : "more for free shipping"}
                      </span>
                    ) : (
                      <span className="font-medium text-emerald-600">
                        {t.cart.freeShipUnlocked}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                    <motion.div
                      className="h-full rounded-full bg-foreground"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Items */}
                <div className="custom-scroll flex-1 overflow-y-auto px-5 py-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={`${item.id}-${item.size}-${item.color}`}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, x: dir === "rtl" ? 40 : -40 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-3 border-b border-border py-4 first:pt-0"
                      >
                        <Link
                          href={`/product/${item.id}`}
                          onClick={() => setOpen(false)}
                          className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </Link>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/product/${item.id}`}
                              onClick={() => setOpen(false)}
                              className="line-clamp-2 text-sm font-medium hover:text-foreground/70"
                            >
                              {item.name}
                            </Link>
                            <button
                              onClick={() => removeItem(item.id, item.size, item.color)}
                              className="text-muted-foreground transition-colors hover:text-[var(--sale)]"
                              aria-label={t.wishlist.remove}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                            {item.color && (
                              <span className="rounded bg-secondary px-1.5 py-0.5">{item.color}</span>
                            )}
                            {item.size && (
                              <span className="rounded bg-secondary px-1.5 py-0.5">{item.size}</span>
                            )}
                          </div>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center rounded-full border border-border">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1, item.size, item.color)
                                }
                                className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground"
                                aria-label="Decrease"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-7 text-center text-xs font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1, item.size, item.color)
                                }
                                className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground"
                                aria-label="Increase"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="text-sm font-semibold">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="border-t border-border px-5 py-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t.cart.subtotal}</span>
                    <span className="font-display text-xl font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {locale === "ar"
                      ? "تُحسب الضرائب والشحن عند الدفع"
                      : "Taxes & shipping calculated at checkout"}
                  </p>
                  <div className="mt-4 grid gap-2">
                    <Button asChild className="rounded-full" onClick={() => setOpen(false)}>
                      <Link href="/checkout">
                        {t.common.processToCheckout}
                        <Arrow className="h-4 w-4 rtl-flip" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setOpen(false)}
                      asChild
                    >
                      <Link href="/cart">{t.cart.title}</Link>
                    </Button>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {locale === "ar" ? "دفع آمن ومشفّر" : "Secure & encrypted checkout"}
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
