/**
 * Pure discount-computation helpers shared by the cart and checkout pages.
 *
 * These replace the previously hardcoded coupon/discount logic:
 *   - `if (coupon === "MODEVE10") return subtotal * 0.1;`
 *   - `if (subtotal >= 200) return Math.min(subtotal * 0.1, 80);`
 *
 * Coupons now come from `/api/coupons` (managed in the admin dashboard) and
 * the auto-discount threshold / percentage / cap come from `/api/settings`.
 */

export interface CouponLike {
  code: string;
  /** "percentage" (value = percent, e.g. 10 = 10%) or "fixed" (value = flat amount). */
  type: string;
  value: number;
}

/**
 * Compute the discount applied by a coupon code.
 *
 * @param coupons  Active coupons from `/api/coupons`.
 * @param code     The code the user applied (case-insensitive match).
 * @param subtotal Cart subtotal before discount.
 * @returns        Discount amount (0 if no match / invalid).
 */
export function computeCouponDiscount(
  coupons: CouponLike[],
  code: string | null,
  subtotal: number
): number {
  if (!code) return 0;
  const upper = code.toUpperCase();
  const coupon = coupons.find((c) => c.code.toUpperCase() === upper);
  if (!coupon) return 0;
  if (coupon.type === "percentage") {
    return subtotal * (coupon.value / 100);
  }
  // Fixed-amount coupon
  return Math.min(coupon.value, subtotal);
}

/**
 * Compute the automatic cart discount from site settings.
 *
 * Reads three setting keys (all optional, with sensible defaults):
 *   - `discountThreshold`   (default 200)  — minimum subtotal to qualify.
 *   - `discountPercentage`  (default 10)   — percent off once threshold met.
 *   - `maxDiscount`         (default 80)   — hard cap on the discount amount.
 *
 * @returns 0 if subtotal is below the threshold, otherwise `min(subtotal * pct/100, max)`.
 */
export function computeAutoDiscount(
  settings: Record<string, string>,
  subtotal: number
): number {
  const threshold = Number(settings.discountThreshold) || 200;
  const pct = Number(settings.discountPercentage) || 10;
  const max = Number(settings.maxDiscount) || 80;
  if (subtotal < threshold) return 0;
  return Math.min(subtotal * (pct / 100), max);
}

/**
 * Compute the total cart discount, applying whichever of the coupon or
 * auto-discount yields a value. A valid applied coupon takes precedence
 * (mirrors the original `if (coupon === ...) return ...;` precedence).
 *
 * @returns The discount amount (always >= 0 and <= subtotal).
 */
export function computeTotalDiscount(
  coupons: CouponLike[],
  code: string | null,
  settings: Record<string, string>,
  subtotal: number
): number {
  const couponDiscount = computeCouponDiscount(coupons, code, subtotal);
  if (couponDiscount > 0) return Math.min(couponDiscount, subtotal);
  return Math.min(computeAutoDiscount(settings, subtotal), subtotal);
}

/**
 * Read the free-shipping threshold from site settings (default 70).
 */
export function getFreeShipThreshold(settings: Record<string, string>): number {
  return Number(settings.freeShipThreshold) || 70;
}

/**
 * Read the cart-expiry countdown duration (in minutes) from site settings
 * (default 15 — matches the original `14 * 60 + 59` ~15 min behaviour).
 */
export function getCartCountdownMinutes(settings: Record<string, string>): number {
  return Number(settings.cartCountdownMinutes) || 15;
}
