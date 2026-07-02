"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Truck, CheckCircle2, MapPin, CreditCard, Mail, Phone, Calendar } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  image?: string;
  size?: string;
  color?: string;
  quantity: number;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  country: string;
  town: string;
  street: string;
  postal: string | null;
  note: string | null;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  status: string;
  estimatedDelivery: string | null;
  createdAt: string;
}

interface OrderDetailDialogProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  paid: { label: "Paid", className: "border-transparent bg-foreground/5 text-foreground" },
  pending: { label: "Pending", className: "border-transparent bg-[var(--sale)]/10 text-[var(--sale)]" },
  cancelled: { label: "Cancelled", className: "border-transparent bg-destructive/10 text-destructive" },
};

const paymentLabels: Record<string, string> = {
  credit: "Credit Card",
  cod: "Cash on Delivery",
  applepay: "Apple Pay",
  paypal: "PayPal",
};

export function OrderDetailDialog({ orderId, open, onOpenChange }: OrderDetailDialogProps) {
  const { locale } = useLanguage();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [fetched, setFetched] = useState(false);
  const ar = locale === "ar";
  // Loading = dialog open but data not yet fetched
  const loading = open && !fetched;

  useEffect(() => {
    if (!open || !orderId) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);

    // Reset state for the new fetch via the async callbacks only (no sync setState in effect body)
    const controller = new AbortController();
    fetch(`/api/admin/orders/${orderId}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        setOrder(data.order);
        setFetched(true);
      })
      .catch((e) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        console.error(e);
        setFetched(true);
      });

    return () => {
      controller.abort();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, orderId, onOpenChange]);

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString(ar ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const st = order ? statusConfig[order.status] ?? statusConfig.pending : null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-background shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => onOpenChange(false)}
                className="absolute end-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur transition-colors hover:bg-foreground hover:text-background"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="custom-scroll max-h-[90vh] overflow-y-auto">
                {loading ? (
                  <div className="p-8">
                    <div className="h-7 w-48 animate-pulse rounded bg-secondary" />
                    <div className="mt-4 space-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-4 w-full animate-pulse rounded bg-secondary" />
                      ))}
                    </div>
                  </div>
                ) : !order ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    {ar ? "تعذر تحميل الطلب" : "Failed to load order"}
                  </div>
                ) : (
                  <div className="p-6 sm:p-8">
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {ar ? "رقم الطلب" : "Order number"}
                        </p>
                        <h2 className="font-display text-xl font-semibold">{order.orderNumber}</h2>
                      </div>
                      {st && (
                        <Badge variant="outline" className={`ms-auto ${st.className}`}>
                          {st.label}
                        </Badge>
                      )}
                    </div>

                    {/* Timeline */}
                    <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{ar ? "تاريخ الطلب" : "Order date"}: {formatDate(order.createdAt)}</span>
                      <span className="mx-1">·</span>
                      <Truck className="h-3.5 w-3.5" />
                      <span>{ar ? "التوصيل المتوقع" : "Est. delivery"}: {formatDate(order.estimatedDelivery)}</span>
                    </div>

                    {/* Items */}
                    <div className="mt-5">
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {ar ? "العناصر" : "Items"} ({order.items.length})
                      </h3>
                      <ul className="divide-y divide-border rounded-xl border border-border">
                        {order.items.map((item, i) => (
                          <li key={`${item.id}-${i}`} className="flex gap-3 p-3">
                            {item.image && (
                              <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-md bg-secondary">
                                <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                              </div>
                            )}
                            <div className="flex flex-1 flex-col">
                              <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                              <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                {item.color && <span className="rounded bg-secondary px-1.5 py-0.5">{item.color}</span>}
                                {item.size && <span className="rounded bg-secondary px-1.5 py-0.5">{item.size}</span>}
                                <span>· {ar ? "الكمية" : "Qty"}: {item.quantity}</span>
                              </div>
                            </div>
                            <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Summary + customer grid */}
                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      {/* Summary */}
                      <div className="rounded-xl border border-border p-4">
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          {ar ? "الملخص" : "Summary"}
                        </h3>
                        <dl className="space-y-1.5 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">{ar ? "المجموع الفرعي" : "Subtotal"}</dt>
                            <dd>{formatPrice(order.subtotal)}</dd>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">{ar ? "الخصم" : "Discount"}</dt>
                              <dd className="text-[var(--sale)]">−{formatPrice(order.discount)}</dd>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">{ar ? "الشحن" : "Shipping"}</dt>
                            <dd>{order.shipping === 0 ? (ar ? "مجاني" : "Free") : formatPrice(order.shipping)}</dd>
                          </div>
                          <div className="flex items-center justify-between border-t border-border pt-1.5">
                            <dt className="font-semibold">{ar ? "الإجمالي" : "Total"}</dt>
                            <dd className="font-display text-lg font-semibold">{formatPrice(order.total)}</dd>
                          </div>
                        </dl>
                      </div>

                      {/* Customer */}
                      <div className="rounded-xl border border-border p-4">
                        <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {ar ? "العميل" : "Customer"}
                        </h3>
                        <div className="space-y-1 text-sm">
                          <p className="font-medium">{order.customerName}</p>
                          <p className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="h-3 w-3" /> {order.customerEmail}
                          </p>
                          {order.customerPhone && (
                            <p className="flex items-center gap-1.5 text-muted-foreground">
                              <Phone className="h-3 w-3" /> {order.customerPhone}
                            </p>
                          )}
                          <p className="pt-1 text-xs text-muted-foreground">
                            {order.street}, {order.town}
                            {order.postal ? `, ${order.postal}` : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">{order.country}</p>
                        </div>
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="mt-5 flex items-center gap-2 rounded-xl border border-border p-4 text-sm">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{ar ? "طريقة الدفع" : "Payment method"}:</span>
                      <span className="font-medium">{paymentLabels[order.paymentMethod] ?? order.paymentMethod}</span>
                    </div>

                    {order.note && (
                      <div className="mt-3 rounded-xl bg-secondary/40 p-4 text-sm">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">{ar ? "ملاحظة" : "Note"}</p>
                        <p className="mt-1">{order.note}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
