"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/context/language-provider";

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
    image: "/banners/modave-elegance-1.jpg",
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
    image: "/banners/modave-elegance-2.jpg",
    eyebrow: "Find Your",
    eyebrowAr: "ابحثي عن",
    title: "Signature Style",
    titleAr: "أسلوبك الخاص",
    subtitle: "Explore and refine your unique style with our curated finds",
    subtitleAr: "استكشفي أسلوبك الفريد مع اختياراتنا المنتقاة.",
    cta: "Shop Sale",
    ctaAr: "تسوق العروض",
    href: "/shop",
  },
  {
    image: "/banners/modave-elegance-3.jpg",
    eyebrow: "Mix & Match",
    eyebrowAr: "نسقي وامزجي",
    title: "Layers for Every Look",
    titleAr: "طبقات لكل إطلالة",
    subtitle: "Create endless styles with our versatile layers for every occasion",
    subtitleAr: "اصنعي إطلالات متنوعة بقطع مرنة لكل مناسبة.",
    cta: "Shop New",
    ctaAr: "تسوق الجديد",
    href: "/shop",
  },
];

export function HeroCarousel() {
  const { locale, dir } = useLanguage();
  const [active, setActive] = useState(0);
  const ar = locale === "ar";
  const slide = slides[active];

  useEffect(() => {
    const id = setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 6000);

    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative h-[calc(100vh-68px)] min-h-[620px] max-h-[820px] w-full overflow-hidden bg-[#f7f7f7] lg:h-[calc(100vh-84px)]">
      <AnimatePresence mode="sync">
        <motion.div
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt={ar ? slide.titleAr : slide.title}
            fill
            priority={active === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full w-full items-center px-4 sm:px-8 lg:px-16 2xl:px-[144px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
            className="max-w-[760px] text-[#111111]"
          >
            <h1 className="max-w-[680px] text-[42px] font-normal leading-[1.08] tracking-normal sm:text-[56px] lg:text-[74px] 2xl:text-[84px]">
              <span className="block">{ar ? slide.eyebrowAr : slide.eyebrow}</span>
              <span className="block">{ar ? slide.titleAr : slide.title}</span>
            </h1>
            <p className="mt-6 max-w-lg text-sm font-normal leading-relaxed text-[#111111] sm:text-lg">
              {ar ? slide.subtitleAr : slide.subtitle}
            </p>
            <Link
              href={slide.href}
              className="group mt-9 inline-flex h-[58px] items-center justify-center gap-3 rounded-full bg-[#111111] px-8 text-[16px] font-bold leading-none text-white transition-colors hover:bg-[#2a2a2a]"
            >
              {ar ? slide.ctaAr : slide.cta}
              <ArrowUpRight
                className={`h-5 w-5 stroke-[2.4] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                  dir === "rtl" ? "scale-x-[-1]" : ""
                }`}
              />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 start-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
              active === i ? "border border-[#111111]" : "border border-transparent"
            }`}
            aria-label={`Slide ${i + 1}`}
          >
            <span
              className={`block h-2.5 w-2.5 rounded-full border border-[#111111] ${
                active === i ? "bg-[#111111]" : "bg-transparent"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
