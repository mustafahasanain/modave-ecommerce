import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const posts = await db.blogPost.findMany({ orderBy: { id: "desc" } });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const maxRow = await db.blogPost.aggregate({ _max: { id: true } });
  const newId = (maxRow._max.id ?? 0) + 1;
  const post = await db.blogPost.create({
    data: {
      id: newId,
      ...body,
      readTime: Number(body.readTime) || 5,
      status: body.status || "published",
    },
  });
  return NextResponse.json({ post }, { status: 201 });
}
