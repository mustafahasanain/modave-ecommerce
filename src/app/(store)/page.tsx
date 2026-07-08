"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Star, Quote, Zap } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { ProductCard } from "@/components/product/product-card";
import { InstagramFeed } from "@/components/home/instagram-feed";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { products as staticProducts, collections } from "@/data/products";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function HomePage() {
  const { t, locale, dir } = useLanguage();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const { products } = useProducts();

  const newArrivals = products.filter((p) => p.newArrival).slice(0, 8);
  const bestSellers = products.filter((p) => p.bestSeller).slice(0, 8);

  return (
    <>
      {/* HERO — full-bleed carousel matching original template */}
      <HeroCarousel />

      {/* Marquee announcement */}
      <section className="mb-6 overflow-hidden border-y border-[#e6e6e6] bg-white text-[#181818]">
        <div className="marquee-pause flex h-[55px] w-max animate-marquee items-center whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <span
              key={i}
              className="inline-flex h-full items-center gap-8 px-8 text-[13px] font-medium uppercase tracking-[0.12em] [&>span]:hidden"
            >
              {i % 2 === 0 ? t.announcement.msg1 : t.announcement.msg2}
              <Zap className="h-4 w-4 shrink-0 stroke-[1.8]" />
              <span className="opacity-40">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* EXPLORE COLLECTIONS */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Curated edits
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.home.exploreTitle}
            </h2>
          </motion.div>
          <Link
            href="/collections"
            className="group inline-flex items-center gap-2 text-sm font-medium hover:text-foreground/70"
          >
            {t.common.viewAllCollection}
            <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl-flip" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {collections.slice(0, 6).map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Link href="/shop" className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-secondary">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 16vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
                  />
                  {/* gradient overlay for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-1 p-4 text-white">
                    <p className="font-display text-lg font-semibold leading-tight drop-shadow-sm">
                      {locale === "ar" ? c.nameAr : c.name}
                    </p>
                    <p className="text-[11px] uppercase tracking-wider opacity-90">
                      {c.count} {t.collection.items}
                    </p>
                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium opacity-0 transition-all duration-300 group-hover:opacity-100">
                      {t.common.shop}
                      <Arrow className="h-3 w-3 rtl-flip" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-y border-border bg-secondary/30">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-12 lg:grid-cols-4">
          {[
            {
              icon: "↩️",
              title: t.home.feature1Title,
              desc: t.home.feature1Desc,
            },
            {
              icon: "🚚",
              title: t.home.feature2Title,
              desc: t.home.feature2Desc,
            },
            {
              icon: "💬",
              title: t.home.feature3Title,
              desc: t.home.feature3Desc,
            },
            {
              icon: "🎁",
              title: t.home.feature4Title,
              desc: t.home.feature4Desc,
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-start gap-3"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background text-2xl">
                {f.icon}
              </span>
              <div>
                <h6 className="text-sm font-semibold">{f.title}</h6>
                <p className="mt-0.5 text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t.home.newArrivalsDesc}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.home.newArrivals}
            </h2>
          </motion.div>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 text-sm font-medium hover:text-foreground/70"
          >
            {t.common.viewAll}
            <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl-flip" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {newArrivals.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="mx-auto max-w-7xl px-4 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl bg-foreground text-background"
        >
          <div className="grid items-center gap-6 p-8 sm:p-12 lg:grid-cols-2 lg:p-16">
            <div>
              <span className="text-xs font-medium uppercase tracking-widest opacity-70">
                Limited time
              </span>
              <h3 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                {t.home.bannerTitle}
              </h3>
              <p className="mt-3 max-w-md text-sm opacity-80">
                {t.home.bannerSubtitle}
              </p>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="mt-6 rounded-full bg-background text-foreground hover:bg-background/90"
              >
                <Link href="/shop">
                  {t.home.bannerCta}
                  <Arrow className="h-4 w-4 rtl-flip" />
                </Link>
              </Button>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80"
                alt="Promo"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="pointer-events-none absolute -end-20 -top-20 h-64 w-64 rounded-full bg-background/10 blur-3xl" />
        </motion.div>
      </section>

      {/* EDITORIAL / BRAND STORY */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: dir === "rtl" ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary">
              <Image
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80"
                alt="The Modave atelier"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            {/* floating stat */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute -bottom-6 end-6 rounded-2xl border border-border bg-background p-5 shadow-lg sm:end-10"
            >
              <p className="font-display text-3xl font-semibold">12+</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {locale === "ar" ? "سنوات من الحرفية" : "Years of craft"}
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {locale === "ar" ? "فلسفتنا" : "Our Philosophy"}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {locale === "ar"
                ? "أناقة مدروسة، مصنوعة لتدوم"
                : "Considered design, made to last"}
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              {locale === "ar"
                ? "في موديف، نؤمن بأن الأناقة الحقيقية تكمن في التفاصيل. كل قطعة مصممة بعناية من أجود الخامات، لتمنحك إطلالة خالدة تتجاوز الموسم."
                : "At Modave, we believe true elegance lives in the details. Every piece is thoughtfully crafted from responsibly sourced materials, designed to transcend seasons and become a wardrobe favourite."}
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  t: locale === "ar" ? "خامات فاخرة" : "Premium fabrics",
                  d: locale === "ar" ? "مختارة بعناية" : "Hand-selected",
                },
                {
                  n: "02",
                  t: locale === "ar" ? "تصميم خالد" : "Timeless design",
                  d: locale === "ar" ? "يتجاوز الموضة" : "Beyond trends",
                },
                {
                  n: "03",
                  t: locale === "ar" ? "إنتاج مسؤول" : "Responsible making",
                  d: locale === "ar" ? "بأثر أقل" : "Lower impact",
                },
              ].map((f) => (
                <div key={f.n} className="border-t border-border pt-3">
                  <p className="font-display text-sm font-semibold text-muted-foreground">
                    {f.n}
                  </p>
                  <p className="mt-1 text-sm font-medium">{f.t}</p>
                  <p className="text-xs text-muted-foreground">{f.d}</p>
                </div>
              ))}
            </div>

            <Button
              asChild
              variant="outline"
              className="mt-8 rounded-full px-7"
            >
              <Link href="/shop">
                {locale === "ar" ? "اكتشف المجموعة" : "Discover the edit"}
                <Arrow className="h-4 w-4 rtl-flip" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t.home.bestSellersDesc}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.home.bestSellers}
            </h2>
          </motion.div>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 text-sm font-medium hover:text-foreground/70"
          >
            {t.common.viewAll}
            <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl-flip" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {bestSellers.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <Testimonials />

      {/* INSTAGRAM FEED */}
      <InstagramFeed />
    </>
  );
}

