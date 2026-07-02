import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/admin/products — list all products
export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: { id: "asc" },
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
  try {
    const body = await req.json();
    const {
      name,
      nameAr,
      category,
      categoryAr,
      price,
      stock,
      status,
    } = body;

    if (!name || !category || price == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate a new id (max + 1)
    const maxRow = await db.product.aggregate({ _max: { id: true } });
    const newId = (maxRow._max.id ?? 0) + 1;
    const sku = `MDV-${String(Date.now()).slice(-6)}`;

    const product = await db.product.create({
      data: {
        id: newId,
        name,
        nameAr: nameAr || name,
        category,
        categoryAr: categoryAr || category,
        price: Number(price),
        stock: Number(stock) || 0,
        status: status || "active",
        sku,
        vendor: "Modave",
        description: body.description || "",
        descriptionAr: body.descriptionAr || body.description || "",
        images: JSON.stringify(body.images || []),
        colors: JSON.stringify(body.colors || []),
        sizes: JSON.stringify(body.sizes || []),
        rating: 0,
        reviews: 0,
        sold: 0,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (e) {
    console.error("POST /api/admin/products error:", e);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
