"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  CornerDownLeft,
  ArrowRight,
  ArrowLeft,
  Home,
  ShoppingBag,
  Layers,
  Heart,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useLanguage } from "@/context/language-provider";
import { useCart } from "@/lib/cart-store";
import { products, collections } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { useUI } from "@/lib/ui-store";

export function SearchCommand() {
  const { t, locale, dir } = useLanguage();
  const router = useRouter();
  const open = useUI((s) => s.searchOpen);
  const setOpen = useUI((s) => s.setSearchOpen);
  const addItem = useCart((s) => s.addItem);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const [query, setQuery] = useState("");

  // Cmd/Ctrl+K to open, Escape handled by CommandDialog
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  // Reset query whenever the dialog opens (clean slate each invocation)
  const handleOpenChange = (next: boolean) => {
    if (next) setQuery("");
    setOpen(next);
  };

  const productResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products
      .filter((p) =>
        (locale === "ar" ? p.nameAr : p.name).toLowerCase().includes(q) ||
        (locale === "ar" ? p.categoryAr : p.category).toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [query, locale]);

  const collectionResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return collections
      .filter((c) => (locale === "ar" ? c.nameAr : c.name).toLowerCase().includes(q))
      .slice(0, 4);
  }, [query, locale]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const handleProductAdd = (id: number) => {
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
    setOpen(false);
    setCartOpen(true);
  };

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      <CommandInput
        placeholder={
          locale === "ar"
            ? "ابحث عن منتجات، مجموعات، أو صفحات..."
            : "Search products, collections, or pages..."
        }
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>
          {locale === "ar" ? "لا توجد نتائج." : "No results found."}
        </CommandEmpty>

        {/* Quick navigation */}
        {!query.trim() && (
          <CommandGroup
            heading={locale === "ar" ? "روابط سريعة" : "Quick navigation"}
          >
            <CommandItem onSelect={() => go("/")} className="gap-3">
              <Home className="h-4 w-4 text-muted-foreground" />
              <span>{t.common.home}</span>
            </CommandItem>
            <CommandItem onSelect={() => go("/shop")} className="gap-3">
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              <span>{t.common.shop}</span>
            </CommandItem>
            <CommandItem onSelect={() => go("/collections")} className="gap-3">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span>{locale === "ar" ? "المجموعات" : "Collections"}</span>
            </CommandItem>
            <CommandItem onSelect={() => go("/wishlist")} className="gap-3">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <span>{t.common.wishlist}</span>
            </CommandItem>
            <CommandItem onSelect={() => go("/cart")} className="gap-3">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <span>{t.common.cart}</span>
            </CommandItem>
          </CommandGroup>
        )}

        {/* Products */}
        {(query.trim() ? productResults : products.filter((p) => p.featured).slice(0, 4)).length > 0 && (
          <CommandGroup heading={locale === "ar" ? "المنتجات" : "Products"}>
            {(query.trim() ? productResults : products.filter((p) => p.featured).slice(0, 4)).map(
              (p) => {
                const name = locale === "ar" ? p.nameAr : p.name;
                const cat = locale === "ar" ? p.categoryAr : p.category;
                return (
                  <CommandItem
                    key={p.id}
                    value={`product-${p.id} ${name} ${cat}`}
                    onSelect={() => go(`/product/${p.id}`)}
                    className="gap-3 py-2"
                  >
                    <div className="relative h-10 w-9 shrink-0 overflow-hidden rounded-md bg-secondary">
                      <Image
                        src={p.images[0]}
                        alt={name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">{name}</span>
                      <span className="text-xs text-muted-foreground">
                        {cat} · {formatPrice(p.price)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductAdd(p.id);
                      }}
                      className="flex h-7 items-center gap-1 rounded-full bg-foreground px-2.5 text-[10px] font-semibold uppercase tracking-wide text-background transition-transform hover:scale-105"
                    >
                      <ShoppingBag className="h-3 w-3" />
                      {t.common.addToCart}
                    </button>
                  </CommandItem>
                );
              }
            )}
          </CommandGroup>
        )}

        {/* Collections */}
        {(query.trim() ? collectionResults : collections.slice(0, 4)).length > 0 && (
          <CommandGroup heading={locale === "ar" ? "المجموعات" : "Collections"}>
            {(query.trim() ? collectionResults : collections.slice(0, 4)).map((c) => (
              <CommandItem
                key={c.name}
                value={`collection-${c.name} ${c.nameAr}`}
                onSelect={() => go("/shop")}
                className="gap-3"
              >
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-secondary">
                  <Image src={c.image} alt={c.name} fill sizes="36px" className="object-cover" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">
                    {locale === "ar" ? c.nameAr : c.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {c.count} {t.collection.items}
                  </span>
                </div>
                <Arrow className="h-3.5 w-3.5 text-muted-foreground rtl-flip" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {query.trim() && productResults.length === 0 && collectionResults.length === 0 && (
          <CommandGroup>
            <CommandItem disabled className="gap-3 opacity-60">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {locale === "ar"
                  ? `جرّب كلمات أخرى للبحث عن "${query}"`
                  : `Try different keywords for "${query}"`}
              </span>
            </CommandItem>
          </CommandGroup>
        )}

        <CommandSeparator />
        {/* Footer hint */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CornerDownLeft className="h-3 w-3" />
            {locale === "ar" ? "للفتح" : "to open"}
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd>
            {locale === "ar" ? "للإغلاق" : "to close"}
          </span>
        </div>
      </CommandList>
    </CommandDialog>
  );
}
