import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { parseJson, reviewCreateSchema } from "@/lib/validation";

// GET /api/products/[id]/reviews — list approved reviews for a product
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviews = await db.review.findMany({
      where: { productId: Number(id), status: "approved" },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ reviews });
  } catch (e) {
    console.error("GET reviews error:", e);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST /api/products/[id]/reviews — submit a new review (goes to moderation queue)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!rateLimit(`review-submit:${getClientIp(req)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many reviews submitted. Try again later." },
      { status: 429 }
    );
  }

  const parsed = await parseJson(req, reviewCreateSchema);
  if (parsed.error) return parsed.error;
  const { author, email, rating, title, body: reviewBody } = parsed.data;

  try {
    const { id } = await params;
    const productId = Number(id);
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // A review counts as "verified" if this email has a paid order that
    // included this product.
    let verified = false;
    if (email) {
      const orders = await db.order.findMany({
        where: { customerEmail: email.toLowerCase(), status: "paid" },
        select: { items: true },
      });
      verified = orders.some((order) => {
        try {
          const items: { id: number }[] = JSON.parse(order.items);
          return items.some((item) => item.id === productId);
        } catch {
          return false;
        }
      });
    }

    const review = await db.review.create({
      data: {
        productId,
        author,
        email: email || null,
        rating,
        title: title || null,
        body: reviewBody,
        verified,
        status: "pending",
      },
    });

    return NextResponse.json(
      { review, message: "Thanks! Your review will appear after moderation." },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST review error:", e);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
