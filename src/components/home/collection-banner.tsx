"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/language-provider";

const IMAGES = {
  left: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900&q=80",
  center:
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80",
  right:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80",
};

export function CollectionBanner() {
  const { t } = useLanguage();
  const cb = t.collectionBanner;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        <PromoCard
          image={IMAGES.left}
          title={cb.leftTitle}
          discount={cb.discount}
          cta={cb.cta}
          delay={0}
        />
        <ImageCard image={IMAGES.center} delay={0.08} />
        <PromoCard
          image={IMAGES.right}
          title={cb.rightTitle}
          discount={cb.discount}
          cta={cb.cta}
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
  delay,
}: {
  image: string;
  title: string;
  discount: string;
  cta: string;
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
        href="/shop"
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

function ImageCard({ image, delay }: { image: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay }}
    >
      <Link
        href="/shop"
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
