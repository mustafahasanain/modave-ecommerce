import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const where = status && status !== "all" ? { status } : {};
  const reviews = await db.review.findMany({ where, orderBy: { createdAt: "desc" } });
  const productIds = [...new Set(reviews.map(r => r.productId))];
  const products = productIds.length > 0 ? await db.product.findMany({ where: { id: { in: productIds } } }) : [];
  const productMap = new Map(products.map(p => [p.id, p.name]));
  return NextResponse.json({ reviews: reviews.map(r => ({ ...r, productName: productMap.get(r.productId) || "Unknown" })) });
}
