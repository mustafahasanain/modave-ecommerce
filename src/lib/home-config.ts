/** Shared, database-backed homepage configuration. */

export const HOME_SECTION_KEYS = [
  "hero", "announcement", "exploreCollections", "newArrivals",
  "collectionBanner", "bestSellers", "promoBanner", "features",
  "brandStory", "testimonials", "instagramFeed",
] as const;

export type HomeSectionKey = (typeof HOME_SECTION_KEYS)[number];

export const HOME_SECTION_LABELS: Record<HomeSectionKey, { en: string; ar: string }> = {
  hero: { en: "Hero carousel", ar: "السلايدر الرئيسي" },
  announcement: { en: "Announcement marquee", ar: "شريط الإعلانات" },
  exploreCollections: { en: "Collections", ar: "الكلكشنز" },
  newArrivals: { en: "New arrivals", ar: "وصل حديثاً" },
  collectionBanner: { en: "Collection banners", ar: "بنرات الكلكشن" },
  bestSellers: { en: "Best sellers", ar: "الأكثر مبيعاً" },
  promoBanner: { en: "Promotion banner", ar: "بنر العرض" },
  features: { en: "Store features", ar: "مميزات المتجر" },
  brandStory: { en: "Brand story", ar: "قصة العلامة" },
  testimonials: { en: "Testimonials", ar: "آراء العملاء" },
  instagramFeed: { en: "Instagram feed", ar: "انستغرام" },
};

export type LocalizedText = { en: string; ar: string };
export type HomeContentKey =
  | "exploreTitle" | "collectionsCta" | "newArrivalsTitle" | "newArrivalsDescription"
  | "bestSellersTitle" | "bestSellersDescription" | "collectionLeftTitle"
  | "collectionRightTitle" | "collectionDiscount" | "collectionCta"
  | "promoTitle1" | "promoTitle2" | "promoSubtitle" | "promoCta"
  | "brandEyebrow" | "brandTitle" | "brandBody" | "brandStatLabel"
  | "brandFeature1Title" | "brandFeature1Description" | "brandFeature2Title"
  | "brandFeature2Description" | "brandFeature3Title" | "brandFeature3Description"
  | "brandCta" | "feature1Title" | "feature1Description" | "feature2Title"
  | "feature2Description" | "feature3Title" | "feature3Description"
  | "feature4Title" | "feature4Description" | "testimonialsTitle"
  | "testimonialsSubtitle" | "instagramTitle" | "instagramSubtitle";
export type HomeImageKey =
  | "collectionLeft" | "collectionCenter" | "collectionRight"
  | "promoLeft" | "promoRight" | "brandStory";

export interface HomeConfig {
  sections: Record<HomeSectionKey, boolean>;
  collections: number[];
  testimonials: number[];
  content: Record<HomeContentKey, LocalizedText>;
  images: Record<HomeImageKey, string>;
  links: { collections: string; collectionBanner: string; promo: string };
  brandStat: string;
}

