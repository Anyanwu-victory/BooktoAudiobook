import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "voxa_admin";
const duration = 60 * 60 * 8;

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("Set ADMIN_SESSION_SECRET to at least 32 random characters.");
  return value;
}

function signature(expires: string): string {
  return createHmac("sha256", secret()).update(expires).digest("hex");
}

export function checkPassword(value: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 12) throw new Error("Set ADMIN_PASSWORD to at least 12 characters.");
  const first = Buffer.from(value);
  const second = Buffer.from(expected);
  return first.length === second.length && timingSafeEqual(first, second);
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return false;
  const [expires, digest] = token.split(".");
  if (!expires || !digest || Number(expires) < Date.now()) return false;
  const actual = Buffer.from(digest, "hex");
  const expected = Buffer.from(signature(expires), "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function signInAdmin(): Promise<void> {
  const expires = String(Date.now() + duration * 1000);
  (await cookies()).set(cookieName, `${expires}.${signature(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: duration,
  });
}

export async function signOutAdmin(): Promise<void> {
  (await cookies()).delete(cookieName);
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(request.url).origin);
}
