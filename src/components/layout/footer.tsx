"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram, Send, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { toast } from "sonner";

export function Footer() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Subscribed successfully! Check your inbox for 10% off code.");
    setEmail("");
  };

  const infoLinks = [
    t.common.aboutUs,
    t.common.ourStories,
    t.common.sizeGuide,
    t.common.contactUs,
    t.common.career,
    t.common.myAccount,
  ];
  const serviceLinks = [
    t.common.shipping,
    t.common.returnRefund,
    t.common.privacyPolicy,
    t.common.termsConditions,
    t.common.ordersFaqs,
    t.common.myWishlist,
  ];

  return (
    <footer className="mt-auto border-t border-border bg-secondary/30">
      {/* Trust band */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4">
          {[
            { icon: "🚚", title: t.common.shipping, desc: "Free over $20" },
            { icon: "↩️", title: t.common.returnRefund, desc: "Within 14 days" },
            { icon: "🔒", title: t.common.safeCheckout, desc: t.common.payment },
            { icon: "💬", title: "24/7 Support", desc: t.common.contactUs },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-2xl">{f.icon}</span>
              <div>
                <p className="text-sm font-semibold leading-tight">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="lg:pe-8">
          <Link href="/" className="font-display text-2xl font-semibold tracking-tight">
            Modave
          </Link>
          <address className="mt-4 flex items-start gap-2 text-sm text-muted-foreground not-italic">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span>549 Oak St. Crystal Lake, IL 60014</span>
          </address>
          <a
            href="#"
            className="mt-2 inline-block text-xs font-semibold uppercase tracking-widest text-foreground underline-offset-4 hover:underline"
          >
            {t.common.getDirection}
          </a>
          <div className="mt-4 space-y-1.5 text-sm">
            <a href="mailto:themesflat@gmail.com" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <Mail className="h-4 w-4" /> themesflat@gmail.com
            </a>
            <a href="tel:3156666688" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <Phone className="h-4 w-4" /> 315-666-6688
            </a>
          </div>
          <div className="mt-5 flex items-center gap-2">
            {[Facebook, Twitter, Instagram].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Information */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">{t.common.information}</h4>
          <ul className="mt-4 space-y-2.5">
            {infoLinks.map((l, i) => (
              <li key={i}>
                <Link
                  href="/shop"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Services */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">
            {t.common.customerServices}
          </h4>
          <ul className="mt-4 space-y-2.5">
            {serviceLinks.map((l, i) => (
              <li key={i}>
                <Link
                  href="/shop"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">
            {t.common.newsletter}
          </h4>
          <p className="mt-4 text-sm text-muted-foreground">{t.common.newsletterDesc}</p>
          <form onSubmit={onSubscribe} className="mt-4 flex items-center gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.common.yourEmail}
              className="h-11 flex-1 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-foreground transition-colors"
            />
            <button
              type="submit"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-105"
              aria-label={t.common.subscribe}
            >
              <Send className="h-4 w-4 rtl-flip" />
            </button>
          </form>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            {t.common.newsletterAgree}
          </p>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row">
          <p className="text-xs text-muted-foreground">{t.common.rights}</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{t.common.payment}:</span>
            <div className="flex items-center gap-1.5">
              {["VISA", "MC", "AMEX", "PAY", "PP"].map((p) => (
                <span
                  key={p}
                  className="flex h-6 min-w-9 items-center justify-center rounded border border-border bg-background px-1.5 text-[9px] font-bold tracking-wide text-muted-foreground"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
