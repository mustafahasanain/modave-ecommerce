import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const settings = await db.siteSetting.findMany();
  const obj: Record<string, string> = {};
  for (const s of settings) obj[s.key] = s.value;
  return NextResponse.json({ settings: obj });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  for (const [key, value] of Object.entries(body)) {
    const existing = await db.siteSetting.findUnique({ where: { key } });
    if (existing) {
      await db.siteSetting.update({ where: { key }, data: { value: String(value) } });
    } else {
      await db.siteSetting.create({ data: { key, value: String(value) } });
    }
  }
  return NextResponse.json({ success: true });
}
