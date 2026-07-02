"use client";

import { motion } from "framer-motion";

interface ProductCardSkeletonProps {
  count?: number;
}

export function ProductCardSkeleton({ count = 4 }: ProductCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="group relative">
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-secondary via-secondary/80 to-secondary" />
            {/* badge placeholder */}
            <div className="absolute start-3 top-3 h-5 w-12 animate-pulse rounded-full bg-background/60" />
            {/* action placeholder */}
            <div className="absolute end-3 top-3 h-8 w-8 animate-pulse rounded-full bg-background/60" />
            {/* bottom bar placeholder */}
            <div className="absolute inset-x-3 bottom-3 h-9 animate-pulse rounded-full bg-background/60" />
          </div>
          <div className="mt-3 space-y-2 px-0.5">
            <div className="h-2.5 w-16 animate-pulse rounded bg-secondary" />
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-secondary" />
            <div className="h-2.5 w-20 animate-pulse rounded bg-secondary" />
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 animate-pulse rounded bg-secondary" />
              <div className="h-3 w-12 animate-pulse rounded bg-secondary" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 animate-pulse rounded-full bg-secondary" />
              <div className="h-3 w-3 animate-pulse rounded-full bg-secondary" />
              <div className="h-3 w-3 animate-pulse rounded-full bg-secondary" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export function PageSkeleton({ lines = 6 }: { lines?: number }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
        <div className="h-10 w-2/3 animate-pulse rounded bg-secondary" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-secondary" />
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          <ProductCardSkeleton count={8} />
        </div>
      </motion.div>
    </div>
  );
}
