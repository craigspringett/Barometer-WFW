import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "wfw_admin";

function getSecret(): string {
  return process.env.ADMIN_SECRET || "wfw-dev-secret-change-me";
}

function getPassword(): string {
  return process.env.ADMIN_PASSWORD || "summer2026";
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function buildSessionToken(): string {
  // The token is HMAC(password). Verifying just re-runs the HMAC.
  return sign(getPassword());
}

export function verifyPassword(input: string): boolean {
  const a = Buffer.from(input || "");
  const b = Buffer.from(getPassword());
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function isAuthed(): boolean {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return false;
  const expected = buildSessionToken();
  if (token.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export const SESSION_COOKIE = COOKIE_NAME;