export const DEFAULT_HOME_CONFIG: HomeConfig = {
  sections: HOME_SECTION_KEYS.reduce(
    (acc, key) => ({ ...acc, [key]: true }),
    {} as Record<HomeSectionKey, boolean>,
  ),
  collections: [], testimonials: [],
  content: {
    exploreTitle: { en: "Explore Collections", ar: "استكشف المجموعات" },
    collectionsCta: { en: "View All Collections", ar: "عرض كل المجموعات" },
    newArrivalsTitle: { en: "Today's Top Picks", ar: "وصل حديثاً" },
    newArrivalsDescription: { en: "Fresh styles just in! Elevate your look.", ar: "تسوق أفضل اختياراتنا" },
    bestSellersTitle: { en: "Best Sellers", ar: "الأكثر مبيعاً" },
    bestSellersDescription: { en: "Reserved for special occasions", ar: "مخصصة للمناسبات الخاصة" },
    collectionLeftTitle: { en: "Capsule Collection", ar: "مجموعة كبسولة" },
    collectionRightTitle: { en: "Crossbody Bag", ar: "حقيبة كروسبودي" },
    collectionDiscount: { en: "Up to 40% off", ar: "خصم حتى 40%" },
    collectionCta: { en: "Shop Collection", ar: "تسوق المجموعة" },
    promoTitle1: { en: "Special Offer!", ar: "عرض خاص!" },
    promoTitle2: { en: "This Week Only", ar: "هذا الأسبوع فقط" },
    promoSubtitle: { en: "Reserved for special occasions", ar: "مخصص للمناسبات الخاصة" },
    promoCta: { en: "Explore Collection", ar: "استكشف المجموعة" },
    brandEyebrow: { en: "Our Philosophy", ar: "فلسفتنا" },
    brandTitle: { en: "Considered design, made to last", ar: "أناقة مدروسة، مصنوعة لتدوم" },
    brandBody: {
      en: "At Modave, we believe true elegance lives in the details. Every piece is thoughtfully crafted from responsibly sourced materials, designed to transcend seasons and become a wardrobe favourite.",
      ar: "في موديف، نؤمن بأن الأناقة الحقيقية تكمن في التفاصيل. كل قطعة مصممة بعناية من أجود الخامات، لتمنحك إطلالة خالدة تتجاوز الموسم.",
    },
    brandStatLabel: { en: "Years of craft", ar: "سنوات من الحرفية" },
    brandFeature1Title: { en: "Premium fabrics", ar: "خامات فاخرة" },
    brandFeature1Description: { en: "Hand-selected", ar: "مختارة بعناية" },
    brandFeature2Title: { en: "Timeless design", ar: "تصميم خالد" },
    brandFeature2Description: { en: "Beyond trends", ar: "يتجاوز الموضة" },
    brandFeature3Title: { en: "Responsible making", ar: "إنتاج مسؤول" },
    brandFeature3Description: { en: "Lower impact", ar: "بأثر أقل" },
    brandCta: { en: "Discover the edit", ar: "اكتشف المجموعة" },
    feature1Title: { en: "14-Day Returns", ar: "إرجاع خلال 14 يوماً" },
    feature1Description: { en: "Risk-free shopping with easy returns.", ar: "تسوق بدون مخاطر مع إرجاع سهل." },
    feature2Title: { en: "Free Shipping", ar: "شحن مجاني" },
    feature2Description: { en: "No extra costs, just the price you see.", ar: "بدون تكاليف إضافية، فقط السعر الذي تراه." },
    feature3Title: { en: "24/7 Support", ar: "دعم 24/7" },
    feature3Description: { en: "Always here when you need us.", ar: "دعم على مدار الساعة، دائماً هنا من أجلك." },
    feature4Title: { en: "Member Discounts", ar: "خصومات الأعضاء" },
    feature4Description: { en: "Special prices for loyal customers.", ar: "أسعار خاصة لعملائنا المخلصين." },
    testimonialsTitle: { en: "Customer Say!", ar: "آراء عملائنا!" },
    testimonialsSubtitle: {
      en: "Our customers adore our products, and we constantly aim to delight them.",
      ar: "عملاؤنا يعشقون منتجاتنا، ونسعى دائماً لإسعادهم.",
    },
    instagramTitle: { en: "Shop Instagram", ar: "متجر انستغرام" },
    instagramSubtitle: { en: "Elevate your wardrobe with fresh finds today!", ar: "جددي خزانة ملابسك باقتناء قطع جديدة اليوم!" },
  },
  images: {
    collectionLeft: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900&q=80",
    collectionCenter: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80",
    collectionRight: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80",
    promoLeft: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=900&q=80",
    promoRight: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&q=80",
    brandStory: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80",
  },
  links: { collections: "/collections", collectionBanner: "/shop", promo: "/shop" },
  brandStat: "12+",
};

function toIdArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((x): x is number => typeof x === "number" && Number.isInteger(x)))];
}

export function parseHomeConfig(raw: unknown): HomeConfig {
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    if (!raw.trim()) return DEFAULT_HOME_CONFIG;
    try { parsed = JSON.parse(raw); } catch { return DEFAULT_HOME_CONFIG; }
  }
  if (!parsed || typeof parsed !== "object") return DEFAULT_HOME_CONFIG;
  const obj = parsed as Partial<HomeConfig>;
  const sections = { ...DEFAULT_HOME_CONFIG.sections };
  if (obj.sections && typeof obj.sections === "object") {
    for (const key of HOME_SECTION_KEYS) {
      if (typeof obj.sections[key] === "boolean") sections[key] = obj.sections[key];
    }
  }
  const content = { ...DEFAULT_HOME_CONFIG.content };
  if (obj.content && typeof obj.content === "object") {
    for (const key of Object.keys(content) as HomeContentKey[]) {
      const value = obj.content[key];
      if (!value || typeof value !== "object") continue;
      content[key] = {
        en: typeof value.en === "string" ? value.en : content[key].en,
        ar: typeof value.ar === "string" ? value.ar : content[key].ar,
      };
    }
  }
  const images = { ...DEFAULT_HOME_CONFIG.images };
  if (obj.images && typeof obj.images === "object") {
    for (const key of Object.keys(images) as HomeImageKey[]) {
      if (typeof obj.images[key] === "string") images[key] = obj.images[key];
    }
  }
  return {
    sections,
    collections: toIdArray(obj.collections),
    testimonials: toIdArray(obj.testimonials),
    content, images,
    links: {
      collections: typeof obj.links?.collections === "string" ? obj.links.collections : DEFAULT_HOME_CONFIG.links.collections,
      collectionBanner: typeof obj.links?.collectionBanner === "string" ? obj.links.collectionBanner : DEFAULT_HOME_CONFIG.links.collectionBanner,
      promo: typeof obj.links?.promo === "string" ? obj.links.promo : DEFAULT_HOME_CONFIG.links.promo,
    },
    brandStat: typeof obj.brandStat === "string" ? obj.brandStat : DEFAULT_HOME_CONFIG.brandStat,
  };
}

export function pickOrdered<T>(items: T[], ids: number[], getId: (item: T) => number | undefined, max = Infinity): T[] {
  if (!ids.length) return [];
  const byId = new Map<number, T>();
  for (const item of items) {
    const id = getId(item);
    if (typeof id === "number") byId.set(id, item);
  }
  return ids.map((id) => byId.get(id)).filter((item): item is T => Boolean(item)).slice(0, max);
}
