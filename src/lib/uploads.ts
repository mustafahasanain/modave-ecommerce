import path from "path";

/**
 * Where admin-uploaded images live on disk.
 *
 * Deliberately NOT `public/`. Next's production router snapshots the contents
 * of `public/` into an in-memory set once at boot (see `setupFsCheck`), so a
 * file written there at runtime keeps 404ing until the server restarts. On top
 * of that, `output: "standalone"` makes the served public dir
 * `.next/standalone/public`, which `next build` regenerates — anything written
 * inside it is destroyed on the next deploy.
 *
 * Files here are served by the route handler at `src/app/uploads/[...segments]`.
 *
 * In standalone production the process chdirs into `.next/standalone`, so set
 * UPLOADS_DIR to an absolute path on a persistent volume when deploying.
 */
export const UPLOADS_DIRECTORY = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.resolve(process.cwd(), "uploads");

/** Images uploaded before uploads moved out of `public/` still resolve here. */
export const LEGACY_UPLOADS_DIRECTORY = path.resolve(process.cwd(), "public", "uploads");

/** Accepted upload MIME types, mapped to the extension we store them under. */
export const UPLOAD_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** Extension → Content-Type, used when serving a stored file back. */
export const UPLOAD_CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

/**
 * Stored names are `<uuid>.<ext>`. Anything else — path separators, traversal
 * segments, unexpected extensions — is rejected before it reaches the disk.
 */
const STORED_FILENAME = /^[A-Za-z0-9][A-Za-z0-9._-]*\.(jpg|jpeg|png|webp|gif)$/;

export function isSafeUploadFilename(name: string): boolean {
  return STORED_FILENAME.test(name) && !name.includes("..");
}
