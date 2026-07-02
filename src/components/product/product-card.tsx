"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Eye, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "@/context/language-provider";
import { useCart } from "@/lib/cart-store";
import { useUI } from "@/lib/ui-store";
import { useQuickView } from "@/context/quick-view-provider";
import { useCountdown, formatCountdown } from "@/hooks/use-countdown";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { type Product } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: "default" | "compact";
}

export function ProductCard({ product, index = 0, variant = "default" }: ProductCardProps) {
  const { locale, t } = useLanguage();
  const [hovered, setHovered] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const toggleWishlist = useCart((s) => s.toggleWishlist);
  const wishlist = useCart((s) => s.wishlist);
  const isWishlisted = wishlist.includes(product.id);
  const { openQuickView } = useQuickView();
  // HOT SALE countdown window length comes from the `countdownHours` site
  // setting (default 48h) so admins can tune urgency without a code change.
  const { settings } = useSiteSettings();
  const countdownHours = Number(settings.countdownHours) || 48;
  const countdown = useCountdown(product.id, countdownHours);

  const name = locale === "ar" ? product.nameAr : product.name;
  const category = locale === "ar" ? product.categoryAr : product.category;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images[0],
      size: product.sizes[0],
      color: product.colors[0]?.name,
    });
    toast.success(`${name} ${t.common.addToCart.toLowerCase()}`, {
      action: {
        label: t.cart.title,
        onClick: () => useUI.getState().setCartOpen(true),
      },
    });
    useUI.getState().setCartOpen(true);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
      className="group relative"
    >
      <Link
        href={`/product/${product.id}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="block"
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary">
          <Image
            src={product.images[0]}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* secondary image on hover */}
          {product.images[1] && (
            <Image
              src={product.images[1]}
              alt={name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className={`object-cover transition-opacity duration-500 ${
                hovered ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          {/* Badges — top-right, matching original */}
          <div className="absolute end-3 top-3 flex flex-col gap-1.5">
            {product.discount && (
              <span className="rounded-full bg-[var(--sale)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                -{product.discount}%
              </span>
            )}
            {product.newArrival && !product.discount && (
              <span className="rounded-full bg-foreground px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-background">
                New
              </span>
            )}
          </div>

          {/* Action stack: wishlist + quick view — top-left */}
          <div className="absolute start-3 top-3 flex flex-col gap-1.5">
            <button
              onClick={handleWishlist}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-background/90 backdrop-blur transition-all hover:bg-foreground hover:text-background"
              aria-label="Wishlist"
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-[var(--sale)] text-[var(--sale)]" : ""}`} />
            </button>
            <button
              onClick={handleQuickView}
              className="flex h-8 w-8 -translate-x-3 items-center justify-center rounded-full bg-background/90 opacity-0 backdrop-blur transition-all duration-300 hover:bg-foreground hover:text-background group-hover:translate-x-0 group-hover:opacity-100"
              aria-label={locale === "ar" ? "نظرة سريعة" : "Quick view"}
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>

          {/* Quick actions */}
          <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={handleAdd}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-background/95 py-2.5 text-xs font-semibold uppercase tracking-wider backdrop-blur transition-colors hover:bg-foreground hover:text-background"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {t.common.addToCart}
            </button>
          </div>

          {/* HOT SALE countdown badge (matches original template) */}
          {product.discount && (
            <div className="absolute inset-x-3 bottom-3 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0">
              <div className="flex w-full items-center justify-between rounded-full bg-[var(--sale)] px-3 py-1.5 text-white shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {countdown.expired
                    ? locale === "ar" ? "انتهى!" : "Time's up!"
                    : locale === "ar" ? "خصم 25%" : "HOT SALE 25%"}
                </span>
                {!countdown.expired && (
                  <span className="font-mono text-[11px] font-bold tabular-nums">
                    {formatCountdown(countdown)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-3 px-0.5">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            {category}
          </p>
          <h3 className="mt-1 line-clamp-1 text-sm font-medium leading-snug transition-colors group-hover:text-foreground/80">
            {name}
          </h3>
          {variant === "default" && (
            <div className="mt-1.5 flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs text-muted-foreground">
                {product.rating.toFixed(1)} ({product.reviews})
              </span>
            </div>
          )}
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          {/* Color dots */}
          {product.colors.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              {product.colors.slice(0, 4).map((c) => (
                <span
                  key={c.name}
                  className="h-3 w-3 rounded-full border border-border"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
