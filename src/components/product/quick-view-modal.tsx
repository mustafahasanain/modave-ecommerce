"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Star,
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  ChevronRight,
  ChevronLeft,
  Eye,
  Truck,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { useCart } from "@/lib/cart-store";
import { useUI } from "@/lib/ui-store";
import { type Product } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickViewModal({ product, open, onOpenChange }: QuickViewModalProps) {
  const { t } = useLanguage();

  // Lock body scroll + Escape to close
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onOpenChange(false);
      };
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKey);
      };
    }
    document.body.style.overflow = "";
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-background shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => onOpenChange(false)}
                className="absolute end-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur transition-colors hover:bg-foreground hover:text-background"
                aria-label={t.common.close}
              >
                <X className="h-5 w-5" />
              </button>
              {/* key on product.id remounts inner content, resetting local state cleanly */}
              <QuickViewContent key={product.id} product={product} onDone={() => onOpenChange(false)} />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function QuickViewContent({ product, onDone }: { product: Product; onDone: () => void }) {
  const { t, locale, dir } = useLanguage();
  const addItem = useCart((s) => s.addItem);
  const toggleWishlist = useCart((s) => s.toggleWishlist);
  const wishlist = useCart((s) => s.wishlist);
  const setCartOpen = useUI((s) => s.setCartOpen);

  // lazy initializers — no effect needed
  const [activeImg, setActiveImg] = useState(0);
  const [color, setColor] = useState<string>(product.colors[0]?.name ?? "");
  const [size, setSize] = useState<string>(
    product.sizes?.includes("M") ? "M" : product.sizes?.[0] ?? ""
  );
  const [qty, setQty] = useState(1);

  const isWishlisted = wishlist.includes(product.id);

  const name = locale === "ar" ? product.nameAr : product.name;
  const category = locale === "ar" ? product.categoryAr : product.category;
  const description = locale === "ar" ? product.descriptionAr : product.description;
  const lineTotal = product.price * qty;
  const Next = dir === "rtl" ? ChevronLeft : ChevronRight;
  const Prev = dir === "rtl" ? ChevronRight : ChevronLeft;

  const handleAdd = () => {
    addItem(
      {
        id: product.id,
        name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images[0],
        size: size || undefined,
        color: color || undefined,
      },
      qty
    );
    toast.success(`${name} ${t.common.addToCart.toLowerCase()}`);
    onDone();
    setCartOpen(true);
  };

  const handleWishlist = () => {
    toggleWishlist(product.id);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const nextImg = () => setActiveImg((i) => (i + 1) % product.images.length);
  const prevImg = () => setActiveImg((i) => (i - 1 + product.images.length) % product.images.length);

  return (
    <div className="custom-scroll max-h-[92vh] overflow-y-auto">
      <div className="grid md:grid-cols-2">
        {/* Gallery */}
        <div className="relative bg-secondary">
          <div className="relative aspect-[4/5] md:aspect-square">
            <Image
              src={product.images[activeImg]}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            {product.discount && (
              <span className="absolute start-4 top-4 rounded-full bg-[var(--sale)] px-3 py-1 text-xs font-bold text-white">
                -{product.discount}%
              </span>
            )}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevImg}
                  className="absolute start-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 backdrop-blur transition-colors hover:bg-foreground hover:text-background"
                  aria-label="Previous"
                >
                  <Prev className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImg}
                  className="absolute end-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 backdrop-blur transition-colors hover:bg-foreground hover:text-background"
                  aria-label="Next"
                >
                  <Next className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 p-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`relative h-16 w-14 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                    activeImg === i ? "border-foreground" : "border-transparent opacity-60"
                  }`}
                >
                  <Image src={img} alt={`${name} ${i + 1}`} fill sizes="56px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {category}
          </p>
          <h2 className="mt-1.5 font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {name}
          </h2>

          <div className="mt-2 flex items-center gap-2 text-sm">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-border"
                  }`}
                />
              ))}
            </div>
            <span className="text-muted-foreground">
              ({product.reviews} {t.product.reviews})
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-base text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>

          {/* Colors */}
          {product.colors.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 text-xs font-medium">
                {t.product.colors}: <span className="text-muted-foreground">{color}</span>
              </div>
              <div className="flex items-center gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.name)}
                    title={c.name}
                    className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
                      color === c.name ? "border-foreground" : "border-border"
                    }`}
                  >
                    <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 text-xs font-medium">
                {t.product.selectedSize}: <span className="text-muted-foreground">{size}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-10 rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                      size === s
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Add */}
          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-border">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Decrease"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Increase"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <Button onClick={handleAdd} className="flex-1 rounded-full">
              <ShoppingBag className="h-4 w-4" />
              {t.common.addToCart} — {formatPrice(lineTotal)}
            </Button>
            <Button
              onClick={handleWishlist}
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-full shrink-0"
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-[var(--sale)] text-[var(--sale)]" : ""}`} />
            </Button>
          </div>

          {/* View full details */}
          <Link
            href={`/product/${product.id}`}
            onClick={onDone}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            {locale === "ar" ? "عرض التفاصيل الكاملة" : "View full details"}
            <Next className="h-3.5 w-3.5 rtl-flip" />
          </Link>

          {/* Trust mini */}
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
            {[
              { icon: Truck, label: locale === "ar" ? "شحن سريع" : "Fast shipping" },
              { icon: RefreshCw, label: locale === "ar" ? "إرجاع 14 يوم" : "14-day returns" },
              { icon: ShieldCheck, label: locale === "ar" ? "دفع آمن" : "Secure pay" },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <f.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
