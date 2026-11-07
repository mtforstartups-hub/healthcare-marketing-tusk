import { cookies } from "next/headers";
import { sameSignature, sign } from "./security";

export const OWNER_COOKIE = "mth_owner";
export const OWNER_COOKIE_MAX_AGE = 60 * 60 * 12; // 12 hours
const SESSION_VERSION = "v1";
const SESSION_CONTEXT = "mth-owner-session";

export function sessionSecret(): string | null {
  const authSecret = process.env.AUTH_SECRET;
  if (authSecret && authSecret.length >= 32) return authSecret;
  const intakeKey = process.env.INTAKE_ENCRYPTION_KEY;
  return intakeKey && intakeKey.length >= 32 ? intakeKey : null;
}

export async function createSessionToken(secret = sessionSecret()) {
  if (!secret) throw new Error("AUTH_SECRET is not configured.");
  const expiresAt = Date.now() + OWNER_COOKIE_MAX_AGE * 1000;
  const payload = `${SESSION_VERSION}.${expiresAt}`;
  const signature = await sign(`${SESSION_CONTEXT}.${payload}`, secret);
  return `${payload}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret = sessionSecret(),
) {
  if (!secret || !token) return false;

  const [version, expires, signature] = token.split(".");
  if (version !== SESSION_VERSION || !expires || !signature) return false;

  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;

  const expected = await sign(
    `${SESSION_CONTEXT}.${version}.${expires}`,
    secret,
  );
  return sameSignature(signature, expected);
}

/** True when the current request carries a valid owner session cookie. */
export async function isOwner() {
  const store = await cookies();
  return verifySessionToken(store.get(OWNER_COOKIE)?.value);
}

export const ownerCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: OWNER_COOKIE_MAX_AGE,
};
