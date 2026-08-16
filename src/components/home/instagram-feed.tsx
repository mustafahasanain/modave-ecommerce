"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Instagram, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { useSiteSettings } from "@/hooks/use-site-settings";

const fallbackImages = [
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80",
  "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80",
  "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&q=80",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80",
];

function parseImages(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (u): u is string => typeof u === "string" && u.trim().length > 0,
    );
  } catch {
    return [];
  }
}

export function InstagramFeed({ title, subtitle }: { title?: string; subtitle?: string }) {
  const { locale } = useLanguage();
  const { settings } = useSiteSettings();

  const feedImages = (() => {
    const fromSettings = parseImages(settings.instagramImages);
    return fromSettings.length > 0 ? fromSettings.slice(0, 12) : fallbackImages;
  })();

  const handle = settings.instagramHandle || "@modave";

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            <Instagram className="h-3.5 w-3.5" />
            {handle}
          </div>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {title || (locale === "ar" ? "متجر انستغرام" : "Shop Instagram")}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {subtitle || (locale === "ar"
              ? "جددي خزانة ملابسك باقتناء قطع جديدة اليوم!"
              : "Elevate your wardrobe with fresh finds today!")}
          </p>
        </motion.div>

        {/* Feed grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
          {feedImages.map((src, i) => (
            <motion.a
              key={`${src}-${i}`}
              href="#"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.5) }}
              className="group relative aspect-square overflow-hidden rounded-lg bg-secondary"
            >
              <Image
                src={src}
                alt={`Instagram post ${i + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 opacity-0 transition-all duration-300 group-hover:bg-foreground/40 group-hover:opacity-100">
                <Instagram className="h-6 w-6 text-background" />
              </div>
              <ArrowUpRight className="absolute end-2 top-2 h-4 w-4 text-background opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
