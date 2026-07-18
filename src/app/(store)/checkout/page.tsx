"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Lock,
  CreditCard,
  Tag,
  Truck,
  ShieldCheck,
  User,
} from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { useCart } from "@/lib/cart-store";
import { useOrder, createOrderNumber, type PlacedOrderItem } from "@/lib/order-store";
import { formatPrice } from "@/lib/format";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useCoupons } from "@/hooks/use-coupons";
import { computeTotalDiscount } from "@/lib/discount";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type PaymentMethod = "credit" | "cod" | "applepay" | "paypal";

const FALLBACK_COUNTRIES = [
  { value: "us", label: "United States" },
  { value: "au", label: "Australia" },
  { value: "de", label: "Germany" },
  { value: "ae", label: "United Arab Emirates" },
  { value: "gb", label: "United Kingdom" },
  { value: "fr", label: "France" },
  { value: "ca", label: "Canada" },
  { value: "jp", label: "Japan" },
];

export default function CheckoutPage() {
  const { t, locale, dir } = useLanguage();
  const router = useRouter();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const coupon = useCart((s) => s.coupon);
  const applyCoupon = useCart((s) => s.applyCoupon);
  const clearCart = useCart((s) => s.clearCart);
  const setLastOrder = useOrder((s) => s.setLastOrder);

  // Dynamic business config: active coupons + auto-discount settings from the DB.
  const { settings } = useSiteSettings();
  const { coupons } = useCoupons();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit");
  const [saveCard, setSaveCard] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Form state
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    town: "",
    street: "",
    postal: "",
    note: "",
    nameOnCard: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Voucher code input
  const [voucherInput, setVoucherInput] = useState("");
  const countries = (() => {
    try {
      const parsed = JSON.parse(settings.countries || "[]");
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.map((c: string) => ({ value: c.toLowerCase().replace(/\s/g, "-"), label: c }));
    } catch {}
    return FALLBACK_COUNTRIES;
  })();

  // Discount logic — applied coupon (validated against active coupons from the
  // DB) takes precedence; otherwise fall back to the auto-discount rule
  // (discountThreshold / discountPercentage / maxDiscount from site settings).
  const discount = useMemo(
    () => computeTotalDiscount(coupons, coupon, settings, subtotal),
    [coupons, coupon, settings, subtotal]
  );

  const shipping = 0; // Free shipping
  const total = Math.max(0, subtotal - discount + shipping);

  const isEmpty = items.length === 0;

  const setField = (key: keyof typeof form, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const required: (keyof typeof form)[] = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "country",
    "town",
    "street",
    "postal",
  ];
  if (paymentMethod === "credit") {
    required.push("nameOnCard", "cardNumber", "expiry", "cvv");
  }

  const handleApplyCode = (code: string) => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      toast.error(locale === "ar" ? "أدخل الرمز" : "Enter a code");
      return;
    }
    // If coupons have loaded, validate the code against the active coupons
    // from the DB. If they're still loading, fall back to optimistic apply.
    if (coupons.length > 0 && !coupons.some((c) => c.code.toUpperCase() === normalized)) {
      toast.error(
        locale === "ar"
          ? `كود الخصم "${normalized}" غير صالح أو منتهي`
          : `Coupon "${normalized}" is invalid or expired`
      );
      return;
    }
    applyCoupon(normalized);
    toast.success(
      locale === "ar"
        ? `تم تطبيق الرمز: ${normalized}`
        : `Code applied: ${normalized}`
    );
    setVoucherInput("");
  };

  const [placingOrder, setPlacingOrder] = useState(false);

  const handlePlaceOrder = async () => {
    // Validate required fields
    const missing = required.filter((k) => !form[k].trim());
    setTouched(
      required.reduce((acc, k) => ({ ...acc, [k]: true }), {} as Record<string, boolean>)
    );
    if (missing.length > 0) {
      toast.error(
        locale === "ar"
          ? "يرجى تعبئة جميع الحقول المطلوبة"
          : "Please fill in all required fields"
      );
      return;
    }
    if (!agreeTerms) {
      toast.error(
        locale === "ar"
          ? "يرجى الموافقة على الشروط والأحكام"
          : "Please accept the terms & conditions"
      );
      return;
    }

    const orderNumber = createOrderNumber();
    const customer = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      country: form.country,
      town: form.town,
      street: form.street,
      postal: form.postal,
      note: form.note,
    };

    setPlacingOrder(true);
    try {
      // The server recomputes prices, discount, and totals from the database
      // and enforces stock availability — the values below are for optimistic
      // UI only; what actually gets billed/stored comes back in the response.
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          customer,
          couponCode: coupon,
          paymentMethod,
          items: items.map((i) => ({
            id: i.id,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || (locale === "ar" ? "تعذر إتمام الطلب" : "Could not place order"));
        return;
      }

      const orderItems: PlacedOrderItem[] = data.order.items;
      setLastOrder({
        orderNumber: data.order.orderNumber,
        date: data.order.createdAt,
        items: orderItems,
        subtotal: data.order.subtotal,
        discount: data.order.discount,
        shipping: data.order.shipping,
        total: data.order.total,
        customer,
        paymentMethod,
        estimatedDelivery: data.order.estimatedDelivery,
      });

      clearCart();
      toast.success(
        locale === "ar" ? "تم تأكيد الطلب بنجاح!" : "Order placed successfully!"
      );
      router.push("/order-confirmation");
    } catch (e) {
      console.error("Failed to place order:", e);
      toast.error(locale === "ar" ? "تعذر إتمام الطلب" : "Could not place order");
    } finally {
      setPlacingOrder(false);
    }
  };

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
              {t.checkout.title}
            </h1>
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
              <Link href="/cart" className="hover:text-foreground">
                {t.checkout.breadcrumb}
              </Link>
              <ChevronRight className="h-3 w-3 rtl-flip" />
              <span className="text-foreground">{t.checkout.title}</span>
            </nav>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
        {/* LOGIN PROMPT */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
        >
          <p className="text-sm text-muted-foreground">
            {t.checkout.haveAccount}{" "}
            <Link href="/" className="font-medium text-foreground underline-offset-4 hover:underline">
              {t.checkout.loginHere}
            </Link>
          </p>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/">
              <User className="h-3.5 w-3.5" />
              {t.checkout.login}
            </Link>
          </Button>
        </motion.div>

        {isEmpty ? (
          <EmptyCheckout t={t} Arrow={Arrow} />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_440px] lg:gap-10">
            {/* LEFT — FORM */}
            <div className="space-y-8">
              {/* INFORMATION */}
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-xl border border-border bg-card p-6 sm:p-7"
              >
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                    1
                  </span>
                  <h2 className="font-display text-xl font-semibold tracking-tight">
                    {t.checkout.information}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    id="firstName"
                    label={`${t.checkout.firstName} *`}
                    value={form.firstName}
                    onChange={(v) => setField("firstName", v)}
                    invalid={touched.firstName && !form.firstName.trim()}
                    onBlur={() => setTouched((p) => ({ ...p, firstName: true }))}
                  />
                  <Field
                    id="lastName"
                    label={`${t.checkout.lastName} *`}
                    value={form.lastName}
                    onChange={(v) => setField("lastName", v)}
                    invalid={touched.lastName && !form.lastName.trim()}
                    onBlur={() => setTouched((p) => ({ ...p, lastName: true }))}
                  />
                  <Field
                    id="email"
                    type="email"
                    label={`${t.checkout.email} *`}
                    value={form.email}
                    onChange={(v) => setField("email", v)}
                    invalid={touched.email && !form.email.trim()}
                    onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                  />
                  <Field
                    id="phone"
                    type="tel"
                    label={`${t.checkout.phone} *`}
                    value={form.phone}
                    onChange={(v) => setField("phone", v)}
                    invalid={touched.phone && !form.phone.trim()}
                    onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                  />

                  {/* Country */}
                  <div className="sm:col-span-2">
                    <Label htmlFor="country" className="mb-1.5 block text-sm">
                      {t.checkout.chooseCountry} *
                    </Label>
                    <Select
                      value={form.country}
                      onValueChange={(v) => setField("country", v)}
                    >
                      <SelectTrigger
                        id="country"
                        className={touched.country && !form.country ? "border-destructive" : ""}
                        onBlur={() => setTouched((p) => ({ ...p, country: true }))}
                      >
                        <SelectValue placeholder={t.checkout.chooseCountry} />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Field
                    id="town"
                    label={`${t.checkout.town} *`}
                    value={form.town}
                    onChange={(v) => setField("town", v)}
                    invalid={touched.town && !form.town.trim()}
                    onBlur={() => setTouched((p) => ({ ...p, town: true }))}
                  />
                  <Field
                    id="postal"
                    label={`${t.checkout.postal} *`}
                    value={form.postal}
                    onChange={(v) => setField("postal", v)}
                    invalid={touched.postal && !form.postal.trim()}
                    onBlur={() => setTouched((p) => ({ ...p, postal: true }))}
                  />
                  <div className="sm:col-span-2">
                    <Field
                      id="street"
                      label={`${t.checkout.street} *`}
                      value={form.street}
                      onChange={(v) => setField("street", v)}
                      invalid={touched.street && !form.street.trim()}
                      onBlur={() => setTouched((p) => ({ ...p, street: true }))}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="note" className="mb-1.5 block text-sm">
                      {t.checkout.note}
                    </Label>
                    <Textarea
                      id="note"
                      value={form.note}
                      onChange={(e) => setField("note", e.target.value)}
                      rows={3}
                      placeholder={locale === "ar" ? "ملاحظات إضافية..." : "Additional notes..."}
                    />
                  </div>
                </div>
              </motion.section>

              {/* PAYMENT OPTIONS */}
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-xl border border-border bg-card p-6 sm:p-7"
              >
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                    2
                  </span>
                  <h2 className="font-display text-xl font-semibold tracking-tight">
                    {t.checkout.paymentOption}
                  </h2>
                </div>

                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                  className="space-y-3"
                >
                  <PaymentOption
                    value="credit"
                    methodName={t.checkout.creditCard}
                    description={t.checkout.creditCardDesc}
                    icon={<CreditCard className="h-4 w-4" />}
                    badges={["VISA", "MC", "AMEX"]}
                    checked={paymentMethod === "credit"}
                  >
                    {paymentMethod === "credit" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
                      >
                        <div className="sm:col-span-2">
                          <Field
                            id="nameOnCard"
                            label={`${t.checkout.nameOnCard} *`}
                            value={form.nameOnCard}
                            onChange={(v) => setField("nameOnCard", v)}
                            invalid={touched.nameOnCard && !form.nameOnCard.trim()}
                            onBlur={() => setTouched((p) => ({ ...p, nameOnCard: true }))}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label htmlFor="cardNumber" className="mb-1.5 block text-sm">
                            {t.checkout.cardNumber} *
                          </Label>
                          <div className="relative">
                            <Input
                              id="cardNumber"
                              value={form.cardNumber}
                              onChange={(e) =>
                                setField(
                                  "cardNumber",
                                  e.target.value
                                    .replace(/[^\d\s]/g, "")
                                    .replace(/(\d{4})(?=\d)/g, "$1 ")
                                    .slice(0, 19)
                                )
                              }
                              placeholder="0000 0000 0000 0000"
                              className={`pe-16 ${touched.cardNumber && !form.cardNumber ? "border-destructive" : ""}`}
                              onBlur={() => setTouched((p) => ({ ...p, cardNumber: true }))}
                            />
                            <div className="pointer-events-none absolute end-2 top-1/2 flex -translate-y-1/2 gap-1">
                              <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-bold">VISA</span>
                              <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-bold">MC</span>
                            </div>
                          </div>
                        </div>
                        <Field
                          id="expiry"
                          label={`${t.checkout.expiry} *`}
                          value={form.expiry}
                          onChange={(v) => setField("expiry", v)}
                          invalid={touched.expiry && !form.expiry.trim()}
                          onBlur={() => setTouched((p) => ({ ...p, expiry: true }))}
                          placeholder="mm/dd/yyyy"
                        />
                        <Field
                          id="cvv"
                          label={`${t.checkout.cvv} *`}
                          value={form.cvv}
                          onChange={(v) => setField("cvv", v.replace(/\D/g, "").slice(0, 4))}
                          invalid={touched.cvv && !form.cvv.trim()}
                          onBlur={() => setTouched((p) => ({ ...p, cvv: true }))}
                          placeholder="123"
                        />
                        <div className="sm:col-span-2">
                          <Label htmlFor="saveCard" className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
                            <Checkbox
                              id="saveCard"
                              checked={saveCard}
                              onCheckedChange={(c) => setSaveCard(c === true)}
                            />
                            <span>{t.checkout.saveCard}</span>
                          </Label>
                        </div>
                      </motion.div>
                    )}
                  </PaymentOption>

                  <PaymentOption
                    value="cod"
                    methodName={t.checkout.cashOnDelivery}
                    description={
                      locale === "ar"
                        ? "ادفع نقداً عند استلام طلبك."
                        : "Pay with cash upon delivery of your order."
                    }
                    icon={<Truck className="h-4 w-4" />}
                    checked={paymentMethod === "cod"}
                  />
                  <PaymentOption
                    value="applepay"
                    methodName={t.checkout.applePay}
                    description={
                      locale === "ar"
                        ? "ادفع بسهولة وأمان باستخدام Apple Pay."
                        : "Pay easily and securely with Apple Pay."
                    }
                    icon={<span className="text-xs"></span>}
                    checked={paymentMethod === "applepay"}
                  />
                  <PaymentOption
                    value="paypal"
                    methodName={t.checkout.paypal}
                    description={
                      locale === "ar"
                        ? "ستتم إعادة توجيهك إلى PayPal لإتمام الدفع."
                        : "You will be redirected to PayPal to complete your payment."
                    }
                    icon={<span className="text-xs font-bold italic">P</span>}
                    checked={paymentMethod === "paypal"}
                  />
                </RadioGroup>

                {/* Terms agreement */}
                <div className="mt-5 rounded-lg bg-secondary/50 p-3">
                  <Label htmlFor="terms" className="flex cursor-pointer items-start gap-2.5 text-xs text-muted-foreground">
                    <Checkbox
                      id="terms"
                      className="mt-0.5"
                      checked={agreeTerms}
                      onCheckedChange={(c) => setAgreeTerms(c === true)}
                    />
                    <span>{t.cart.agreeTerms}</span>
                  </Label>
                </div>
              </motion.section>
            </div>

            {/* RIGHT — ORDER SUMMARY */}
            <motion.aside
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:sticky lg:top-24 lg:self-start"
            >
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  {t.checkout.shoppingCart}
                </h2>

                {/* Cart items */}
                <div className="mt-4 max-h-80 space-y-3 overflow-y-auto custom-scroll pe-1">
                  {items.map((item) => (
                    <div
                      key={`${item.id}-${item.size}-${item.color}`}
                      className="flex items-center gap-3"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                        <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {[item.size, item.color].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Discount block */}
                <div className="rounded-lg border border-dashed border-[var(--sale)]/40 bg-[var(--sale)]/5 p-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-[var(--sale)]" />
                    <p className="text-xs font-medium text-foreground">{t.checkout.discountDesc}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Input
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value)}
                      placeholder={coupons[0]?.code || "DISCOUNT10"}
                      className="font-mono text-sm"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleApplyCode(voucherInput)}
                    >
                      {t.checkout.applyCode}
                    </Button>
                  </div>
                </div>

                {/* Totals */}
                <div className="mt-4 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t.cart.subtotal}</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t.cart.shipping}</span>
                    <span className="font-medium text-green-700">
                      {locale === "ar" ? "مجاني" : "Free"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t.checkout.discount}</span>
                    <span className="font-medium text-[var(--sale)]">
                      -{formatPrice(discount)}
                    </span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-widest">
                    {t.cart.total}
                  </span>
                  <span className="font-display text-2xl font-semibold">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Place Order button */}
                <Button
                  type="button"
                  size="lg"
                  className="mt-5 w-full rounded-full"
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                >
                  <Lock className="h-4 w-4" />
                  {placingOrder
                    ? locale === "ar" ? "جارٍ المعالجة..." : "Processing..."
                    : t.checkout.placeOrder}
                </Button>

                {/* Trust */}
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {locale === "ar" ? "دفع آمن" : "Secure"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" />
                    {locale === "ar" ? "مشفّر" : "Encrypted"}
                  </span>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </div>
    </>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  invalid,
  onBlur,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  invalid?: boolean;
  onBlur?: () => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block text-sm">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        className={invalid ? "border-destructive" : ""}
      />
    </div>
  );
}

function PaymentOption({
  value,
  methodName,
  description,
  icon,
  badges,
  checked,
  children,
}: {
  value: string;
  methodName: string;
  description: string;
  icon?: React.ReactNode;
  badges?: string[];
  checked?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 transition-colors ${
        checked ? "border-foreground bg-secondary/40" : "border-border hover:bg-secondary/30"
      }`}
    >
      <Label
        htmlFor={`pay-${value}`}
        className="flex cursor-pointer items-start gap-3"
      >
        <RadioGroupItem id={`pay-${value}`} value={value} className="mt-1" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {icon && (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-foreground">
                  {icon}
                </span>
              )}
              <span className="text-sm font-semibold">{methodName}</span>
            </div>
            {badges && (
              <div className="flex items-center gap-1">
                {badges.map((b) => (
                  <span
                    key={b}
                    className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground"
                  >
                    {b}
                  </span>
                ))}
              </div>
            )}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </Label>
      {children}
    </div>
  );
}

function EmptyCheckout({
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
