"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { dictionaries, type Dictionary, type Locale } from "@/lib/i18n";

interface LanguageContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: Dictionary;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem("locale");
  return saved === "ar" || saved === "en" ? (saved as Locale) : "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // lazy initializer reads localStorage once on client mount (avoids SSR mismatch + effect setState)
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  // sync html dir/lang + persist (this effect updates an external system, which is allowed)
  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    localStorage.setItem("locale", locale);
  }, [locale]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);
  const toggleLocale = useCallback(
    () => setLocaleState((p) => (p === "en" ? "ar" : "en")),
    []
  );

  const value: LanguageContextValue = {
    locale,
    dir: locale === "ar" ? "rtl" : "ltr",
    t: dictionaries[locale],
    setLocale,
    toggleLocale,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback to english to avoid crashes during SSR / outside provider
    return {
      locale: "en" as Locale,
      dir: "ltr" as const,
      t: dictionaries.en,
      setLocale: () => {},
      toggleLocale: () => {},
    };
  }
  return ctx;
}
