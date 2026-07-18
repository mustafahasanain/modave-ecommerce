import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseJson, productUpdateSchema } from "@/lib/validation";

// GET /api/admin/products/[id] — single product
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.product.findUnique({ where: { id: Number(id) } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({
      product: {
        ...product,
        images: JSON.parse(product.images),
        colors: JSON.parse(product.colors),
        sizes: JSON.parse(product.sizes),
      },
    });
  } catch (e) {
    console.error("GET product error:", e);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// PUT /api/admin/products/[id] — update a product
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const parsed = await parseJson(req, productUpdateSchema);
  if (parsed.error) return parsed.error;
  const body = parsed.data;

  try {
    const { id } = await params;
    const update: Record<string, unknown> = {};
    if (body.name != null) update.name = body.name;
    if (body.nameAr != null) update.nameAr = body.nameAr;
    if (body.category != null) update.category = body.category;
    if (body.categoryAr != null) update.categoryAr = body.categoryAr;
    if (body.price != null) update.price = body.price;
    if (body.stock != null) update.stock = body.stock;
    if (body.status != null) update.status = body.status;
    if (body.description != null) update.description = body.description;
    if (body.descriptionAr != null) update.descriptionAr = body.descriptionAr;
    if (body.images != null) update.images = JSON.stringify(body.images);
    if (body.colors != null) update.colors = JSON.stringify(body.colors);
    if (body.sizes != null) update.sizes = JSON.stringify(body.sizes);
    if (body.discount != null) update.discount = body.discount;
    if (body.featured != null) update.featured = body.featured;
    if (body.bestSeller != null) update.bestSeller = body.bestSeller;
    if (body.newArrival != null) update.newArrival = body.newArrival;

    const product = await db.product.update({
      where: { id: Number(id) },
      data: update,
    });
    return NextResponse.json({ product });
  } catch (e) {
    console.error("PUT product error:", e);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] — delete a product
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.product.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE product error:", e);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
