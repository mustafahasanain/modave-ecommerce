import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseJson, productCreateSchema } from "@/lib/validation";

// GET /api/admin/products — list all products
export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: { id: "asc" },
      take: 1000,
    });
    // Deserialize JSON fields
    const parsed = products.map((p) => ({
      ...p,
      images: JSON.parse(p.images),
      colors: JSON.parse(p.colors),
      sizes: JSON.parse(p.sizes),
    }));
    return NextResponse.json({ products: parsed });
  } catch (e) {
    console.error("GET /api/admin/products error:", e);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST /api/admin/products — create a new product
export async function POST(req: NextRequest) {
  const parsed = await parseJson(req, productCreateSchema);
  if (parsed.error) return parsed.error;
  const body = parsed.data;

  try {
    // Generate a new id inside a transaction so two concurrent creates can't
    // read the same max(id) and collide on the primary key.
    const product = await db.$transaction(async (tx) => {
      const maxRow = await tx.product.aggregate({ _max: { id: true } });
      const newId = (maxRow._max.id ?? 0) + 1;
      const sku = `MDV-${String(Date.now()).slice(-6)}`;

      return tx.product.create({
        data: {
          id: newId,
          name: body.name,
          nameAr: body.nameAr || body.name,
          category: body.category,
          categoryAr: body.categoryAr || body.category,
          price: body.price,
          stock: body.stock,
          status: body.status,
          sku,
          vendor: "Modave",
          description: body.description,
          descriptionAr: body.descriptionAr || body.description,
          images: JSON.stringify(body.images),
          colors: JSON.stringify(body.colors),
          sizes: JSON.stringify(body.sizes),
          rating: 0,
          reviews: 0,
          sold: 0,
        },
      });
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (e) {
    console.error("POST /api/admin/products error:", e);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
