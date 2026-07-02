"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  savedForLater: CartItem[];
  wishlist: number[];
  coupon: string | null;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: number, size?: string, color?: string) => void;
  updateQuantity: (id: number, quantity: number, size?: string, color?: string) => void;
  saveForLater: (id: number, size?: string, color?: string) => void;
  moveToCart: (id: number, size?: string, color?: string) => void;
  removeSaved: (id: number, size?: string, color?: string) => void;
  clearCart: () => void;
  toggleWishlist: (id: number) => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  subtotal: () => number;
  count: () => number;
}

const sameVariant = (a: CartItem, id: number, size?: string, color?: string) =>
  a.id === id && a.size === size && a.color === color;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      savedForLater: [],
      wishlist: [],
      coupon: null,
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => sameVariant(i, item.id, item.size, item.color));
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameVariant(i, item.id, item.size, item.color)
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        }),
      removeItem: (id, size, color) =>
        set((state) => ({
          items: state.items.filter((i) => !sameVariant(i, id, size, color)),
        })),
      updateQuantity: (id, quantity, size, color) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              sameVariant(i, id, size, color) ? { ...i, quantity: Math.max(1, quantity) } : i
            )
            .filter((i) => i.quantity > 0),
        })),
      saveForLater: (id, size, color) =>
        set((state) => {
          const item = state.items.find((i) => sameVariant(i, id, size, color));
          if (!item) return {};
          return {
            items: state.items.filter((i) => !sameVariant(i, id, size, color)),
            savedForLater: [...state.savedForLater, item],
          };
        }),
      moveToCart: (id, size, color) =>
        set((state) => {
          const item = state.savedForLater.find((i) => sameVariant(i, id, size, color));
          if (!item) return {};
          const existing = state.items.find((i) => sameVariant(i, id, size, color));
          return {
            savedForLater: state.savedForLater.filter((i) => !sameVariant(i, id, size, color)),
            items: existing
              ? state.items.map((i) =>
                  sameVariant(i, id, size, color) ? { ...i, quantity: i.quantity + item.quantity } : i
                )
              : [...state.items, item],
          };
        }),
      removeSaved: (id, size, color) =>
        set((state) => ({
          savedForLater: state.savedForLater.filter((i) => !sameVariant(i, id, size, color)),
        })),
      clearCart: () => set({ items: [], coupon: null }),
      toggleWishlist: (id) =>
        set((state) => ({
          wishlist: state.wishlist.includes(id)
            ? state.wishlist.filter((w) => w !== id)
            : [...state.wishlist, id],
        })),
      applyCoupon: (code) => set({ coupon: code }),
      removeCoupon: () => set({ coupon: null }),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "modave-cart",
      // only persist serializable parts
      partialize: (s) => ({
        items: s.items,
        savedForLater: s.savedForLater,
        wishlist: s.wishlist,
        coupon: s.coupon,
      }),
    }
  )
);
