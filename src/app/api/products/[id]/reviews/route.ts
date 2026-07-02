import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/products/[id]/reviews — list reviews for a product
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviews = await db.review.findMany({
      where: { productId: Number(id) },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ reviews });
  } catch (e) {
    console.error("GET reviews error:", e);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST /api/products/[id]/reviews — submit a new review
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { author, email, rating, title, body: reviewBody } = body;

    if (!author || !rating || !reviewBody) {
      return NextResponse.json(
        { error: "Missing required fields (author, rating, body)" },
        { status: 400 }
      );
    }
    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
    }

    const review = await db.review.create({
      data: {
        productId: Number(id),
        author: String(author).slice(0, 80),
        email: email ? String(email).slice(0, 120) : null,
        rating: ratingNum,
        title: title ? String(title).slice(0, 120) : null,
        body: String(reviewBody).slice(0, 1000),
        verified: false,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (e) {
    console.error("POST review error:", e);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
