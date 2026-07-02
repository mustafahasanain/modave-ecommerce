"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Trash2, ChevronRight, ArrowRight, ArrowLeft, Sparkles, Share2, Users } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { useCart } from "@/lib/cart-store";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { toast } from "sonner";

export default function WishlistPage() {
  const { t, locale, dir } = useLanguage();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const searchParams = useSearchParams();

  const wishlist = useCart((s) => s.wishlist);
  const toggleWishlist = useCart((s) => s.toggleWishlist);
  const addItem = useCart((s) => s.addItem);

  const items = products.filter((p) => wishlist.includes(p.id));
  const subtotal = items.reduce((sum, p) => sum + p.price, 0);

  // Shared wishlist mode: read ?ids= param for a read-only view
  const sharedIdsParam = searchParams.get("ids");
  const isSharedMode = !!sharedIdsParam;
  const sharedIds = sharedIdsParam
    ? sharedIdsParam.split(",").map(Number).filter((n) => !isNaN(n) && n > 0)
    : [];
  const sharedItems = isSharedMode ? products.filter((p) => sharedIds.includes(p.id)) : [];

  const handleShare = async () => {
    if (items.length === 0) return;
    const ids = items.map((p) => p.id).join(",");
    const url = `${window.location.origin}/wishlist?ids=${ids}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My Modave Wishlist", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(
          locale === "ar"
            ? "تم نسخ رابط المفضلة!"
            : "Wishlist link copied to clipboard!"
        );
      }
    } catch {
      // user cancelled share — no toast
    }
  };

  // Shared wishlist view (read-only)
  if (isSharedMode) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 lg:py-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 border-b border-border pb-8"
        >
          <nav className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">{t.common.home}</Link>
            <ChevronRight className="h-3 w-3 rtl-flip" />
            <span className="text-foreground">{t.wishlist.title}</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {locale === "ar" ? "مفضلة مشتركة" : "Shared Wishlist"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {locale === "ar"
                  ? `${sharedItems.length} عنصر — اختر ما يعجبك وأضفه إلى سلتك`
                  : `${sharedItems.length} items — pick what you love and add to your cart`}
              </p>
            </div>
          </div>
        </motion.div>

        {sharedItems.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/20 px-6 py-20 text-center">
            <Heart className="h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              {locale === "ar"
                ? "لم يتم العثور على منتجات في هذه المفضلة."
                : "No products found in this shared wishlist."}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">
                {locale === "ar" ? "إجمالي القيمة" : "Total value"}:{" "}
                <span className="font-semibold text-foreground">
                  {formatPrice(sharedItems.reduce((s, p) => s + p.price, 0))}
                </span>
              </span>
              <Button
                onClick={() => {
                  sharedItems.forEach((p) =>
                    addItem({
                      id: p.id,
                      name: locale === "ar" ? p.nameAr : p.name,
                      price: p.price,
                      originalPrice: p.originalPrice,
                      image: p.images[0],
                      size: p.sizes[0],
                      color: p.colors[0]?.name,
                    })
                  );
                  toast.success(
                    locale === "ar"
                      ? "تمت إضافة كل العناصر إلى السلة!"
                      : "All items added to cart!"
                  );
                }}
                className="gap-2 rounded-full"
              >
                <ShoppingBag className="h-4 w-4" />
                {locale === "ar" ? "أضف الكل إلى السلة" : "Add all to cart"}
              </Button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sharedItems.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group flex gap-4 rounded-xl border border-border bg-card p-3 transition-shadow hover:shadow-md"
                >
                  <Link
                    href={`/product/${p.id}`}
                    className="relative h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary sm:h-32 sm:w-28"
                  >
                    <Image
                      src={p.images[0]}
                      alt={locale === "ar" ? p.nameAr : p.name}
                      fill
                      sizes="112px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {p.discount && (
                      <span className="absolute start-1.5 top-1.5 rounded-full bg-[var(--sale)] px-1.5 py-0.5 text-[9px] font-bold text-white">
                        -{p.discount}%
                      </span>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                      {locale === "ar" ? p.categoryAr : p.category}
                    </p>
                    <Link
                      href={`/product/${p.id}`}
                      className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug hover:text-foreground/70"
                    >
                      {locale === "ar" ? p.nameAr : p.name}
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-semibold">{formatPrice(p.price)}</span>
                      {p.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(p.originalPrice)}
                        </span>
                      )}
                    </div>
                    <div className="mt-auto flex items-center gap-2 pt-3">
                      <Button
                        size="sm"
                        onClick={() => {
                          addItem({
                            id: p.id,
                            name: locale === "ar" ? p.nameAr : p.name,
                            price: p.price,
                            originalPrice: p.originalPrice,
                            image: p.images[0],
                            size: p.sizes[0],
                            color: p.colors[0]?.name,
                          });
                          toast.success(
                            `${locale === "ar" ? p.nameAr : p.name} ${locale === "ar" ? "أُضيف إلى السلة" : "added to cart"}`
                          );
                        }}
                        className="h-8 rounded-full px-3 text-xs"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        {t.common.addToCart}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  const handleMoveToCart = (id: number) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    addItem({
      id: p.id,
      name: locale === "ar" ? p.nameAr : p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      image: p.images[0],
      size: p.sizes[0],
      color: p.colors[0]?.name,
    });
    toggleWishlist(id);
    toast.success(
      `${locale === "ar" ? p.nameAr : p.name} ${locale === "ar" ? "أُضيف إلى السلة" : "moved to cart"}`
    );
  };

  const handleRemove = (id: number) => {
    toggleWishlist(id);
    toast.success(locale === "ar" ? "تمت الإزالة من المفضلة" : "Removed from wishlist");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:py-14">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <nav className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">{t.common.home}</Link>
            <ChevronRight className="h-3 w-3 rtl-flip" />
            <span className="text-foreground">{t.wishlist.title}</span>
          </nav>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {t.wishlist.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t.wishlist.subtitle}</p>
        </div>
        {items.length > 0 && (
          <div className="flex items-center gap-4 text-sm">
            <span className="rounded-full bg-secondary px-4 py-1.5 font-medium">
              {items.length} {t.wishlist.items}
            </span>
            <span className="hidden text-muted-foreground sm:inline">
              {t.wishlist.subtotal}:{" "}
              <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
            </span>
            <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 rounded-full">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">
                {locale === "ar" ? "مشاركة" : "Share"}
              </span>
            </Button>
          </div>
        )}
      </motion.div>

      {items.length === 0 ? (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="mx-auto flex max-w-md flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/20 px-6 py-20 text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-background shadow-sm">
            <Heart className="h-9 w-9 text-muted-foreground" />
          </div>
          <h2 className="mt-6 font-display text-2xl font-semibold">{t.wishlist.emptyTitle}</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">{t.wishlist.emptyDesc}</p>
          <Button asChild className="mt-6 rounded-full px-7">
            <Link href="/shop">
              <ShoppingBag className="h-4 w-4" />
              {t.common.exploreProducts}
              <Arrow className="h-4 w-4 rtl-flip" />
            </Link>
          </Button>
        </motion.div>
      ) : (
        <>
          {/* Wishlist grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {items.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  className="group relative flex gap-4 rounded-xl border border-border bg-card p-3 transition-shadow hover:shadow-md"
                >
                  <Link
                    href={`/product/${p.id}`}
                    className="relative h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary sm:h-32 sm:w-28"
                  >
                    <Image
                      src={p.images[0]}
                      alt={locale === "ar" ? p.nameAr : p.name}
                      fill
                      sizes="112px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {p.discount && (
                      <span className="absolute start-1.5 top-1.5 rounded-full bg-[var(--sale)] px-1.5 py-0.5 text-[9px] font-bold text-white">
                        -{p.discount}%
                      </span>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                      {locale === "ar" ? p.categoryAr : p.category}
                    </p>
                    <Link
                      href={`/product/${p.id}`}
                      className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug hover:text-foreground/70"
                    >
                      {locale === "ar" ? p.nameAr : p.name}
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-semibold">{formatPrice(p.price)}</span>
                      {p.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(p.originalPrice)}
                        </span>
                      )}
                    </div>
                    {p.colors.length > 0 && (
                      <div className="mt-1.5 flex items-center gap-1">
                        {p.colors.slice(0, 4).map((c) => (
                          <span
                            key={c.name}
                            className="h-2.5 w-2.5 rounded-full border border-border"
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>
                    )}
                    <div className="mt-auto flex items-center gap-2 pt-3">
                      <Button
                        size="sm"
                        onClick={() => handleMoveToCart(p.id)}
                        className="h-8 rounded-full px-3 text-xs"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        {t.wishlist.moveToCart}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-[var(--sale)]"
                        onClick={() => handleRemove(p.id)}
                        aria-label={t.wishlist.remove}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Footer actions */}
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/shop">
                <Arrow className="h-4 w-4 rotate-180 rtl-flip" />
                {t.wishlist.continueShopping}
              </Link>
            </Button>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              {locale === "ar"
                ? "احفظ مفضلاتك وعد إليها في أي وقت"
                : "Save your favourites and revisit them anytime"}
            </p>
          </div>
        </>
      )}

      {/* Recommended */}
      <div className="mt-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {locale === "ar" ? "اختارات لك" : "Handpicked for you"}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
              {locale === "ar" ? "قد يعجبك أيضاً" : "You May Also Love"}
            </h2>
          </div>
          <Link
            href="/shop"
            className="group hidden items-center gap-2 text-sm font-medium hover:text-foreground/70 sm:inline-flex"
          >
            {t.common.viewAll}
            <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl-flip" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products
            .filter((p) => !wishlist.includes(p.id))
            .slice(0, 4)
            .map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
        </div>
      </div>
    </div>
  );
}
