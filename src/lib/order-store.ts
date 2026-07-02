"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PlacedOrderItem {
  id: number;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
}

export interface PlacedOrder {
  orderNumber: string;
  date: string; // ISO
  items: PlacedOrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    town: string;
    street: string;
    postal: string;
    note?: string;
  };
  paymentMethod: string;
  estimatedDelivery: string; // ISO date
}

interface OrderState {
  lastOrder: PlacedOrder | null;
  setLastOrder: (order: PlacedOrder) => void;
  clearLastOrder: () => void;
}

function generateOrderNumber(): string {
  const ts = Date.now().toString().slice(-8);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MDV-${ts}-${rand}`;
}

export function createOrderNumber() {
  return generateOrderNumber();
}

export const useOrder = create<OrderState>()(
  persist(
    (set) => ({
      lastOrder: null,
      setLastOrder: (order) => set({ lastOrder: order }),
      clearLastOrder: () => set({ lastOrder: null }),
    }),
    {
      name: "modave-last-order",
      // Skip hydration to avoid SSR/CSR mismatch on the confirmation page;
      // we read lastOrder only after explicit client-side actions (checkout).
      skipHydration: true,
    }
  )
);
