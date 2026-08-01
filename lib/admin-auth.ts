import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "portfolio_admin";

function secret() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function signature(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function createAdminToken() {
  const expires = Date.now() + 1000 * 60 * 60 * 12;
  return `${expires}.${signature(String(expires))}`;
}

export function verifyAdminToken(token?: string) {
  if (!token || !secret()) return false;
  const [expires, supplied] = token.split(".");
  if (!expires || !supplied || Number(expires) < Date.now()) return false;
  const expected = signature(expires);
  if (supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

export async function isAdmin() {
  return verifyAdminToken((await cookies()).get(ADMIN_COOKIE)?.value);
}
