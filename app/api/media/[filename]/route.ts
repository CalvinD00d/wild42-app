import { readFile } from "node:fs/promises";
import path from "node:path";
import { uploadDirectory } from "@/lib/upload-directory";

const mediaTypes: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  const mime = mediaTypes[path.extname(filename).toLowerCase()];
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(filename) || !mime) {
    return new Response(null, { status: 404 });
  }

  try {
    const bytes = await readFile(path.join(uploadDirectory(), filename));
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": mime,
        "Content-Security-Policy": "sandbox",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return new Response(null, { status: 404 });
  }
}
