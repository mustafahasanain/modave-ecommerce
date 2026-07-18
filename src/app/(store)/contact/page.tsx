"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Mail, Phone, MapPin, Clock } from "lucide-react";
import { useLanguage } from "@/context/language-provider";

export default function ContactPage() {
  const { t, locale } = useLanguage();
  const ar = locale === "ar";

  const cards = [
    {
      icon: MapPin,
      label: ar ? "العنوان" : "Address",
      value: "549 Oak St. Crystal Lake, IL 60014",
      href: undefined,
    },
    {
      icon: Phone,
      label: ar ? "الهاتف" : "Phone",
      value: t.topbar.phone,
      href: `tel:${t.topbar.phone}`,
    },
    {
      icon: Mail,
      label: ar ? "البريد الإلكتروني" : "Email",
      value: t.topbar.email,
      href: `mailto:${t.topbar.email}`,
    },
    {
      icon: Clock,
      label: ar ? "ساعات العمل" : "Store Hours",
      value: ar ? "الإثنين - السبت، 9 صباحاً - 6 مساءً" : "Mon - Sat, 9am - 6pm",
      href: undefined,
    },
  ];

  return (
    <>
      {/* PAGE HEADER */}
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:py-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {ar ? "تواصل معنا" : "Contact Us"}
            </h1>
            <nav
              aria-label="breadcrumb"
              className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
            >
              <Link href="/" className="hover:text-foreground">
                {t.common.home}
              </Link>
              <ChevronRight className="h-3 w-3 rtl-flip" />
              <span className="text-foreground">
                {ar ? "تواصل معنا" : "Contact Us"}
              </span>
            </nav>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 lg:py-16">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-xl text-sm leading-relaxed text-muted-foreground"
        >
          {ar
            ? "يسعدنا تواصلك معنا. تواصل معنا عبر الهاتف أو البريد الإلكتروني أو زُر متجرنا."
            : "We'd love to hear from you. Reach out by phone, email, or visit our store."}
        </motion.p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => {
            const Icon = c.icon;
            const content = (
              <>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {c.label}
                </p>
                <p className="mt-1.5 text-sm font-medium text-foreground">{c.value}</p>
              </>
            );
            return (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-6"
              >
                {c.href ? (
                  <a href={c.href} className="block transition-colors hover:text-foreground">
                    {content}
                  </a>
                ) : (
                  content
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
}
