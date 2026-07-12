"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Eye, GitCompare, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "@/context/language-provider";
import { useCart } from "@/lib/cart-store";
import { useUI } from "@/lib/ui-store";
import { useQuickView } from "@/context/quick-view-provider";
import { type Product } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: "default" | "compact";
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { locale, t } = useLanguage();
  const [hovered, setHovered] = useState(false);
  const [colorSrc, setColorSrc] = useState<string | null>(null);
  const addItem = useCart((s) => s.addItem);
  const toggleWishlist = useCart((s) => s.toggleWishlist);
  const wishlist = useCart((s) => s.wishlist);
  const isWishlisted = wishlist.includes(product.id);
  const { openQuickView } = useQuickView();

  const name = locale === "ar" ? product.nameAr : product.name;

  const addToCart = (size?: string) => {
    addItem({
      id: product.id,
      name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images[0],
      size: size ?? product.sizes[0],
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

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart();
  };

  const handleAddSize = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(size);
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

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(locale === "ar" ? "أضيف للمقارنة" : "Added to compare");
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
                hovered && !colorSrc ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          {/* color-swatch preview — swaps to the hovered color's image */}
          <Image
            src={colorSrc ?? product.images[0]}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className={`object-cover transition-opacity duration-300 ${
              colorSrc ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Badges — top-left */}
          <div className="absolute start-3 top-3 flex flex-col gap-1.5">
            {product.discount && (
              <span className="rounded-full bg-[var(--sale)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                -{product.discount}%
              </span>
            )}
          </div>

          {/* Action stack — top-right, reveal on hover */}
          <div className="absolute end-3 top-3 flex flex-col gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
            <button
              onClick={handleWishlist}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-md transition-colors hover:bg-foreground hover:text-background"
              aria-label="Wishlist"
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-[var(--sale)] text-[var(--sale)]" : ""}`} />
            </button>
            <button
              onClick={handleCompare}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-md transition-colors hover:bg-foreground hover:text-background"
              aria-label={locale === "ar" ? "قارن" : "Compare"}
            >
              <GitCompare className="h-4 w-4" />
            </button>
            <button
              onClick={handleQuickView}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-md transition-colors hover:bg-foreground hover:text-background"
              aria-label={locale === "ar" ? "نظرة سريعة" : "Quick view"}
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>

          {/* HOT SALE marquee bar — hidden on hover */}
          {product.discount && (
            <div className="absolute inset-x-0 bottom-0 overflow-hidden bg-[#181818] py-2 transition-opacity duration-300 group-hover:opacity-0">
              <div className="flex w-max animate-marquee items-center whitespace-nowrap">
                {[...Array(8)].map((_, i) => (
                  <span
                    key={i}
                    className="mx-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white"
                  >
                    <Zap className="h-3 w-3 shrink-0 fill-white text-white" />
                    {locale === "ar"
                      ? `تخفيض ${product.discount}%`
                      : `HOT SALE ${product.discount}% OFF`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hover: Quick Add + sizes */}
          <div className="absolute inset-x-0 bottom-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="px-4 pb-2">
              <button
                onClick={handleAdd}
                className="w-full rounded-full bg-white py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-black shadow-md transition-colors hover:bg-foreground hover:text-background"
              >
                {locale === "ar" ? "إضافة سريعة" : "Quick Add"}
              </button>
            </div>
            {product.sizes.length > 0 && (
              <div className="flex items-center justify-center gap-5 bg-white/85 py-2 text-xs font-medium backdrop-blur">
                {product.sizes.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    onClick={(e) => handleAddSize(e, s)}
                    className="uppercase text-black/70 transition-colors hover:text-black"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-3 px-0.5">
          <h3 className="line-clamp-1 text-[15px] font-medium leading-snug text-foreground transition-colors group-hover:text-foreground/70">
            {name}
          </h3>
          <div className="mt-1.5 flex items-center gap-2">
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
          </div>
          {/* Color dots — hover to preview that color on the image */}
          {product.colors.length > 0 && (
            <div className="mt-2.5 flex items-center gap-1.5">
              {product.colors.slice(0, 4).map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  onMouseEnter={() =>
                    setColorSrc(product.images[i] ?? product.images[0])
                  }
                  onMouseLeave={() => setColorSrc(null)}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="h-4 w-4 rounded-full border border-border ring-foreground ring-offset-1 ring-offset-background transition-shadow hover:ring-2"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                  aria-label={c.name}
                />
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
