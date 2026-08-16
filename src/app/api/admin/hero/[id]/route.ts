import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Only these fields may ever be written by the admin. This explicitly excludes
// id, createdAt, updatedAt (and anything else not listed) from ever reaching Prisma.
const EDITABLE_STRING_FIELDS = [
  "image",
  "eyebrow",
  "eyebrowAr",
  "title",
  "titleAr",
  "subtitle",
  "subtitleAr",
  "cta",
  "ctaAr",
  "href",
] as const;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const slideId = Number(id);
  if (!Number.isInteger(slideId) || slideId <= 0) {
    return NextResponse.json({ error: "Invalid slide ID." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const raw = body as Record<string, unknown>;

  const data: Prisma.HeroSlideUpdateInput = {};

  // String fields: only assign if present in the payload; required ones must be non-empty.
  for (const field of EDITABLE_STRING_FIELDS) {
    if (field in raw) {
      const value = raw[field];
      if (typeof value !== "string") {
        return NextResponse.json({ error: `Field "${field}" must be a string.` }, { status: 400 });
      }
      data[field] = value;
    }
  }

  if ("image" in data && !isNonEmptyString(data.image)) {
    return NextResponse.json({ error: "An image is required." }, { status: 400 });
  }
  if ("title" in data && !isNonEmptyString(data.title)) {
    return NextResponse.json({ error: "A title is required." }, { status: 400 });
  }

  if ("order" in raw) {
    const order = Number(raw.order);
    if (!Number.isFinite(order) || !Number.isInteger(order)) {
      return NextResponse.json({ error: "Order must be an integer." }, { status: 400 });
    }
    data.order = order;
  }

  if ("active" in raw) {
    if (typeof raw.active !== "boolean") {
      return NextResponse.json({ error: "Active must be a boolean." }, { status: 400 });
    }
    data.active = raw.active;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  try {
    const slide = await db.heroSlide.update({ where: { id: slideId }, data });
    return NextResponse.json({ slide });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Hero slide not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update hero slide." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const slideId = Number(id);
  if (!Number.isInteger(slideId) || slideId <= 0) {
    return NextResponse.json({ error: "Invalid slide ID." }, { status: 400 });
  }
  try {
    await db.heroSlide.delete({ where: { id: slideId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Hero slide not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete hero slide." }, { status: 500 });
  }
}
