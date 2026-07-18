import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recomputeProductRating } from "@/lib/product-rating";
import { parseJson, reviewStatusSchema } from "@/lib/validation";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const parsed = await parseJson(req, reviewStatusSchema);
  if (parsed.error) return parsed.error;

  const { id } = await params;
  const review = await db.review.update({ where: { id }, data: { status: parsed.data.status } });
  await recomputeProductRating(review.productId);
  return NextResponse.json({ review });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const review = await db.review.delete({ where: { id } });
  await recomputeProductRating(review.productId);
  return NextResponse.json({ success: true });
}
