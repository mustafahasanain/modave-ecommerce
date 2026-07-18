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

// en/ar are declared with `as const`, so TS infers literal string types that
// differ between the two dictionaries (e.g. "Home" vs "الرئيسية"). Dictionary
// widens every leaf to `string` so both locales satisfy the same shape.
type DeepWidenStrings<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? DeepWidenStrings<U>[]
    : T extends object
      ? { [K in keyof T]: DeepWidenStrings<T[K]> }
      : T;

export type Dictionary = DeepWidenStrings<typeof enDict>;
