"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { HomeConfig } from "@/lib/home-config";

export function CollectionBanner({ config, locale }: { config: HomeConfig; locale: "en" | "ar" }) {
  const text = (key: keyof HomeConfig["content"]) => config.content[key][locale];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        <PromoCard
          image={config.images.collectionLeft}
          title={text("collectionLeftTitle")}
          discount={text("collectionDiscount")}
          cta={text("collectionCta")}
          href={config.links.collectionBanner}
          delay={0}
        />
        <ImageCard image={config.images.collectionCenter} href={config.links.collectionBanner} delay={0.08} />
        <PromoCard
          image={config.images.collectionRight}
          title={text("collectionRightTitle")}
          discount={text("collectionDiscount")}
          cta={text("collectionCta")}
          href={config.links.collectionBanner}
          delay={0.16}
        />
      </div>
    </section>
  );
}

function PromoCard({
  image,
  title,
  discount,
  cta,
  href,
  delay,
}: {
  image: string;
  title: string;
  discount: string;
  cta: string;
  href: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay }}
    >
      <Link
        href={href}
        className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-secondary sm:aspect-[3/4]"
      >
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
        />

        {/* Top-left heading */}
        <div className="absolute inset-x-0 top-0 p-6 lg:p-8">
          <h3 className="font-display text-3xl font-semibold leading-tight tracking-tight text-foreground lg:text-4xl">
            {title}
          </h3>
          <p
            className="mt-3 text-xs font-semibold uppercase tracking-[0.14em]"
            style={{ color: "var(--sale)" }}
          >
            {discount}
          </p>
        </div>

        {/* Bottom-left CTA */}
        <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
          <span className="relative inline-block text-sm font-semibold text-foreground after:absolute after:-bottom-1 after:start-0 after:h-px after:w-full after:bg-foreground after:transition-all after:duration-300 group-hover:after:w-0">
            {cta}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function ImageCard({ image, href, delay }: { image: string; href: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay }}
    >
      <Link
        href={href}
        aria-label="Shop featured product"
        className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-secondary sm:aspect-[3/4]"
      >
        <Image
          src={image}
          alt="Featured product"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
        />
      </Link>
    </motion.div>
  );
}
