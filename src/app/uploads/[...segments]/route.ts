import { readFile, stat } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import {
  LEGACY_UPLOADS_DIRECTORY,
  UPLOADS_DIRECTORY,
  UPLOAD_CONTENT_TYPES,
  isSafeUploadFilename,
} from "@/lib/uploads";

export const runtime = "nodejs";
// Uploads appear after the build, so this must never be prerendered or cached
// as a static route — resolve every request against the disk.
export const dynamic = "force-dynamic";

// GET /uploads/<filename> — serve an admin-uploaded image. Next's production
// router only knows about files that existed in public/ at boot, so uploads are
// served here instead of relying on static file handling.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ segments: string[] }> }
) {
  const { segments } = await params;

  // Stored uploads are always a single flat filename; nested paths are bogus.
  if (segments.length !== 1 || !isSafeUploadFilename(segments[0])) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filename = segments[0];
  const extension = filename.split(".").pop()!.toLowerCase();

  for (const directory of [UPLOADS_DIRECTORY, LEGACY_UPLOADS_DIRECTORY]) {
    const filePath = path.join(directory, filename);
    // Defence in depth: the filename is already validated, but never read
    // outside the directory we intended to read from.
    if (path.dirname(filePath) !== directory) continue;

    try {
      const info = await stat(filePath);
      if (!info.isFile()) continue;

      const file = await readFile(filePath);
      return new NextResponse(file, {
        headers: {
          "Content-Type": UPLOAD_CONTENT_TYPES[extension] ?? "application/octet-stream",
          "Content-Length": String(info.size),
          // Filenames are content-addressed by UUID, so a stored file never
          // changes identity and can be cached hard.
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === "ENOENT" || code === "ENOTDIR") continue;
      console.error("Failed to serve upload:", error);
      return new NextResponse("Unable to read the image.", { status: 500 });
    }
  }

  return new NextResponse("Not found", { status: 404 });
}
