"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Package,
  Truck,
  Mail,
  ArrowRight,
  ArrowLeft,
  Copy,
  MapPin,
  CreditCard,
  Home,
} from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { useOrder } from "@/lib/order-store";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect } from "react";
import { useHasMounted } from "@/hooks/use-has-mounted";

export default function OrderConfirmationPage() {
  const { t, locale, dir } = useLanguage();
  const lastOrder = useOrder((s) => s.lastOrder);
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const hasMounted = useHasMounted();

  // Rehydrate the persisted order store on mount (skipHydration is true to avoid SSR mismatch)
  useEffect(() => {
    useOrder.persist.rehydrate();
  }, []);

  const paymentLabel = (method: string) => {
    switch (method) {
      case "credit":
        return t.orderConfirmation.credit;
      case "cod":
        return t.orderConfirmation.cod;
      case "applepay":
        return t.orderConfirmation.applepay;
      case "paypal":
        return t.orderConfirmation.paypal;
      default:
        return method;
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const copyOrderNumber = () => {
    if (!lastOrder) return;
    navigator.clipboard?.writeText(lastOrder.orderNumber);
    toast.success(locale === "ar" ? "تم نسخ رقم الطلب" : "Order number copied");
  };

  // Empty / no-order state
  if (hasMounted && !lastOrder) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
          <Package className="h-9 w-9 text-muted-foreground" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold">
          {t.orderConfirmation.noOrder}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.orderConfirmation.noOrderDesc}
        </p>
        <Button asChild className="mt-6 rounded-full px-7">
          <Link href="/shop">
            {t.orderConfirmation.continueShopping}
            <Arrow className="h-4 w-4 rtl-flip" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:py-16">
      {/* Success header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50"
        >
          <CheckCircle2 className="h-11 w-11 text-emerald-600" />
        </motion.div>
        <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {t.orderConfirmation.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.orderConfirmation.subtitle}
        </p>
        {hasMounted && lastOrder && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {t.orderConfirmation.orderNumber}:
              </span>
              <span className="font-mono text-sm font-semibold">
                {lastOrder.orderNumber}
              </span>
              <button
                onClick={copyOrderNumber}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Copy"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
        {hasMounted && lastOrder && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            {t.orderConfirmation.emailSent}{" "}
            <span className="font-medium text-foreground">{lastOrder.customer.email}</span>
          </p>
        )}
      </motion.div>

      {hasMounted && lastOrder && (
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Left: items + timeline */}
          <div className="space-y-6">
            {/* Order timeline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide">
                  {locale === "ar" ? "حالة الطلب" : "Order Status"}
                </h2>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600">
                  {locale === "ar" ? "قيد المعالجة" : "Processing"}
                </span>
              </div>
              <ol className="mt-4 space-y-4">
                {[
                  {
                    icon: CheckCircle2,
                    title: locale === "ar" ? "تم استلام الطلب" : "Order received",
                    desc: formatDate(lastOrder.date),
                    done: true,
                  },
                  {
                    icon: Package,
                    title: locale === "ar" ? "قيد التجهيز" : "Preparing",
                    desc: locale === "ar" ? "خلال 24 ساعة" : "Within 24 hours",
                    done: false,
                  },
                  {
                    icon: Truck,
                    title: locale === "ar" ? "في الطريق" : "On the way",
                    desc: `${t.orderConfirmation.estimatedDelivery}: ${formatDate(lastOrder.estimatedDelivery)}`,
                    done: false,
                  },
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        step.done ? "bg-emerald-600 text-white" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      <step.icon className="h-4 w-4" />
                    </div>
                    <div className="pt-1">
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </motion.div>

            {/* Items */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <h2 className="border-b border-border pb-3 text-sm font-semibold uppercase tracking-wide">
                {t.orderConfirmation.items} ({lastOrder.items.length})
              </h2>
              <ul className="divide-y divide-border">
                {lastOrder.items.map((item) => (
                  <li key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3 py-3">
                    <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-secondary">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        {item.color && (
                          <span className="rounded bg-secondary px-1.5 py-0.5">{item.color}</span>
                        )}
                        {item.size && (
                          <span className="rounded bg-secondary px-1.5 py-0.5">{item.size}</span>
                        )}
                        <span>· {t.orderConfirmation.qty}: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Right: summary + shipping + payment */}
          <div className="space-y-6">
            {/* Order summary */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <h2 className="border-b border-border pb-3 text-sm font-semibold uppercase tracking-wide">
                {t.orderConfirmation.orderSummary}
              </h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t.orderConfirmation.subtotal}</dt>
                  <dd className="font-medium">{formatPrice(lastOrder.subtotal)}</dd>
                </div>
                {lastOrder.discount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t.orderConfirmation.discount}</dt>
                    <dd className="font-medium text-[var(--sale)]">
                      −{formatPrice(lastOrder.discount)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t.orderConfirmation.shipping}</dt>
                  <dd className="font-medium text-emerald-600">{t.orderConfirmation.free}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <dt className="font-semibold">{t.orderConfirmation.total}</dt>
                  <dd className="font-display text-xl font-semibold">
                    {formatPrice(lastOrder.total)}
                  </dd>
                </div>
              </dl>
            </motion.div>

            {/* Shipping address */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <h2 className="flex items-center gap-2 border-b border-border pb-3 text-sm font-semibold uppercase tracking-wide">
                <MapPin className="h-4 w-4" />
                {t.orderConfirmation.shippingTo}
              </h2>
              <div className="mt-3 text-sm leading-relaxed">
                <p className="font-medium">
                  {lastOrder.customer.firstName} {lastOrder.customer.lastName}
                </p>
                <p className="text-muted-foreground">{lastOrder.customer.street}</p>
                <p className="text-muted-foreground">
                  {lastOrder.customer.town}, {lastOrder.customer.postal}
                </p>
                <p className="text-muted-foreground">{lastOrder.customer.country}</p>
                <p className="mt-2 text-muted-foreground">{lastOrder.customer.phone}</p>
              </div>
            </motion.div>

            {/* Payment */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <h2 className="flex items-center gap-2 border-b border-border pb-3 text-sm font-semibold uppercase tracking-wide">
                <CreditCard className="h-4 w-4" />
                {t.orderConfirmation.paymentMethod}
              </h2>
              <p className="mt-3 text-sm font-medium">{paymentLabel(lastOrder.paymentMethod)}</p>
            </motion.div>
          </div>
        </div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
      >
        <Button asChild className="rounded-full px-7">
          <Link href="/shop">
            {t.orderConfirmation.continueShopping}
            <Arrow className="h-4 w-4 rtl-flip" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full px-7">
          <Link href="/">
            <Home className="h-4 w-4" />
            {t.orderConfirmation.backHome}
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
