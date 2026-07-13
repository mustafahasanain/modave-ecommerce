"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Phone, ArrowUpRight, ChevronDown, Check } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/*                               Brand icons                                  */
/* -------------------------------------------------------------------------- */

type IconProps = { className?: string };

const socials: { label: string; href: string; path: string }[] = [
  {
    label: "Facebook",
    href: "#",
    path: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z",
  },
  {
    label: "X",
    href: "#",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z",
  },
  {
    label: "Instagram",
    href: "#",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311 1.266-.058 1.646-.07 4.85-.07Zm0 3.676a6.161 6.161 0 1 0 0 12.322 6.161 6.161 0 0 0 0-12.322Zm0 10.162a4.001 4.001 0 1 1 0-8.002 4.001 4.001 0 0 1 0 8.002Zm6.406-10.845a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z",
  },
  {
    label: "TikTok",
    href: "#",
    path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.08-.14 1.62.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07Z",
  },
  {
    label: "Amazon",
    href: "#",
    path: "M.045 18.02c.072-.116.187-.18.315-.18h.075c.048 0 .096.012.144.036 1.803.966 3.807 1.464 6.012 1.494 1.803 0 3.588-.336 5.352-1.008.093-.036.207-.084.315-.144.288-.156.573.156.324.396-.156.144-.336.264-.552.372-1.926.996-4.05 1.494-6.372 1.494-2.658 0-5.106-.678-7.344-2.034-.144-.09-.24-.24-.24-.402 0-.036 0-.072.012-.108.036-.048.06-.108.06-.156Zm22.788-2.652c-.204-.264-1.344-.126-1.86-.06-.156.018-.18-.12-.036-.222.912-.642 2.406-.456 2.58-.24.174.216-.048 1.71-.9 2.424-.132.108-.258.048-.198-.096.192-.48.624-1.542.414-1.806ZM15.618 9.9c0 .888.024 1.626-.426 2.418-.36.642-.936 1.038-1.572 1.038-.87 0-1.38-.66-1.38-1.638 0-1.926 1.728-2.274 3.378-2.274v.456Zm2.298 5.55c-.15.132-.366.144-.534.054-.756-.63-.888-.918-1.302-1.518-1.242 1.266-2.124 1.644-3.732 1.644-1.908 0-3.396-1.176-3.396-3.534 0-1.836 1.002-3.09 2.424-3.702 1.236-.54 2.964-.636 4.284-.786v-.294c0-.54.042-1.176-.276-1.638-.276-.414-.804-.588-1.272-.588-.864 0-1.632.444-1.821 1.362-.036.204-.186.408-.396.42l-2.202-.24c-.186-.042-.396-.192-.342-.474.51-2.664 2.922-3.468 5.082-3.468 1.104 0 2.55.294 3.42 1.128 1.104 1.032.996 2.406.996 3.906v3.534c0 1.062.444 1.53.858 2.106.15.204.18.45-.006.6-.462.384-1.284 1.098-1.734 1.5l-.006-.012Z",
  },
  {
    label: "Pinterest",
    href: "#",
    path: "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0Z",
  },
];

function BrandIcon({ path, className }: IconProps & { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d={path} />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Payment cards                                  */
/* -------------------------------------------------------------------------- */

function PaymentCard({
  children,
  bg = "#ffffff",
}: {
  children: React.ReactNode;
  bg?: string;
}) {
  return (
    <svg viewBox="0 0 48 32" className="h-6 w-9">
      <rect
        width="47"
        height="31"
        x="0.5"
        y="0.5"
        rx="4"
        fill={bg}
        stroke="#e5e7eb"
      />
      {children}
    </svg>
  );
}

const paymentCards = [
  <PaymentCard key="visa">
    <text
      x="24"
      y="21"
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
      fontSize="12"
      fontStyle="italic"
      fontWeight="700"
      fill="#1A1F71"
    >
      VISA
    </text>
  </PaymentCard>,
  <PaymentCard key="mc">
    <circle cx="20" cy="16" r="7" fill="#EB001B" />
    <circle cx="28" cy="16" r="7" fill="#F79E1B" fillOpacity="0.85" />
  </PaymentCard>,
  <PaymentCard key="amex" bg="#1F72CF">
    <text
      x="24"
      y="20"
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
      fontSize="8"
      fontWeight="700"
      fill="#ffffff"
    >
      AMEX
    </text>
  </PaymentCard>,
  <PaymentCard key="paypal">
    <text
      x="24"
      y="20"
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
      fontSize="8.5"
      fontStyle="italic"
      fontWeight="700"
    >
      <tspan fill="#003087">Pay</tspan>
      <tspan fill="#009cde">Pal</tspan>
    </text>
  </PaymentCard>,
  <PaymentCard key="diners">
    <circle cx="24" cy="16" r="8" fill="#0079BE" />
    <circle cx="21" cy="16" r="4" fill="#ffffff" />
  </PaymentCard>,
  <PaymentCard key="discover">
    <text
      x="21"
      y="20"
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
      fontSize="7"
      fontWeight="700"
      fill="#111827"
    >
      DISCOVER
    </text>
    <circle cx="41" cy="17" r="4" fill="#FF6000" />
  </PaymentCard>,
];

/* -------------------------------------------------------------------------- */
/*                          Flags + hover selector                            */
/* -------------------------------------------------------------------------- */

const flagClass = "h-3.5 w-5 shrink-0 rounded-[3px] ring-1 ring-black/10";

function FlagUS({ className = flagClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden>
      <rect width="24" height="16" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect
          key={i}
          y={(i * 16) / 13}
          width="24"
          height={16 / 13}
          fill="#B22234"
        />
      ))}
      <rect width="9.6" height={(7 * 16) / 13} fill="#3C3B6E" />
    </svg>
  );
}

