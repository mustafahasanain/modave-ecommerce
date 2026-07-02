"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Clock, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useLanguage } from "@/context/language-provider";
import { blogPosts } from "@/data/blog";
import { Button } from "@/components/ui/button";

export default function BlogPage() {
  const { t, locale, dir } = useLanguage();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const [activeCat, setActiveCat] = useState<string>("all");

  const categories = useMemo(() => {
    const set = new Set<string>();
    blogPosts.forEach((p) => set.add(locale === "ar" ? p.categoryAr : p.category));
    return ["all", ...Array.from(set)];
  }, [locale]);

  const featured = blogPosts.filter((p) => p.featured);
  const filtered =
    activeCat === "all"
      ? blogPosts
      : blogPosts.filter((p) => (locale === "ar" ? p.categoryAr : p.category) === activeCat);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:py-14">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 max-w-2xl"
      >
        <nav className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">{t.common.home}</Link>
          <ChevronRight className="h-3 w-3 rtl-flip" />
          <span className="text-foreground">{t.blog.title}</span>
        </nav>
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          {t.blog.title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">{t.blog.subtitle}</p>
      </motion.div>

      {/* Featured posts */}
      <div className="mb-14 grid gap-6 lg:grid-cols-2">
        {featured.map((post, i) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Link href={`/blog/${post.id}`} className="group block overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg">
              <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                <Image
                  src={post.image}
                  alt={locale === "ar" ? post.titleAr : post.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute start-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
                  {t.blog.featured}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-semibold uppercase tracking-wider text-foreground">
                    {locale === "ar" ? post.categoryAr : post.category}
                  </span>
                  <span>·</span>
                  <span>{formatDate(post.date)}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime} {t.blog.minRead}
                  </span>
                </div>
                <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight transition-colors group-hover:text-foreground/70">
                  {locale === "ar" ? post.titleAr : post.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {locale === "ar" ? post.excerptAr : post.excerpt}
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
                  {t.blog.readMore}
                  <Arrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl-flip" />
                </div>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>

      {/* Category filter */}
      <div className="mb-8 flex flex-wrap items-center gap-2 border-y border-border py-4">
        {categories.map((cat) => {
          const isActive = activeCat === cat;
          const label = cat === "all" ? t.blog.allCategories : cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Latest posts grid */}
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          {t.blog.latestPosts}
        </h2>
        <span className="text-xs text-muted-foreground">
          {filtered.length} {locale === "ar" ? "مقال" : "articles"}
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((post, i) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.3) }}
          >
            <Link href={`/blog/${post.id}`} className="group block overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
              <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                <Image
                  src={post.image}
                  alt={locale === "ar" ? post.titleAr : post.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="font-semibold uppercase tracking-wider text-foreground">
                    {locale === "ar" ? post.categoryAr : post.category}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime} {t.blog.minRead}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold leading-tight transition-colors group-hover:text-foreground/70">
                  {locale === "ar" ? post.titleAr : post.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                  {locale === "ar" ? post.excerptAr : post.excerpt}
                </p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{t.blog.by}</span>
                  <span className="font-medium text-foreground">
                    {locale === "ar" ? post.authorAr : post.author}
                  </span>
                </div>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>

      {/* Newsletter CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-16 rounded-2xl bg-foreground p-8 text-center text-background sm:p-12"
      >
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">
          {locale === "ar" ? "ابقَ على اطلاع" : "Stay in the loop"}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm opacity-80">
          {locale === "ar"
            ? "اشترك في نشرتنا للحصول على أحدث القصص وخصم 10% على أول طلب."
            : "Subscribe to our newsletter for the latest stories and 10% off your first order."}
        </p>
        <Button asChild variant="secondary" className="mt-5 rounded-full bg-background text-foreground hover:bg-background/90">
          <Link href="/shop">
            {t.common.subscribe}
            <Arrow className="h-4 w-4 rtl-flip" />
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
