"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MiniCart } from "@/components/layout/mini-cart";
import { QuickViewProvider } from "@/context/quick-view-provider";
import { BackToTop } from "@/components/layout/back-to-top";
import { SearchCommand } from "@/components/layout/search-command";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <QuickViewProvider>{children}</QuickViewProvider>
      </main>
      <Footer />
      <MiniCart />
      <BackToTop />
      <SearchCommand />
    </div>
  );
}
