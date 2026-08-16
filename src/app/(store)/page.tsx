"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Eye, Headphones,
  Star, Truck, Undo2, Zap,
} from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { ProductCard } from "@/components/product/product-card";
import { InstagramFeed } from "@/components/home/instagram-feed";
import { CollectionBanner } from "@/components/home/collection-banner";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useTestimonials } from "@/hooks/use-testimonials";
import { useSiteSettings } from "@/hooks/use-site-settings";
import {
  parseHomeConfig, pickOrdered, type HomeConfig, type HomeContentKey,
} from "@/lib/home-config";

type TestimonialItem = {
  id?: number;
  text: string;
  name: string;
  role?: string;
  product?: string;
  price?: string;
  avatar?: string;
};

export default function HomePage() {
  const { t, locale, dir } = useLanguage();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const { products } = useProducts();
  const { categories } = useCategories();
  const { testimonials } = useTestimonials();
  const { settings } = useSiteSettings();
  const config = useMemo(() => parseHomeConfig(settings.homeConfig), [settings.homeConfig]);
  const language = locale === "ar" ? "ar" : "en";
  const text = (key: HomeContentKey) => config.content[key][language];

  const selectedCollections = pickOrdered(categories, config.collections, (item) => item.id, 5);
  const homeCollections = selectedCollections.length ? selectedCollections : categories.slice(0, 5);
  const newArrivals = products.filter((product) => product.newArrival);
  const bestSellers = products.filter((product) => product.bestSeller);
  const selectedTestimonials = pickOrdered(
    testimonials as TestimonialItem[], config.testimonials, (item) => item.id,
  );
  const homeTestimonials = selectedTestimonials.length
    ? selectedTestimonials
    : (testimonials as TestimonialItem[]);

  const announcement1 = language === "ar"
    ? settings.announcement1Ar || t.announcement.msg1
    : settings.announcement1 || t.announcement.msg1;
  const announcement2 = language === "ar"
    ? settings.announcement2Ar || t.announcement.msg2
    : settings.announcement2 || t.announcement.msg2;

  return (
    <>
      {config.sections.hero && <HeroCarousel />}

      {config.sections.announcement && (
        <section className="mb-6 overflow-hidden border-y border-[#e6e6e6] bg-white text-[#181818]">
          <div className="marquee-pause flex h-[55px] w-max animate-marquee items-center whitespace-nowrap">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="inline-flex h-full items-center gap-8 px-8 text-[13px] font-medium uppercase tracking-[0.12em] [&>span]:hidden">
                {i % 2 === 0 ? announcement1 : announcement2}
                <Zap className="h-4 w-4 shrink-0 stroke-[1.8]" />
                <span className="opacity-40">✦</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {config.sections.exploreCollections && (
        <section className="mx-auto max-w-7xl px-4 py-16 lg:py-20">
          <div className="mb-8 flex items-center justify-between gap-4">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {text("exploreTitle")}
            </motion.h2>
            <Link href={config.links.collections} className="shrink-0 text-sm font-medium underline underline-offset-4 hover:text-foreground/70">
              {text("collectionsCta")}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
            {homeCollections.map((collection, i) => (
              <motion.div key={collection.id ?? collection.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, delay: i * 0.05 }}>
                <Link href={`/shop?category=${encodeURIComponent(collection.name)}`} className="group block">
                  <div className="relative aspect-[7/10] overflow-hidden rounded-lg bg-secondary">
                    <Image src={collection.image} alt={collection.name} fill sizes="(max-width: 768px) 50vw, 19vw" className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110" />
                    <div className="absolute inset-x-0 bottom-0 p-4 lg:p-5">
                      <span className="block w-full rounded-full bg-white px-4 py-3.5 text-center text-sm font-medium text-black shadow-sm transition-colors group-hover:bg-white/90">
                        {language === "ar" ? collection.nameAr : collection.name}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {config.sections.newArrivals && newArrivals.length > 0 && (
        <ProductSection title={text("newArrivalsTitle")} description={text("newArrivalsDescription")} products={newArrivals} />
      )}

      {config.sections.collectionBanner && <CollectionBanner config={config} locale={language} />}

      {config.sections.bestSellers && bestSellers.length > 0 && (
        <ProductSection title={text("bestSellersTitle")} description={text("bestSellersDescription")} products={bestSellers} />
      )}

      {config.sections.promoBanner && (
        <section className="mx-auto max-w-7xl px-4 py-16 lg:py-24">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative">
            <div className="grid grid-cols-12 items-start gap-4 lg:gap-6">
              <div className="relative col-span-5 aspect-square overflow-hidden rounded-sm bg-secondary">
                <Image src={config.images.promoLeft} alt="" fill sizes="(max-width: 1024px) 42vw, 40vw" className="object-cover" />
              </div>
              <div className="relative col-span-7 col-start-6 aspect-[4/3] translate-y-8 overflow-hidden rounded-sm bg-secondary lg:col-span-6 lg:col-start-7 lg:translate-y-20">
                <Image src={config.images.promoRight} alt="" fill sizes="(max-width: 1024px) 58vw, 50vw" className="object-cover" />
              </div>
            </div>
            <div className="absolute start-1/2 top-1/2 w-[88%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-sm bg-background p-8 text-center shadow-2xl rtl:translate-x-1/2 sm:p-12">
              <h3 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {text("promoTitle1")}<br />{text("promoTitle2")}
              </h3>
              <p className="mt-4 text-sm text-muted-foreground">{text("promoSubtitle")}</p>
              <Button asChild size="lg" className="mt-7 rounded-full px-7 text-xs font-semibold uppercase tracking-[0.12em]">
                <Link href={config.links.promo}>{text("promoCta")}<ArrowUpRight className="h-4 w-4 rtl-flip" /></Link>
              </Button>
            </div>
          </motion.div>
        </section>
      )}

      {config.sections.features && <FeatureSection config={config} locale={language} />}

      {config.sections.brandStory && (
        <section className="mx-auto max-w-7xl px-4 py-16 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div initial={{ opacity: 0, x: dir === "rtl" ? 40 : -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary">
                <Image src={config.images.brandStory} alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              </div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.5 }} className="absolute -bottom-6 end-6 rounded-2xl border border-border bg-background p-5 shadow-lg sm:end-10">
                <p className="font-display text-3xl font-semibold">{config.brandStat}</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{text("brandStatLabel")}</p>
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{text("brandEyebrow")}</p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{text("brandTitle")}</h2>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">{text("brandBody")}</p>
              <div className="mt-8 grid gap-5 sm:grid-cols-3">
                {[1, 2, 3].map((number) => (
                  <div key={number} className="border-t border-border pt-3">
                    <p className="font-display text-sm font-semibold text-muted-foreground">0{number}</p>
                    <p className="mt-1 text-sm font-medium">{text(`brandFeature${number}Title` as HomeContentKey)}</p>
                    <p className="text-xs text-muted-foreground">{text(`brandFeature${number}Description` as HomeContentKey)}</p>
                  </div>
                ))}
              </div>
              <Button asChild variant="outline" className="mt-8 rounded-full px-7">
                <Link href={config.links.collectionBanner}>{text("brandCta")}<Arrow className="h-4 w-4 rtl-flip" /></Link>
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      {config.sections.testimonials && homeTestimonials.length > 0 && (
        <TestimonialsSection testimonials={homeTestimonials} title={text("testimonialsTitle")} subtitle={text("testimonialsSubtitle")} />
      )}

      {config.sections.instagramFeed && <InstagramFeed title={text("instagramTitle")} subtitle={text("instagramSubtitle")} />}
    </>
  );
}

function ProductSection({ title, description, products }: { title: string; description: string; products: ReturnType<typeof useProducts>["products"] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:py-20">
      <div className="mb-8 flex items-end justify-center gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
          <p className="mt-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">{description}</p>
        </motion.div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
      </div>
    </section>
  );
}

function FeatureSection({ config, locale }: { config: HomeConfig; locale: "en" | "ar" }) {
  const icons = [Undo2, Truck, Headphones, BadgeCheck];
  return (
    <section>
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-14 lg:grid-cols-4 lg:py-16">
        {icons.map((Icon, index) => {
          const number = index + 1;
          return (
            <motion.div key={number} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.08 }} className="flex flex-col items-center px-2 text-center">
              <Icon className="h-12 w-12 stroke-[1.4] text-foreground" />
              <h6 className="mt-5 text-xl font-semibold text-foreground">{config.content[`feature${number}Title` as HomeContentKey][locale]}</h6>
              <p className="mt-2.5 text-base text-muted-foreground">{config.content[`feature${number}Description` as HomeContentKey][locale]}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function TestimonialsSection({ testimonials, title, subtitle }: { testimonials: TestimonialItem[]; title: string; subtitle: string }) {
  const [active, setActive] = useState(0);
  const safeActive = active % testimonials.length;
  const visible = testimonials.length === 1
    ? [testimonials[0]]
    : [testimonials[safeActive], testimonials[(safeActive + 1) % testimonials.length]];
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20 lg:py-24">
        <div className="mb-10 text-center sm:mb-11">
          <h2 className="font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">{title}</h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">{subtitle}</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2 lg:gap-7">
          {visible.map((testimonial, cardIndex) => (
            <motion.article key={`${testimonial.id ?? testimonial.name}-${safeActive}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: cardIndex * 0.08 }} className="grid overflow-hidden rounded-md border border-border bg-background sm:grid-cols-[38%_62%]">
              <div className="group relative min-h-64 overflow-hidden bg-secondary sm:min-h-0">
                {testimonial.avatar && <img src={testimonial.avatar} alt={testimonial.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110" />}
                <span className="absolute left-1/2 top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-foreground opacity-0 shadow-sm transition-all duration-200 group-hover:scale-110 group-hover:opacity-100"><Eye className="size-4 stroke-[1.8]" /></span>
              </div>
              <div className="flex min-w-0 flex-col p-6 sm:p-6 lg:p-7">
                <div className="flex gap-0.5 text-[#f3a13a]">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className="size-4 fill-current" />)}</div>
                <p className="mt-3 text-sm leading-6 text-foreground/70 sm:text-[15px]">{testimonial.text}</p>
                <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-foreground">{testimonial.name}<BadgeCheck className="size-4 text-[#2eab32]" /></p>
                {(testimonial.product || testimonial.price || testimonial.role) && (
                  <div className="mt-auto border-t border-border pt-4 text-sm leading-5">
                    {testimonial.product && <p className="truncate font-medium text-foreground">{testimonial.product}</p>}
                    <p className="text-muted-foreground">{testimonial.price || testimonial.role}</p>
                  </div>
                )}
              </div>
            </motion.article>
          ))}
        </div>
        {testimonials.length > 1 && (
          <div className="mt-9 flex items-center justify-center gap-4">
            {testimonials.map((_, index) => (
              <button key={index} type="button" onClick={() => setActive(index)} className={`grid size-3 place-items-center rounded-full border border-foreground transition-colors ${safeActive === index ? "bg-background" : "border-transparent"}`} aria-label={`Testimonial ${index + 1}`} aria-current={safeActive === index ? "true" : undefined}>
                <span className={`size-1.5 rounded-full ${safeActive === index ? "bg-foreground" : "border border-foreground"}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
