/**
 * Homepage Content Control — shared config shape + safe parsing.
 *
 * Stored as a single JSON blob under the `homeConfig` key in the existing
 * `SiteSetting` key/value table (see `/api/admin/settings`). Kept in one
 * small module so both the admin Settings page and the storefront homepage
 * read/write the exact same shape.
 *
 * Parsing is defensive: any missing/invalid data falls back to
 * `DEFAULT_HOME_CONFIG` (everything visible, no explicit selections) so the
 * storefront never hides content because of a bad or absent setting.
 */

export const HOME_SECTION_KEYS = [
  "hero",
  "announcement",
  "exploreCollections",
  "newArrivals",
  "collectionBanner",
  "bestSellers",
  "promoBanner",
  "features",
  "brandStory",
  "testimonials",
  "instagramFeed",
] as const;

export type HomeSectionKey = (typeof HOME_SECTION_KEYS)[number];

export const HOME_SECTION_LABELS: Record<HomeSectionKey, string> = {
  hero: "Hero",
  announcement: "Announcement / Marquee",
  exploreCollections: "Explore Collections",
  newArrivals: "New Arrivals",
  collectionBanner: "Collection Banner",
  bestSellers: "Best Sellers",
  promoBanner: "Promo Banner",
  features: "Features",
  brandStory: "Brand Story / Editorial",
  testimonials: "Testimonials / Customer Reviews",
  instagramFeed: "Instagram Feed",
};

export interface HomeConfig {
  sections: Record<HomeSectionKey, boolean>;
  collections: number[];
  bestSellers: number[];
  newArrivals: number[];
  testimonials: number[];
}

export const DEFAULT_HOME_CONFIG: HomeConfig = {
  sections: HOME_SECTION_KEYS.reduce(
    (acc, key) => ({ ...acc, [key]: true }),
    {} as Record<HomeSectionKey, boolean>,
  ),
  collections: [],
  bestSellers: [],
  newArrivals: [],
  testimonials: [],
};

function toIdArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is number => typeof x === "number" && Number.isFinite(x));
}

/**
 * Safely parses the `homeConfig` SiteSetting value. Accepts the raw string
 * (as stored), an already-parsed object, undefined/null, or garbage —
 * anything that doesn't validate falls back to `DEFAULT_HOME_CONFIG` rather
 * than hiding homepage content.
 */
export function parseHomeConfig(raw: unknown): HomeConfig {
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    if (!raw.trim()) return DEFAULT_HOME_CONFIG;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return DEFAULT_HOME_CONFIG;
    }
  }
  if (!parsed || typeof parsed !== "object") return DEFAULT_HOME_CONFIG;

  const obj = parsed as Record<string, unknown>;
  const sections = { ...DEFAULT_HOME_CONFIG.sections };
  if (obj.sections && typeof obj.sections === "object") {
    const rawSections = obj.sections as Record<string, unknown>;
    for (const key of HOME_SECTION_KEYS) {
      if (typeof rawSections[key] === "boolean") sections[key] = rawSections[key] as boolean;
    }
  }

  return {
    sections,
    collections: toIdArray(obj.collections),
    bestSellers: toIdArray(obj.bestSellers),
    newArrivals: toIdArray(obj.newArrivals),
    testimonials: toIdArray(obj.testimonials),
  };
}

/**
 * Orders `items` according to `ids` (dropping ids that no longer resolve to
 * an item — e.g. a deleted product/category/testimonial), capped at `max`.
 * Returns an empty array when `ids` is empty or nothing resolves, so callers
 * can fall back to their existing default behavior.
 */
export function pickOrdered<T>(
  items: T[],
  ids: number[],
  getId: (item: T) => number | undefined,
  max: number = Infinity,
): T[] {
  if (!ids.length) return [];
  const byId = new Map<number, T>();
  for (const item of items) {
    const id = getId(item);
    if (typeof id === "number") byId.set(id, item);
  }
  const picked: T[] = [];
  for (const id of ids) {
    const item = byId.get(id);
    if (item) picked.push(item);
    if (picked.length >= max) break;
  }
  return picked;
}
