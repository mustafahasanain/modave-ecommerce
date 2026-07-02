"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  SlidersHorizontal,
  LayoutGrid,
  List,
  ChevronRight,
  ChevronLeft,
  PackageSearch,
  ShoppingBag,
  Star,
  Heart,
  X,
} from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { type Product } from "@/data/products";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart-store";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_SIZE = 8;
const ALL_CATEGORIES = [
  "Clothing",
  "Accessories",
  "Outerwear",
  "Bottoms",
  "Dresses",
  "Knitwear",
  "Bags",
  "Shoes",
];
const ALL_SIZES = ["S", "M", "L", "XL", "XXL"];
const PRICE_MAX = 300;

type SortKey = "featured" | "priceLow" | "priceHigh" | "newest";

interface FilterState {
  priceRange: [number, number];
  colors: string[];
  sizes: string[];
  categories: string[];
  saleOnly: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  priceRange: [0, PRICE_MAX],
  colors: [],
  sizes: [],
  categories: [],
  saleOnly: false,
};

export default function ShopPage() {
  const { t, locale, dir } = useLanguage();
  const { products, loading } = useProducts();

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>("featured");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Derive unique color swatches from products
  const colorOptions = useMemo(() => {
    const map = new Map<string, { name: string; hex: string }>();
    for (const p of products) {
      for (const c of p.colors) map.set(c.name, c);
    }
    return Array.from(map.values());
  }, [products]);

  const filtered = useMemo(() => {
    const list = products.filter((p) => {
      const price = p.price;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;
      if (filters.saleOnly && !p.discount) return false;
      if (filters.colors.length > 0) {
        const has = p.colors.some((c) => filters.colors.includes(c.name));
        if (!has) return false;
      }
      if (filters.sizes.length > 0) {
        const has = p.sizes.some((s) => filters.sizes.includes(s));
        if (!has) return false;
      }
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(p.category)) return false;
      }
      return true;
    });

    switch (sort) {
      case "priceLow":
        list.sort((a, b) => a.price - b.price);
        break;
      case "priceHigh":
        list.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        list.sort((a, b) => Number(!!b.newArrival) - Number(!!a.newArrival));
        break;
      default:
        list.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    }
    return list;
  }, [filters, sort, products]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const toggleColor = (name: string) => {
    update(
      "colors",
      filters.colors.includes(name)
        ? filters.colors.filter((c) => c !== name)
        : [...filters.colors, name]
    );
  };
  const toggleSize = (s: string) => {
    update(
      "sizes",
      filters.sizes.includes(s) ? filters.sizes.filter((x) => x !== s) : [...filters.sizes, s]
    );
  };
  const toggleCategory = (c: string) => {
    update(
      "categories",
      filters.categories.includes(c)
        ? filters.categories.filter((x) => x !== c)
        : [...filters.categories, c]
    );
  };

  const clearAll = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  // Active filter chips for the chips row above the grid
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; value: string; remove: () => void }[] = [];
    if (filters.saleOnly) {
      chips.push({
        key: "sale",
        label: locale === "ar" ? "تخفيض" : "Sale",
        value: locale === "ar" ? "نعم" : "Yes",
        remove: () => update("saleOnly", false),
      });
    }
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < PRICE_MAX) {
      chips.push({
        key: "price",
        label: locale === "ar" ? "السعر" : "Price",
        value: `$${filters.priceRange[0]}–$${filters.priceRange[1]}`,
        remove: () => update("priceRange", [0, PRICE_MAX]),
      });
    }
    filters.colors.forEach((c) =>
      chips.push({
        key: `color-${c}`,
        label: locale === "ar" ? "اللون" : "Color",
        value: c,
        remove: () => toggleColor(c),
      })
    );
    filters.sizes.forEach((s) =>
      chips.push({
        key: `size-${s}`,
        label: locale === "ar" ? "المقاس" : "Size",
        value: s,
        remove: () => toggleSize(s),
      })
    );
    filters.categories.forEach((c) =>
      chips.push({
        key: `cat-${c}`,
        label: locale === "ar" ? "الفئة" : "Category",
        value: c,
        remove: () => toggleCategory(c),
      })
    );
    return chips;
  }, [filters, locale, update, toggleColor, toggleSize, toggleCategory]);

  // Localized helper
  const localize = (p: Product) =>
    locale === "ar"
      ? { name: p.nameAr, category: p.categoryAr }
      : { name: p.name, category: p.category };

  // ---------- Filter panel (rendered inside the right-side drawer) ----------
  const FilterPanel = (
    <div className="space-y-1">
      {/* Price */}
      <section className="border-b border-border py-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest">
          {t.shop.filterPrice}
        </h3>
        <Slider
          min={0}
          max={PRICE_MAX}
          step={10}
          value={filters.priceRange}
          onValueChange={(v) => update("priceRange", [v[0], v[1]] as [number, number])}
          className="mb-4"
        />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase text-muted-foreground">$</span>
            <Input
              type="number"
              min={0}
              max={PRICE_MAX}
              value={filters.priceRange[0]}
              onChange={(e) =>
                update("priceRange", [
                  Math.min(Number(e.target.value), filters.priceRange[1]),
                  filters.priceRange[1],
                ])
              }
              className="h-8 w-16 text-xs"
            />
          </div>
          <span className="text-muted-foreground">—</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase text-muted-foreground">$</span>
            <Input
              type="number"
              min={0}
              max={PRICE_MAX}
              value={filters.priceRange[1]}
              onChange={(e) =>
                update("priceRange", [
                  filters.priceRange[0],
                  Math.max(Number(e.target.value), filters.priceRange[0]),
                ])
              }
              className="h-8 w-16 text-xs"
            />
          </div>
        </div>

        {/* Price histogram — product distribution across price buckets */}
        <PriceHistogram
          prices={products.map((p) => p.price)}
          range={filters.priceRange}
          max={PRICE_MAX}
        />
      </section>

      {/* Color */}
      <section className="border-b border-border py-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest">
          {t.shop.filterColor}
        </h3>
        <div className="space-y-2.5">
          {colorOptions.map((c) => {
            const checked = filters.colors.includes(c.name);
            return (
              <label
                key={c.name}
                className="flex w-full cursor-pointer items-center gap-3 text-sm transition-colors hover:text-foreground"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleColor(c.name)}
                />
                <span
                  className="h-4 w-4 rounded-full border border-border"
                  style={{ backgroundColor: c.hex }}
                />
                <span className={checked ? "font-medium" : "text-muted-foreground"}>
                  {c.name}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      {/* Size */}
      <section className="border-b border-border py-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest">
          {t.shop.filterSize}
        </h3>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((s) => {
            const active = filters.sizes.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                className={`min-w-10 rounded-md border px-3 py-1.5 text-xs font-medium uppercase transition-colors ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </section>

      {/* Category */}
      <section className="border-b border-border py-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest">
          {t.shop.filterCategory}
        </h3>
        <div className="space-y-2.5">
          {ALL_CATEGORIES.map((c) => {
            const checked = filters.categories.includes(c);
            return (
              <label
                key={c}
                className="flex w-full cursor-pointer items-center gap-3 text-sm transition-colors hover:text-foreground"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleCategory(c)}
                />
                <span className={checked ? "font-medium" : "text-muted-foreground"}>
                  {c}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <div className="pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={clearAll}
          className="w-full rounded-full uppercase tracking-widest"
        >
          {t.shop.clear}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* ===== Page header ===== */}
      <section className="bg-secondary/40">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-10 sm:px-6 lg:py-14">
          <div className="flex-1">
            <nav className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground">
              <Link href="/" className="transition-colors hover:text-foreground">
                {t.common.home}
              </Link>
              <ChevronRight className="h-3 w-3 rtl-flip" />
              <span className="text-foreground">{t.shop.title}</span>
            </nav>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {t.shop.title}
            </h1>
          </div>
          {/* Side image (decorative, hidden on mobile) */}
          <div className="relative hidden h-24 w-24 overflow-hidden rounded-full bg-secondary sm:block lg:h-32 lg:w-32">
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80"
              alt={t.shop.title}
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ===== Full-width toolbar ===== */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          {/* Left: Sort dropdown + sale checkbox (matches original) */}
          <div className="flex items-center gap-4">
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-9 w-44 rounded-full text-xs uppercase tracking-wider sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">{t.shop.sortFeatured}</SelectItem>
                <SelectItem value="priceLow">{t.shop.sortPriceLow}</SelectItem>
                <SelectItem value="priceHigh">{t.shop.sortPriceHigh}</SelectItem>
                <SelectItem value="newest">{t.shop.sortNewest}</SelectItem>
              </SelectContent>
            </Select>

            <Label
              htmlFor="saleOnly"
              className="flex cursor-pointer items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground"
            >
              <Checkbox
                id="saleOnly"
                checked={filters.saleOnly}
                onCheckedChange={(v) => update("saleOnly", v === true)}
              />
              {t.common.saleOnly}
            </Label>
          </div>

          {/* Right: count + view toggle + Filters button (matches original) */}
          <div className="flex items-center gap-3 sm:gap-5">
            <p className="hidden text-xs uppercase tracking-widest text-muted-foreground sm:block">
              {filtered.length} {t.common.productsFound}
            </p>

            <div className="hidden items-center rounded-full border border-border p-0.5 sm:flex">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  view === "grid"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  view === "list"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Filters button (opens right-side drawer) — on the right, matching original */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full">
                  <SlidersHorizontal className="me-2 h-4 w-4" />
                  {t.common.filters}
                </Button>
              </SheetTrigger>
              <SheetContent
                side={dir === "rtl" ? "right" : "left"}
                className="w-[90vw] gap-0 overflow-y-auto p-6 sm:max-w-md"
              >
                <SheetHeader className="px-0">
                  <SheetTitle className="font-display text-2xl">
                    {t.common.filters}
                  </SheetTitle>
                </SheetHeader>
                {FilterPanel}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </section>

      {/* ===== Full-width main content ===== */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        {/* Mobile count */}
        <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground sm:hidden">
          {filtered.length} {t.common.productsFound}
        </p>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                onClick={chip.remove}
                className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-background py-1 ps-3 pe-2 text-xs font-medium transition-colors hover:border-foreground"
              >
                <span className="text-muted-foreground">{chip.label}:</span>
                <span>{chip.value}</span>
                <X className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-foreground" />
              </button>
            ))}
            <button
              onClick={clearAll}
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {t.shop.clear}
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="group relative">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary">
                  <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-secondary via-secondary/80 to-secondary" />
                </div>
                <div className="mt-3 space-y-2 px-0.5">
                  <div className="h-2.5 w-16 animate-pulse rounded bg-secondary" />
                  <div className="h-3.5 w-3/4 animate-pulse rounded bg-secondary" />
                  <div className="h-3 w-20 animate-pulse rounded bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        ) : paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center">
            <PackageSearch className="h-10 w-10 text-muted-foreground" />
            <p className="mt-4 font-display text-2xl">
              {locale === "ar" ? "لا توجد منتجات مطابقة" : "No products match"}
            </p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              {locale === "ar"
                ? "جرّب تعديل عوامل التصفية أو مسح الكل لعرض كل المنتجات."
                : "Try adjusting your filters or clear all to see everything."}
            </p>
            <Button
              variant="outline"
              className="mt-6 rounded-full"
              onClick={clearAll}
            >
              {t.shop.clear}
            </Button>
          </div>
        ) : (
          <div
            className={
              view === "grid"
                ? "grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4"
                : "flex flex-col gap-6"
            }
          >
            {paged.map((p, i) =>
              view === "grid" ? (
                <ProductCard key={p.id} product={p} index={i} />
              ) : (
                <ListRow key={p.id} product={p} index={i} loc={localize(p)} />
              )
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.max(1, p - 1));
                    }}
                    className={
                      safePage === 1
                        ? "pointer-events-none opacity-40"
                        : undefined
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <PaginationItem key={n}>
                    <PaginationLink
                      href="#"
                      isActive={n === safePage}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(n);
                      }}
                    >
                      {n}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.min(totalPages, p + 1));
                    }}
                    className={
                      safePage === totalPages
                        ? "pointer-events-none opacity-40"
                        : undefined
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </section>
    </>
  );
}

// ---------- List view row ----------

function ListRow({
  product,
  index,
  loc,
}: {
  product: Product;
  index: number;
  loc: { name: string; category: string };
}) {
  const { t } = useLanguage();
  const addItem = useCart((s) => s.addItem);
  const toggleWishlist = useCart((s) => s.toggleWishlist);
  const wishlist = useCart((s) => s.wishlist);
  const isWishlisted = wishlist.includes(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.24) }}
    >
      <Link
        href={`/product/${product.id}`}
        className="group flex flex-col gap-4 rounded-xl border border-border p-3 transition-shadow hover:shadow-md sm:flex-row sm:gap-6 sm:p-4"
      >
        <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden rounded-lg bg-secondary sm:aspect-square sm:w-32 md:w-40">
          <Image
            src={product.images[0]}
            alt={loc.name}
            fill
            sizes="(max-width: 640px) 100vw, 160px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {product.discount && (
            <span className="absolute start-2 top-2 rounded-full bg-[var(--sale)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              -{product.discount}%
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            {loc.category}
          </p>
          <h3 className="mt-1 font-display text-lg font-medium leading-snug transition-colors group-hover:text-foreground/80">
            {loc.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs text-muted-foreground">
              {product.rating.toFixed(1)} ({product.reviews} {t.product.reviews})
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleWishlist(product.id);
                  toast.success(
                    isWishlisted ? "Removed from wishlist" : "Added to wishlist"
                  );
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-foreground hover:text-background"
                aria-label="Wishlist"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isWishlisted ? "fill-[var(--sale)] text-[var(--sale)]" : ""
                  }`}
                />
              </button>
              <Button
                size="sm"
                className="rounded-full uppercase tracking-wider"
                onClick={(e) => {
                  e.preventDefault();
                  addItem({
                    id: product.id,
                    name: loc.name,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    image: product.images[0],
                    size: product.sizes[0],
                    color: product.colors[0]?.name,
                  });
                  toast.success(`${loc.name} ${t.common.addToCart.toLowerCase()}`);
                }}
              >
                <ShoppingBag className="me-1.5 h-3.5 w-3.5" />
                {t.common.addToCart}
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function PriceHistogram({
  prices,
  range,
  max,
}: {
  prices: number[];
  range: [number, number];
  max: number;
}) {
  const BUCKETS = 12;
  const bucketSize = max / BUCKETS;
  const buckets = Array.from({ length: BUCKETS }, (_, i) => {
    const lo = i * bucketSize;
    const hi = (i + 1) * bucketSize;
    const count = prices.filter((p) => p >= lo && (i === BUCKETS - 1 ? p <= hi : p < hi)).length;
    return { lo, hi, count };
  });
  const maxCount = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <div className="mt-4">
      <div className="flex h-12 items-end gap-0.5">
        {buckets.map((b, i) => {
          const inRange = b.hi > range[0] && b.lo < range[1];
          const heightPct = (b.count / maxCount) * 100;
          return (
            <div
              key={i}
              className="flex-1 rounded-sm transition-all"
              style={{
                height: `${Math.max(heightPct, b.count > 0 ? 8 : 2)}%`,
                backgroundColor: inRange ? "var(--foreground)" : "var(--border)",
              }}
              title={`$${Math.round(b.lo)}–$${Math.round(b.hi)}: ${b.count} products`}
            />
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-[9px] uppercase tracking-wider text-muted-foreground">
        <span>$0</span>
        <span>${max}</span>
      </div>
    </div>
  );
}