function FlagVN({ className = flagClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden>
      <rect width="24" height="16" fill="#DA251D" />
      <path
        d="M12 3 L13.18 6.38 L16.76 6.46 L13.9 8.62 L14.94 12.05 L12 10 L9.06 12.05 L10.1 8.62 L7.24 6.46 L10.82 6.38 Z"
        fill="#FFFF00"
      />
    </svg>
  );
}

type Option = { value: string; label: string; flag?: React.ReactNode };

function HoverSelect({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  const current = options.find((o) => o.value === value) ?? options[0];
  return (
    <div className="group relative">
      <button
        type="button"
        aria-label={ariaLabel}
        className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground group-hover:text-foreground"
      >
        {current.flag}
        <span>{current.label}</span>
        <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
      </button>
      <div className="invisible absolute bottom-full start-0 z-50 pb-2.5 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
        <div className="relative min-w-[9rem] rounded-xl border border-border bg-background p-1.5 shadow-lg">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors hover:bg-secondary ${
                o.value === value
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {o.flag}
              <span>{o.label}</span>
            </button>
          ))}
          <div className="absolute -bottom-1 start-5 h-2 w-2 rotate-45 border-b border-e border-border bg-background" />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Footer                                      */
/* -------------------------------------------------------------------------- */

export function Footer() {
  const { t, locale, setLocale } = useLanguage();
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [currency, setCurrency] = useState("USD");

  const currencyOptions: Option[] = [
    { value: "USD", label: "USD", flag: <FlagUS /> },
    { value: "VND", label: "VND", flag: <FlagVN /> },
  ];
  const languageOptions: Option[] = [
    { value: "en", label: "English" },
    { value: "ar", label: "العربية" },
  ];

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success(
      "Subscribed successfully! Check your inbox for 10% off code.",
    );
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

  // Render the agree line, turning the two policy phrases into underlined links.
  const agreeLabels: string[] = [
    t.common.termsOfService,
    t.common.privacyPolicy,
  ];
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const agreeSegments = t.common.newsletterAgree.split(
    new RegExp(`(${agreeLabels.map(escape).join("|")})`, "g"),
  );

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1.2fr_2fr] lg:gap-8">
        {/* Brand */}
        <div className="lg:pe-10">
          <Link
            href="/"
            className="font-display text-3xl font-bold tracking-tight"
          >
            Modave
          </Link>
          <address className="mt-6 text-sm not-italic text-muted-foreground">
            549 Oak St. Crystal Lake, IL 60014
          </address>
          <a
            href="#"
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-foreground underline-offset-4 hover:underline"
          >
            {t.common.getDirection}
            <ArrowUpRight className="h-4 w-4 rtl-flip" />
          </a>
          <div className="mt-6 space-y-3 text-sm">
            <a
              href="mailto:themesflat@gmail.com"
              className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground"
            >
              <Mail className="h-4 w-4" /> themesflat@gmail.com
            </a>
            <a
              href="tel:3156666688"
              className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground"
            >
              <Phone className="h-4 w-4" /> 315-666-6688
            </a>
          </div>
          <div className="mt-6 flex items-center gap-2.5">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                <BrandIcon path={s.path} className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Information */}
        <div>
          <h4 className="text-base font-semibold text-foreground">
            {t.common.information}
          </h4>
          <ul className="mt-3 space-y-3">
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
          <h4 className="text-base font-semibold text-foreground">
            {t.common.customerServices}
          </h4>
          <ul className="mt-3 space-y-3">
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
          <h4 className="text-base font-semibold text-foreground">
            {t.common.newsletter}
          </h4>
          <p className="mt-5 text-sm text-muted-foreground">
            {t.common.newsletterDesc}
          </p>
          <form onSubmit={onSubscribe} className="relative mt-5">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.common.yourEmail}
              className="h-14 w-full rounded-full border border-border bg-background pe-16 ps-6 text-sm outline-none transition-colors focus:border-foreground"
            />
            <button
              type="submit"
              className="absolute end-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-105"
              aria-label={t.common.subscribe}
            >
              <ArrowUpRight className="h-5 w-5 rtl-flip" />
            </button>
          </form>
          <label className="mt-4 flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
            <button
              type="button"
              role="checkbox"
              aria-checked={agreed}
              onClick={() => setAgreed((v) => !v)}
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                agreed
                  ? "border-foreground bg-foreground text-background"
                  : "border-muted-foreground/50"
              }`}
            >
              {agreed && <Check className="h-3 w-3" strokeWidth={3} />}
            </button>
            <span>
              {agreeSegments.map((seg, i) =>
                agreeLabels.includes(seg) ? (
                  <a
                    key={i}
                    href="#"
                    className="font-semibold text-foreground underline underline-offset-2"
                  >
                    {seg}
                  </a>
                ) : (
                  <span key={i}>{seg}</span>
                ),
              )}
            </span>
          </label>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-5 sm:flex-row">
          <p className="text-xs text-muted-foreground">{t.common.rights}</p>

          <div className="flex items-center gap-4 sm:ms-8">
            <HoverSelect
              ariaLabel="Select currency"
              value={currency}
              options={currencyOptions}
              onChange={setCurrency}
            />
            <HoverSelect
              ariaLabel="Select language"
              value={locale}
              options={languageOptions}
              onChange={(v) => setLocale(v as typeof locale)}
            />
          </div>

          <div className="flex items-center gap-2 sm:ms-auto">
            <span className="text-xs text-muted-foreground">
              {t.common.payment}:
            </span>
            <div className="flex items-center gap-1.5">{paymentCards}</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
