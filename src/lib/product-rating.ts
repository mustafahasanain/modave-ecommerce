import { db } from "@/lib/db";

/** Recomputes a product's aggregate rating/review count from its approved reviews. */
export async function recomputeProductRating(productId: number): Promise<void> {
  const approved = await db.review.findMany({
    where: { productId, status: "approved" },
    select: { rating: true },
  });
  const reviews = approved.length;
  const rating = reviews > 0 ? approved.reduce((sum, r) => sum + r.rating, 0) / reviews : 0;
  await db.product.update({
    where: { id: productId },
    data: { rating: Math.round(rating * 10) / 10, reviews },
  });
}
