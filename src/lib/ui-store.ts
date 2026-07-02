"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  recentlyViewed: number[];
  addRecentlyViewed: (id: number) => void;
  clearRecentlyViewed: () => void;
  // mini-cart drawer
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  // search overlay (future)
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      recentlyViewed: [],
      addRecentlyViewed: (id) =>
        set((s) => ({
          recentlyViewed: [id, ...s.recentlyViewed.filter((x) => x !== id)].slice(0, 8),
        })),
      clearRecentlyViewed: () => set({ recentlyViewed: [] }),
      cartOpen: false,
      setCartOpen: (open) => set({ cartOpen: open }),
      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),
    }),
    {
      name: "modave-ui",
      partialize: (s) => ({ recentlyViewed: s.recentlyViewed }),
    }
  )
);