function Testimonials() {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);

  const testimonials = [
    {
      text: "Fantastic shop! Great selection, fair prices, and friendly staff. Highly recommended. The quality of the products is exceptional, and the prices are very reasonable!",
      name: "Sybil Sharp",
      role: "Verified Buyer",
      product: "Contrasting sheepskin sweatshirt",
      price: "$60.00",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
    },
    {
      text: "I absolutely love this shop! The products are high-quality and the customer service is excellent. I always leave with exactly what I need and a smile on my face.",
      name: "Mark G.",
      role: "Verified Buyer",
      product: "Contrasting sheepskin sweatshirt",
      price: "$60.00",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80",
    },
    {
      text: "Beautiful packaging, fast delivery, and the fabric quality exceeded my expectations. Modave has become my go-to for elegant everyday pieces.",
      name: "Elena R.",
      role: "Verified Buyer",
      product: "Belted Manteco coat",
      price: "$219.99",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80",
    },
  ];

  useEffect(() => {
    const id = setInterval(
      () => setActive((p) => (p + 1) % testimonials.length),
      5000,
    );
    return () => clearInterval(id);
  }, [testimonials.length]);

  return (
    <section className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:py-20">
        <div className="mb-10 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Testimonials
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {t.home.testimonialsTitle}
          </h2>
        </div>

        <div className="relative mx-auto max-w-3xl">
          <Quote className="mx-auto h-10 w-10 text-foreground/15" />
          <div className="mt-4 overflow-hidden">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="mb-4 flex items-center justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="mx-auto max-w-2xl text-base text-foreground/80 sm:text-lg">
                “{testimonials[active].text}”
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <img
                  src={testimonials[active].avatar}
                  alt={testimonials[active].name}
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div className="text-start">
                  <p className="text-sm font-semibold">
                    {testimonials[active].name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonials[active].role}
                  </p>
                </div>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs">
                <span className="text-muted-foreground">
                  {testimonials[active].product}
                </span>
                <span className="font-semibold">
                  {testimonials[active].price}
                </span>
              </div>
            </motion.div>
          </div>

          {/* dots */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-2 rounded-full transition-all ${
                  active === i ? "w-8 bg-foreground" : "w-2 bg-foreground/25"
                }`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
