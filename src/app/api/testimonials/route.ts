import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const items = await db.testimonial.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  return NextResponse.json({ testimonials: items });
}
