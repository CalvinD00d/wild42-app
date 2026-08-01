import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";

const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "application/pdf"]);

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const file = (await request.formData()).get("file");
    if (!(file instanceof File)) throw new Error("Choose a file to upload.");
    if (!allowed.has(file.type)) throw new Error("Upload a JPG, PNG, WebP, GIF, SVG, or PDF.");
    if (file.size > 10 * 1024 * 1024) throw new Error("The file must be smaller than 10 MB.");
    const extension = path.extname(file.name).toLowerCase() || ".bin";
    const base = path.basename(file.name, extension).replace(/[^a-z0-9-]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "asset";
    const filename = `${base}-${randomUUID().slice(0, 8)}${extension}`;
    const directory = process.env.PORTFOLIO_UPLOAD_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), "public", "uploads");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ ok: true, path: `/uploads/${filename}` });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Upload failed." }, { status: 400 });
  }
}
