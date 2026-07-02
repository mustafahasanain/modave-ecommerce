import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const item = await db.testimonial.update({ where: { id: Number(id) }, data: body });
  return NextResponse.json({ testimonial: item });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.testimonial.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
