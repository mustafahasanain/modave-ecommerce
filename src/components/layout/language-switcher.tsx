"use client";

import { useLanguage } from "@/context/language-provider";

export function LanguageSwitcher() {
  const { dir, toggleLocale } = useLanguage();

  // Show the direction the user will switch TO.
  const targetDir = dir === "ltr" ? "RTL" : "LTR";

  return (
    <button
      onClick={toggleLocale}
      className="fixed end-2 top-1/2 z-[70] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-foreground text-[10px] font-semibold text-background shadow-lg transition-transform hover:scale-105"
      aria-label={`Switch to ${targetDir} layout`}
      title={`Switch to ${targetDir} layout`}
    >
      {targetDir}
    </button>
  );
}
