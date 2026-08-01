import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { readContent, writeContent } from "@/lib/content-store";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await readContent());
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, content: await writeContent(await request.json()) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Could not save content." }, { status: 400 });
  }
}
