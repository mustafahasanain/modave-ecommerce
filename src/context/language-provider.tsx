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

const LOCALE_COOKIE = "modave_locale";

export function LanguageProvider({
  children,
  initialLocale = "en",
}: {
  children: React.ReactNode;
  /**
   * The locale the root layout resolved server-side (from the same cookie),
   * used to render text content. Must match what the server rendered — the
   * dictionary (t.*), unlike the html lang/dir attributes, is part of the
   * hydrated tree, so seeding client state from anything else (e.g.
   * localStorage) causes a hydration mismatch on the first render.
   */
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // sync html dir/lang + persist (this effect updates an external system, which is allowed)
  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    localStorage.setItem("locale", locale);
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
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
