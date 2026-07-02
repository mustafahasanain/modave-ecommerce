import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const slides = await db.heroSlide.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ slides });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const slide = await db.heroSlide.create({ data: body });
  return NextResponse.json({ slide }, { status: 201 });
}
