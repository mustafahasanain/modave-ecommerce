"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Eye,
  Heart,
  Share2,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  Ruler,
} from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { useCart } from "@/lib/cart-store";
import { useUI } from "@/lib/ui-store";
import { getProduct, getRelated, products, type Product } from "@/data/products";
import { useProducts } from "@/hooks/use-products";
import { formatPrice } from "@/lib/format";
import { ProductCard } from "@/components/product/product-card";
import { ImageZoom } from "@/components/product/image-zoom";
import { SizeGuideDialog } from "@/components/product/size-guide-dialog";
import { ReviewsSection } from "@/components/product/reviews-section";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const { t, locale, dir } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  // Read from DB via API (with static fallback); useProducts returns static data immediately
  const { products: dbProducts } = useProducts();
  const product = dbProducts.find((p) => p.id === id) ?? getProduct(id);

  const [activeImg, setActiveImg] = useState(0);
  const [color, setColor] = useState(product?.colors[0]?.name ?? "");
  const [size, setSize] = useState(product?.sizes?.includes("M") ? "M" : product?.sizes?.[0] ?? "");
  const [qty, setQty] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const addItem = useCart((s) => s.addItem);
  const toggleWishlist = useCart((s) => s.toggleWishlist);
  const wishlist = useCart((s) => s.wishlist);
  const isWishlisted = product ? wishlist.includes(product.id) : false;
  const addRecentlyViewed = useUI((s) => s.addRecentlyViewed);
  const recentlyViewedIds = useUI((s) => s.recentlyViewed);

  // Track recently viewed (skip on first render of unknown product)
  useEffect(() => {
    if (product) addRecentlyViewed(product.id);
  }, [product?.id, addRecentlyViewed]);

  if (!product) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 px-4 py-32 text-center">
        <h1 className="font-display text-3xl font-semibold">Product not found</h1>
        <p className="text-muted-foreground">The product you are looking for does not exist.</p>
        <Button asChild>
          <a href="/shop">Back to Shop</a>
        </Button>
      </div>
    );
  }

  const name = locale === "ar" ? product.nameAr : product.name;
  const category = locale === "ar" ? product.categoryAr : product.category;
  const description = locale === "ar" ? product.descriptionAr : product.description;
  const lineTotal = product.price * qty;
  const related = getRelated(product.id, 4);
  const Arrow = ChevronRight;

  const handleAdd = () => {
    addItem({
      id: product.id,
      name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images[0],
      size: size || undefined,
      color: color || undefined,
    }, qty);
    toast.success(`${name} ${t.common.addToCart.toLowerCase()}`);
  };

  const handleBuyNow = () => {
    handleAdd();
    router.push("/cart");
  };

  const handleWishlist = () => {
    toggleWishlist(product.id);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <a href="/" className="hover:text-foreground transition-colors">{t.common.home}</a>
        <ChevronRight className="h-3 w-3 rtl-flip" />
        <a href="/shop" className="hover:text-foreground transition-colors">{t.common.shop}</a>
        <ChevronRight className="h-3 w-3 rtl-flip" />
        <span className="text-foreground">{name}</span>
      </nav>

      {/* Main product section */}
      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="order-1 flex flex-col-reverse gap-4 sm:flex-row lg:order-1"
        >
          {/* Thumbnails */}
          <div className="flex shrink-0 gap-3 overflow-x-auto sm:flex-col sm:overflow-visible">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                  activeImg === i ? "border-foreground" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={img} alt={`${name} ${i + 1}`} fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
          {/* Main image */}
          <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-xl bg-secondary">
            <motion.div key={activeImg} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="h-full w-full">
              <ImageZoom
                src={product.images[activeImg]}
                alt={name}
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </motion.div>
            {product.discount && (
              <span className="absolute start-4 top-4 z-10 rounded-full bg-[var(--sale)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                -{product.discount}%
              </span>
            )}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="order-2 lg:order-2"
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {category}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {name}
          </h1>

          {/* Rating row */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-border"
                  }`}
                />
              ))}
              <span className="ms-1 text-muted-foreground">({product.reviews} {t.product.reviews})</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-muted-foreground">
              {product.sold} {t.product.sold} 32 {t.product.hours}
            </span>
          </div>

          {/* Price */}
          <div className="mt-5 flex items-center gap-3">
            <span className="text-3xl font-semibold">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {product.discount && (
              <span className="rounded-full bg-[var(--sale)]/10 px-2.5 py-1 text-xs font-bold text-[var(--sale)]">
                Save {product.discount}%
              </span>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{description}</p>

          {/* Viewing + Low-stock urgency */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />
              28 {t.product.viewing}
            </div>
            {product.stock > 0 && product.stock <= 12 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--sale)]/10 px-3 py-1.5 text-xs font-medium text-[var(--sale)]"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--sale)] opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--sale)]" />
                </span>
                {t.product.lowStock.replace("{n}", String(product.stock))}
              </motion.div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Colors */}
          {product.colors.length > 0 && (
            <div className="mb-5">
              <div className="mb-2 flex items-center gap-2 text-sm">
                <span className="font-medium">{t.product.colors}:</span>
                <span className="text-muted-foreground">{color}</span>
              </div>
              <div className="flex items-center gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.name)}
                    title={c.name}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                      color === c.name ? "border-foreground" : "border-border"
                    }`}
                  >
                    <span className="h-5 w-5 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">
                  {t.product.selectedSize}: <span className="text-muted-foreground">{size}</span>
                </span>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Ruler className="h-3.5 w-3.5" />
                  {t.product.sizeGuide}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-12 rounded-md border px-4 py-2.5 text-sm font-medium transition-all ${
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

          {/* Quantity + actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-border">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Decrease"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Increase"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className="text-xs text-muted-foreground">{t.product.quantity}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={handleAdd} size="lg" className="group flex-1 rounded-full">
              <ShoppingBag className="h-4 w-4" />
              {t.product.addToCart} — {formatPrice(lineTotal)}
            </Button>
            <Button
              onClick={handleBuyNow}
              size="lg"
              variant="outline"
              className="rounded-full border-foreground px-7 hover:bg-foreground hover:text-background"
            >
              {t.product.buyNow}
            </Button>
            <Button onClick={handleWishlist} variant="outline" size="icon" className="h-12 w-12 rounded-full">
              <Heart className={`h-5 w-5 ${isWishlisted ? "fill-[var(--sale)] text-[var(--sale)]" : ""}`} />
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={() => toast.success("Link copied!")}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Delivery & meta */}
          <div className="mt-6 grid gap-3 rounded-xl border border-border bg-secondary/30 p-5 text-sm">
            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium">{t.product.estimatedDelivery}</p>
                <p className="text-muted-foreground">{t.product.deliveryDesc}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-muted-foreground">{t.product.returnDesc}</p>
            </div>
            <button className="inline-flex w-fit items-center gap-1 text-xs font-semibold uppercase tracking-wider underline-offset-4 hover:underline">
              {t.product.viewStore}
            </button>
          </div>

          {/* Meta grid */}
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="text-muted-foreground">{t.product.sku}:</span>
              <span className="font-medium">{product.sku}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="text-muted-foreground">{t.product.vendor}:</span>
              <span className="font-medium">{product.vendor}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="text-muted-foreground">{t.product.available}:</span>
              <span className="font-medium text-emerald-600">{t.product.instock}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="text-muted-foreground">{t.product.categories}:</span>
              <span className="font-medium">{product.category}, {locale === "ar" ? "نساء" : "women"}</span>
            </div>
          </div>

          {/* Safe checkout */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{t.product.safeCheckout}</span>
            <div className="flex items-center gap-1.5">
              {["VISA", "MC", "AMEX", "PAY", "PP"].map((p) => (
                <span key={p} className="flex h-6 min-w-9 items-center justify-center rounded border border-border bg-background px-1.5 text-[9px] font-bold tracking-wide text-muted-foreground">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="mt-14">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-none border-b border-border bg-transparent p-0">
            {[
              { v: "description", l: t.product.tabDescription },
              { v: "reviews", l: t.product.tabReviews },
              { v: "shipping", l: t.product.tabShipping },
              { v: "return", l: t.product.tabReturn },
            ].map((tab) => (
              <TabsTrigger
                key={tab.v}
                value={tab.v}
                className="rounded-none border-b-2 border-transparent bg-transparent px-5 py-3 text-sm font-medium uppercase tracking-wide text-muted-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                {tab.l}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="description" className="mt-6 max-w-3xl">
            <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-start">
              <div className="text-sm leading-relaxed text-muted-foreground">
                <h3 className="font-display text-2xl font-semibold text-foreground">{name}</h3>
                <p className="mt-3">{description}</p>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:min-w-[220px]">
                {[
                  { k: locale === "ar" ? "المواد" : "Material", v: locale === "ar" ? "قطيسة ناعمة" : "Soft cotton blend" },
                  { k: locale === "ar" ? "القصّة" : "Fit", v: locale === "ar" ? "مريحة" : "Regular fit" },
                  { k: locale === "ar" ? "الطول" : "Length", v: locale === "ar" ? "قياسي" : "Standard" },
                  { k: locale === "ar" ? "العناية" : "Care", v: locale === "ar" ? "غسيل 30°" : "Machine 30°C" },
                ].map((row) => (
                  <div key={row.k} className="flex flex-col border-b border-border py-1.5">
                    <span className="uppercase tracking-wider text-muted-foreground">{row.k}</span>
                    <span className="font-medium text-foreground">{row.v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {[
                { icon: "🌿", title: locale === "ar" ? "خامات مستدامة" : "Sustainable Fibres", desc: locale === "ar" ? "مصنوع من ألياف صديقة للبيئة." : "Crafted with responsibly sourced fibres." },
                { icon: "✂️", title: locale === "ar" ? "حرفية دقيقة" : "Tailored Craft", desc: locale === "ar" ? "تفصيل أنيق ودقيق." : "Refined finishing and considered cuts." },
                { icon: "🧼", title: locale === "ar" ? "عناية سهلة" : "Easy Care", desc: locale === "ar" ? "غسيل 30° وتجفيف قصير." : "Machine wash 30°C, short spin dry." },
              ].map((f) => (
                <div key={f.title} className="rounded-xl border border-border bg-secondary/30 p-5">
                  <span className="text-2xl">{f.icon}</span>
                  <h4 className="mt-2 text-sm font-semibold text-foreground">{f.title}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>

            <h4 className="mt-8 font-semibold uppercase tracking-wide text-foreground">
              {locale === "ar" ? "التركيب والمصدر وإرشادات العناية" : "Composition, Origin & Care Guidelines"}
            </h4>
            <ul className="mt-3 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
              <li>• {locale === "ar" ? "التركيب: 55% بوليستر، 30% أكريليك، 13% بولي أميد، 2% إيلاستان" : "Composition: 55% polyester, 30% acrylic, 13% polyamide, 2% elastane"}</li>
              <li>• {locale === "ar" ? "مصمم في برشلونة" : "Designed in Barcelona"}</li>
              <li>• {locale === "ar" ? "بلد الصنع: الولايات المتحدة" : "Manufacture: USA"}</li>
              <li>• {locale === "ar" ? "غسيل آلي 30°/85 فهرنهايت مع عصر قصير" : "Machine washing max 30°C / 85ºF short spin dry"}</li>
            </ul>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <ReviewsSection
              productId={product.id}
              productRating={product.rating}
              productReviewsCount={product.reviews}
            />
          </TabsContent>

          <TabsContent value="shipping" className="mt-6 max-w-3xl space-y-3 text-sm text-muted-foreground">
            <p>Estimated Delivery: 12-26 days (International), 3-6 days (United States).</p>
            <p>Orders are processed within 1-2 business days. You will receive a tracking number once your order ships.</p>
            <p>Free shipping on all orders over $20.00. Returns are free within 14 days of delivery.</p>
          </TabsContent>

          <TabsContent value="return" className="mt-6 max-w-3xl space-y-3 text-sm text-muted-foreground">
            <p>Return within 45 days of purchase. Duties & taxes are non-refundable.</p>
            <p>Items must be unworn, unwashed, and with original tags. Initiate a return from your account dashboard.</p>
            <p>Refunds are processed to the original payment method within 5-7 business days of receiving the return.</p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related products */}
      <div className="mt-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {locale === "ar" ? "قد يعجبك أيضاً" : "You may also like"}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
              {t.product.relatedProducts}
            </h2>
          </div>
          <a href="/shop" className="group inline-flex items-center gap-2 text-sm font-medium hover:text-foreground/70">
            {t.common.viewAll}
            <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl-flip" />
          </a>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {related.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>

      {/* Recently viewed */}
      {recentlyViewedIds.length > 1 && (
        <div className="mt-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {locale === "ar" ? "استكشف مرة أخرى" : "Pick up where you left off"}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
                {locale === "ar" ? "شوهد مؤخراً" : "Recently Viewed"}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            {recentlyViewedIds
              .filter((rid) => rid !== product.id)
              .map((rid, i) => {
                const p = products.find((x) => x.id === rid);
                return p ? <ProductCard key={rid} product={p} index={i} /> : null;
              })}
          </div>
        </div>
      )}

      {/* Size guide dialog */}
      <SizeGuideDialog open={sizeGuideOpen} onOpenChange={setSizeGuideOpen} />
    </div>
  );
}
