import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { UPLOADS_DIRECTORY, UPLOAD_EXTENSIONS } from "@/lib/uploads";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

// POST /api/admin/uploads — store one admin-selected image outside public/ and
// return the /uploads/<name> URL that the serving route handler resolves.
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    }
    if (!UPLOAD_EXTENSIONS[file.type]) {
      return NextResponse.json({ error: "Only JPG, PNG, WebP, and GIF images are allowed." }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Images must be smaller than 5 MB." }, { status: 400 });
    }

    const filename = `${randomUUID()}.${UPLOAD_EXTENSIONS[file.type]}`;
    await mkdir(UPLOADS_DIRECTORY, { recursive: true });
    await writeFile(path.join(UPLOADS_DIRECTORY, filename), Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch (error) {
    console.error("Image upload failed:", error);
    return NextResponse.json({ error: "Unable to upload the image." }, { status: 500 });
  }
}
