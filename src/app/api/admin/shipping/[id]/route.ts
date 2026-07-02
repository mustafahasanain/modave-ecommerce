import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const item = await db.shippingOption.update({ where: { id: Number(id) }, data: body });
  return NextResponse.json({ option: item });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.shippingOption.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
