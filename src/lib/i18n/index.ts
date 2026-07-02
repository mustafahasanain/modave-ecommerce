export type Locale = "en" | "ar";

export const locales: Locale[] = ["en", "ar"];

export { en } from "./en";
export { ar } from "./ar";

import { en as enDict } from "./en";
import { ar as arDict } from "./ar";

export const dictionaries = {
  en: enDict,
  ar: arDict,
} as const;

export type Dictionary = typeof enDict;
