import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/products — list all active products (public)
// Optional query params: ?category=Clothing&featured=true
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const where: Record<string, unknown> = { status: "active" };
    if (category) where.category = category;
    if (featured === "true") where.featured = true;

    const products = await db.product.findMany({
      where,
      orderBy: { id: "asc" },
      take: 1000,
    });

    const parsed = products.map((p) => ({
      ...p,
      images: JSON.parse(p.images),
      colors: JSON.parse(p.colors),
      sizes: JSON.parse(p.sizes),
    }));

    return NextResponse.json({ products: parsed });
  } catch (e) {
    console.error("GET /api/products error:", e);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
