"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Ruler } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useEffect, useState } from "react";

const fallbackData = [
  { size: "S", chest: "84-88", waist: "64-68", hips: "90-94" },
  { size: "M", chest: "88-92", waist: "68-72", hips: "94-98" },
  { size: "L", chest: "92-96", waist: "72-76", hips: "98-102" },
  { size: "XL", chest: "96-102", waist: "76-82", hips: "102-108" },
  { size: "XXL", chest: "102-108", waist: "82-88", hips: "108-114" },
];

interface SizeGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SizeGuideDialog({ open, onOpenChange }: SizeGuideDialogProps) {
  const { t, locale } = useLanguage();
  const { settings } = useSiteSettings();
  const ar = locale === "ar";

  let sizeData = fallbackData;
  try {
    const parsed = JSON.parse(settings.sizeGuide || "[]");
    if (Array.isArray(parsed) && parsed.length > 0) sizeData = parsed;
  } catch {}

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onOpenChange(false); };
      window.addEventListener("keydown", onKey);
      return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
    }
    document.body.style.overflow = "";
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)} className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }} className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-background shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              <button onClick={() => onOpenChange(false)} className="absolute end-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur transition-colors hover:bg-foreground hover:text-background" aria-label={t.common.close}>
                <X className="h-5 w-5" />
              </button>
              <div className="custom-scroll max-h-[90vh] overflow-y-auto p-6 sm:p-8">
                <div className="flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-muted-foreground" />
                  <h2 className="font-display text-2xl font-semibold tracking-tight">{t.product.sizeGuideTitle}</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{t.product.sizeGuideDesc}</p>
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-3 text-start font-semibold uppercase tracking-wide">{t.product.sizeCol}</th>
                        <th className="py-3 text-start font-semibold uppercase tracking-wide">{t.product.chestCol} (cm)</th>
                        <th className="py-3 text-start font-semibold uppercase tracking-wide">{t.product.waistCol} (cm)</th>
                        <th className="py-3 text-start font-semibold uppercase tracking-wide">{t.product.hipsCol} (cm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizeData.map((row: { size: string; chest: string; waist: string; hips: string }, i: number) => (
                        <tr key={row.size} className={`border-b border-border/60 ${i % 2 === 1 ? "bg-secondary/30" : ""}`}>
                          <td className="py-3 font-semibold">{row.size}</td>
                          <td className="py-3 text-muted-foreground">{row.chest}</td>
                          <td className="py-3 text-muted-foreground">{row.waist}</td>
                          <td className="py-3 text-muted-foreground">{row.hips}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide">{t.product.howToMeasure}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2"><span className="font-semibold text-foreground">1.</span><span>{ar ? "الصدر: قس حول أوسع جزء من الصدر مع إبقاء شريط القياس أفقياً." : "Chest: measure around the fullest part of your chest, keeping the tape level."}</span></li>
                    <li className="flex gap-2"><span className="font-semibold text-foreground">2.</span><span>{ar ? "الخصر: قس حول أضيق جزء من الخصر الطبيعي." : "Waist: measure around your natural waistline."}</span></li>
                    <li className="flex gap-2"><span className="font-semibold text-foreground">3.</span><span>{ar ? "الورك: قس حول أوسع جزء من الوركين." : "Hips: measure around the fullest part of your hips."}</span></li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
