"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Star,
  Eye,
  Quote,
  Zap,
  Undo2,
  Truck,
  Headphones,
  BadgeCheck,
} from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { ProductCard } from "@/components/product/product-card";
import { InstagramFeed } from "@/components/home/instagram-feed";
import { CollectionBanner } from "@/components/home/collection-banner";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { products as staticProducts, collections } from "@/data/products";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function HomePage() {
  const { t, locale, dir } = useLanguage();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const { products } = useProducts();

  const newArrivals = products.filter((p) => p.newArrival).slice(0, 4);
  const bestSellers = products.filter((p) => p.bestSeller).slice(0, 4);

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
        <div className="mb-8 flex items-center justify-between gap-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
          >
            {t.home.exploreTitle}
          </motion.h2>
          <Link
            href="/collections"
            className="shrink-0 text-sm font-medium underline underline-offset-4 hover:text-foreground/70"
          >
            {t.common.viewAllCollection}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
          {collections.slice(0, 5).map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Link href="/shop" className="group block">
                <div className="relative aspect-[7/10] overflow-hidden rounded-lg bg-secondary">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 19vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 lg:p-5">
                    <span className="block w-full rounded-full bg-white px-4 py-3.5 text-center text-sm font-medium text-black shadow-sm transition-colors group-hover:bg-white/90">
                      {locale === "ar" ? c.nameAr : c.name}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:py-20">
        <div className="mb-8 flex items-end justify-center gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.home.newArrivals}
            </h2>
            <p className="text-xs mt-4 font-medium uppercase tracking-widest text-muted-foreground">
              {t.home.newArrivalsDesc}
            </p>
          </motion.div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {newArrivals.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* COLLECTION BANNER — dual promo + hotspot */}
      <CollectionBanner />

      {/* BEST SELLERS */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:py-20">
        <div className="mb-8 flex items-center justify-center gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.home.bestSellers}
            </h2>
            <p className="text-xs mt-4 font-medium uppercase tracking-widest text-muted-foreground">
              {t.home.bestSellersDesc}
            </p>
          </motion.div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {bestSellers.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Staggered image pair — left square (higher), right wide (lower) */}
          <div className="grid grid-cols-12 items-start gap-4 lg:gap-6">
            <div className="relative col-span-5 aspect-square overflow-hidden rounded-sm bg-secondary">
              <Image
                src="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=900&q=80"
                alt="Promo"
                fill
                sizes="(max-width: 1024px) 42vw, 40vw"
                className="object-cover"
              />
            </div>
            <div className="relative col-span-7 col-start-6 aspect-[4/3] overflow-hidden rounded-sm bg-secondary translate-y-8 lg:col-span-6 lg:col-start-7 lg:translate-y-20">
              <Image
                src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&q=80"
                alt="Promo"
                fill
                sizes="(max-width: 1024px) 58vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Floating card */}
          <div className="absolute start-1/2 top-1/2 w-[88%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-sm bg-background p-8 text-center shadow-2xl rtl:translate-x-1/2 sm:p-12">
            <h3 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {t.home.bannerTitle}
              <br />
              {t.home.bannerTitle2}
            </h3>
            <p className="mt-4 text-sm text-muted-foreground">
              {t.home.bannerSubtitle}
            </p>
            <Button
              asChild
              size="lg"
              className="mt-7 rounded-full px-7 text-xs font-semibold uppercase tracking-[0.12em]"
            >
              <Link href="/shop">
                {t.home.bannerCta}
                <ArrowUpRight className="h-4 w-4 rtl-flip" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section>
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-14 lg:grid-cols-4 lg:py-16">
          {[
            {
              Icon: Undo2,
              title: t.home.feature1Title,
              desc: t.home.feature1Desc,
            },
            {
              Icon: Truck,
              title: t.home.feature2Title,
              desc: t.home.feature2Desc,
            },
            {
              Icon: Headphones,
              title: t.home.feature3Title,
              desc: t.home.feature3Desc,
            },
            {
              Icon: BadgeCheck,
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
              className="flex flex-col items-center px-2 text-center"
            >
              <f.Icon className="h-12 w-12 stroke-[1.4] text-foreground" />
              <h6 className="mt-5 text-xl font-semibold text-foreground">
                {f.title}
              </h6>
              <p className="mt-2.5 text-base text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
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
      {/* <section className="mx-auto max-w-7xl px-4 py-16 lg:py-20">
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
      </section> */}

      {/* TESTIMONIALS */}
      <TestimonialsRedesign />

      {/* INSTAGRAM FEED */}
      <InstagramFeed />
    </>
  );
}

function TestimonialsRedesign() {
  const { locale } = useLanguage();
  const ar = locale === "ar";
  const [active, setActive] = useState(0);
  const testimonials = [
    {
      text: ar
        ? "متجر رائع! تشكيلة ممتازة وأسعار عادلة وطاقم ودود. أنصح به بشدة. جودة المنتجات استثنائية والأسعار معقولة جداً!"
        : "Fantastic shop! Great selection, fair prices, and friendly staff. Highly recommended. The quality of the products is exceptional, and the prices are very reasonable!",
      name: ar ? "سارة الحمد" : "Sybil Sharp",
      product: ar ? "سترة جلد الغنم المتباينة" : "Contrasting sheepskin sweatshirt",
      price: "$60.00",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=85",
      productImage: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=120&q=85",
    },
    {
      text: ar
        ? "أحب هذا المتجر كثيراً! المنتجات عالية الجودة وخدمة العملاء ممتازة. أخرج دائماً بما أحتاجه بالضبط وابتسامة على وجهي."
        : "I absolutely love this shop! The products are high-quality and the customer service is excellent. I always leave with exactly what I need and a smile on my face.",
      name: ar ? "محمد العتيبي" : "Mark G.",
      product: ar ? "سترة جلد الغنم المتباينة" : "Contrasting sheepskin sweatshirt",
      price: "$60.00",
      image: "https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=800&q=85",
      productImage: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=120&q=85",
    },
    {
      text: ar
        ? "تغليف جميل وتوصيل سريع، وجودة القماش فاقت توقعاتي. أصبح موديف وجهتي المفضلة للقطع الأنيقة اليومية."
        : "Beautiful packaging, fast delivery, and the fabric quality exceeded my expectations. Modave has become my go-to for elegant everyday pieces.",
      name: ar ? "نور الزهراني" : "Elena R.",
      product: ar ? "معطف مانتيكو بحزام" : "Belted Manteco coat",
      price: "$219.99",
      image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=85",
      productImage: "https://images.unsplash.com/photo-1548624149-fb5aefb2f732?auto=format&fit=crop&w=120&q=85",
    },
  ];

  const visible = [testimonials[active], testimonials[(active + 1) % testimonials.length]];

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20 lg:py-24">
        <div className="mb-10 text-center sm:mb-11">
          <h2 className="font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            {ar ? "!آراء عملائنا" : "Customer Say!"}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            {ar
              ? "عملاؤنا يعشقون منتجاتنا، ونسعى دائماً لإسعادهم."
              : "Our customers adore our products, and we constantly aim to delight them."}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2 lg:gap-7">
          {visible.map((testimonial, cardIndex) => (
            <motion.article key={`${testimonial.name}-${active}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: cardIndex * 0.08 }} className="grid overflow-hidden rounded-md border border-border bg-background sm:grid-cols-[38%_62%]">
              <div className="group relative min-h-64 overflow-hidden sm:min-h-0">
                <img src={testimonial.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110" />
                <button type="button" aria-label={`View ${testimonial.product}`} className="absolute left-1/2 top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-foreground opacity-0 shadow-sm transition-all duration-200 group-hover:opacity-100 group-hover:scale-110 focus-visible:opacity-100">
                  <Eye className="size-4 stroke-[1.8]" />
                </button>
              </div>

              <div className="flex min-w-0 flex-col p-6 sm:p-6 lg:p-7">
                <div className="flex gap-0.5 text-[#f3a13a]">
                  {Array.from({ length: 5 }).map((_, index) => <Star key={index} className="size-4 fill-current" />)}
                </div>
                <p className="mt-3 text-sm leading-6 text-foreground/70 sm:text-[15px]">{testimonial.text}</p>
                <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-foreground">
                  {testimonial.name}
                  <BadgeCheck className="size-4 text-[#2eab32]" />
                </p>
                <div className="mt-auto flex items-center gap-3 border-t border-border pt-4">
                  <img src={testimonial.productImage} alt="" className="size-12 shrink-0 rounded-full object-cover" />
                  <div className="min-w-0 text-sm leading-5">
                    <p className="truncate font-medium text-foreground">{testimonial.product}</p>
                    <p className="font-semibold text-foreground">{testimonial.price}</p>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-9 flex items-center justify-center gap-4">
          {testimonials.map((_, index) => (
            <button key={index} type="button" onClick={() => setActive(index)} className={`grid size-3 place-items-center rounded-full border border-foreground transition-colors ${active === index ? "bg-background" : "border-transparent"}`} aria-label={`Testimonial ${index + 1}`} aria-current={active === index ? "true" : undefined}>
              {active === index ? <span className="size-1.5 rounded-full bg-foreground" /> : <span className="size-1.5 rounded-full border border-foreground" />}
            </button>
          ))}
        </div>
      </div>
    </section>
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
