import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const posts = await db.blogPost.findMany({ where: { status: "published" }, orderBy: { date: "desc" } });
  return NextResponse.json({ posts });
}
