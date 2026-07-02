"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { Button } from "@/components/ui/button";

interface Slide {
  image: string;
  eyebrow: string;
  eyebrowAr: string;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  cta: string;
  ctaAr: string;
  href: string;
}

const slides: Slide[] = [
  {
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80",
    eyebrow: "Summer 2024",
    eyebrowAr: "صيف 2024",
    title: "Collection",
    titleAr: "المجموعة",
    subtitle: "Fresh styles just in! Elevate your look.",
    subtitleAr: "إطلالات جديدة وصلت للتو! ارتقِ بمظهرك.",
    cta: "Explore Collection",
    ctaAr: "استكشف المجموعة",
    href: "/shop",
  },
  {
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80",
    eyebrow: "New Arrivals",
    eyebrowAr: "وصل حديثاً",
    title: "Elegant Outerwear",
    titleAr: "ملابس خارجية أنيقة",
    subtitle: "Tailored coats & trench pieces for the season.",
    subtitleAr: "معاطف وتريش مفصّلة للموسم.",
    cta: "Shop Now",
    ctaAr: "تسوق الآن",
    href: "/shop",
  },
  {
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80",
    eyebrow: "Signature",
    eyebrowAr: "مميز",
    title: "Timeless Essentials",
    titleAr: "أساسيات خالدة",
    subtitle: "Curated pieces crafted to transcend seasons.",
    subtitleAr: "قطع مختارة لتتجاوز المواسم.",
    cta: "Discover",
    ctaAr: "اكتشف",
    href: "/collections",
  },
];

export function HeroCarousel() {
  const { locale, dir } = useLanguage();
  const [active, setActive] = useState(0);
  const ar = locale === "ar";
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const Prev = dir === "rtl" ? ChevronRight : ChevronLeft;
  const Next = dir === "rtl" ? ChevronLeft : ChevronRight;

  const go = useCallback((n: number) => setActive((p) => (n + slides.length) % slides.length), []);

  useEffect(() => {
    const id = setInterval(() => setActive((p) => (p + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, []);

  const slide = slides[active];

  return (
    <section className="relative h-[78vh] min-h-[520px] w-full overflow-hidden bg-secondary">
      {/* Slides */}
      <AnimatePresence mode="sync">
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt={ar ? slide.titleAr : slide.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* gradient overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Text content overlay */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: dir === "rtl" ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir === "rtl" ? -20 : 20 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="max-w-lg text-white"
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest backdrop-blur-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--sale)]" />
              {ar ? slide.eyebrowAr : slide.eyebrow}
            </motion.span>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] tracking-tight drop-shadow-sm sm:text-6xl lg:text-7xl">
              {ar ? slide.titleAr : slide.title}
            </h1>
            <p className="mt-4 max-w-md text-base text-white/90 drop-shadow-sm sm:text-lg">
              {ar ? slide.subtitleAr : slide.subtitle}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="group rounded-full bg-white px-7 text-foreground hover:bg-white/90">
                <Link href={slide.href}>
                  {ar ? slide.ctaAr : slide.cta}
                  <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl-flip" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-white/50 bg-transparent px-7 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/collections">{ar ? "كل المجموعات" : "All Collections"}</Link>
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={() => go(active - 1)}
        className="absolute start-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40 sm:flex"
        aria-label="Previous slide"
      >
        <Prev className="h-5 w-5" />
      </button>
      <button
        onClick={() => go(active + 1)}
        className="absolute end-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40 sm:flex"
        aria-label="Next slide"
      >
        <Next className="h-5 w-5" />
      </button>

      {/* Pagination dots */}
      <div className="absolute bottom-6 start-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              active === i ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-6 end-6 z-20 hidden font-mono text-xs text-white/80 sm:block">
        {String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
      </div>
    </section>
  );
}
