"use client";

import { Phone, Mail, MapPin, Globe, ChevronDown, Check } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export function TopBar() {
  const { t, locale, setLocale } = useLanguage();
  const [currency, setCurrency] = useState("USD");

  return (
    <div className="hidden md:block border-b border-border bg-secondary/40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs">
        <div className="flex items-center gap-5 text-muted-foreground">
          <a href={`tel:${t.topbar.phone}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
            <Phone className="h-3.5 w-3.5" />
            <span>{t.topbar.phone}</span>
          </a>
          <a
            href={`mailto:${t.topbar.email}`}
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>{t.topbar.email}</span>
          </a>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span>{t.topbar.ourStore}</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-muted-foreground">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 hover:text-foreground transition-colors outline-none">
              <Globe className="h-3.5 w-3.5" />
              <span>{currency}</span>
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-28">
              {["USD", "EUR", "GBP", "AED", "SAR"].map((c) => (
                <DropdownMenuItem
                  key={c}
                  onClick={() => setCurrency(c)}
                  className="justify-between"
                >
                  {c}
                  {currency === c && <Check className="h-3 w-3" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 hover:text-foreground transition-colors outline-none">
              <span className="text-[11px]">
                {locale === "en" ? "🇬🇧 English" : "🇸🇦 العربية"}
              </span>
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => setLocale("en")} className="justify-between">
                🇬🇧 English
                {locale === "en" && <Check className="h-3 w-3" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale("ar")} className="justify-between">
                🇸🇦 العربية
                {locale === "ar" && <Check className="h-3 w-3" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
