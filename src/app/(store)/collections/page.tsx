"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { collections } from "@/data/products";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_SIZE = 8;

export default function CollectionsPage() {
  const { t, locale } = useLanguage();

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(collections.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = collections.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <>
      {/* ===== Page header ===== */}
      <section className="bg-secondary/40">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-10 sm:px-6 lg:py-14">
          <div className="flex-1">
            <nav className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground">
              <Link href="/" className="transition-colors hover:text-foreground">
                {t.common.home}
              </Link>
              <ChevronRight className="h-3 w-3 rtl-flip" />
              <span className="text-foreground">{t.collection.title}</span>
            </nav>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {t.collection.title}
            </h1>
          </div>
          <div className="relative hidden h-24 w-24 overflow-hidden rounded-full bg-secondary sm:block lg:h-32 lg:w-32">
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80"
              alt={t.collection.title}
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ===== Collections grid ===== */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {paged.map((c, i) => {
            const name = locale === "ar" ? c.nameAr : c.name;
            return (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: Math.min(i * 0.06, 0.36) }}
              >
                <Link
                  href="/shop"
                  className="group relative block overflow-hidden rounded-xl bg-secondary"
                >
                  {/* Image with hover zoom */}
                  <div className="relative aspect-square sm:aspect-[4/5]">
                    <Image
                      src={c.image}
                      alt={name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    {/* gradient overlay for legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-opacity duration-500 group-hover:from-black/70" />
                  </div>

                  {/* Bottom overlay with name + count */}
                  <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4 text-white sm:p-5">
                    <h3 className="font-display text-lg font-semibold leading-tight drop-shadow-sm sm:text-xl">
                      {name}
                    </h3>
                    <p className="text-[10px] uppercase tracking-widest text-white/80 sm:text-xs">
                      {c.count} {t.collection.items}
                    </p>
                  </div>

                  {/* Hover arrow chip */}
                  <span className="absolute end-3 top-3 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <ChevronRight className="h-4 w-4 rtl-flip" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Pagination (visual, matches template) */}
        <div className="mt-12">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                  className={safePage === 1 ? "pointer-events-none opacity-40" : undefined}
                />
              </PaginationItem>
              {[1, 2, 3].map((n) => (
                <PaginationItem key={n}>
                  <PaginationLink
                    href="#"
                    isActive={n === safePage}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(n);
                    }}
                  >
                    {n}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.min(totalPages, p + 1));
                  }}
                  className={
                    safePage === totalPages
                      ? "pointer-events-none opacity-40"
                      : undefined
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </section>
    </>
  );
}
