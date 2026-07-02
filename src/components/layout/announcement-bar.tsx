"use client";

import { useLanguage } from "@/context/language-provider";

export function AnnouncementBar() {
  const { t } = useLanguage();
  const items = [t.announcement.msg1, t.announcement.msg2];

  // duplicate enough times for seamless marquee
  const loop = [...items, ...items, ...items, ...items, ...items, ...items];

  return (
    <div className="marquee-pause bg-foreground text-background overflow-hidden">
      <div className="flex w-max animate-marquee whitespace-nowrap py-2.5">
        {loop.map((item, i) => (
          <span
            key={i}
            className="mx-8 text-[11px] font-medium uppercase tracking-[0.18em] inline-flex items-center gap-3"
          >
            {item}
            <span className="opacity-40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
