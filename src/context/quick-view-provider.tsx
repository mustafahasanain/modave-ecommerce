"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { type Product } from "@/data/products";
import { QuickViewModal } from "@/components/product/quick-view-modal";

interface QuickViewContextValue {
  openQuickView: (product: Product) => void;
}

const QuickViewContext = createContext<QuickViewContextValue>({
  openQuickView: () => {},
});

export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const openQuickView = useCallback((p: Product) => {
    setProduct(p);
    setOpen(true);
  }, []);

  return (
    <QuickViewContext.Provider value={{ openQuickView }}>
      {children}
      <QuickViewModal product={product} open={open} onOpenChange={setOpen} />
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  return useContext(QuickViewContext);
}
