import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const items = await db.testimonial.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ testimonials: items });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = await db.testimonial.create({ data: body });
  return NextResponse.json({ testimonial: item }, { status: 201 });
}
