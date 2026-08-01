import { NextResponse } from "next/server";
import { ADMIN_COOKIE, createAdminToken } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({ password: "" }));
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, error: "Incorrect password." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, createAdminToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/",
  });
  return response;
}
