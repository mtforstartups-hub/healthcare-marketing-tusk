import { cookies } from "next/headers";
import { execute, queryRow } from "../../../../db";
import {
  createSessionToken,
  OWNER_COOKIE,
  ownerCookieOptions,
  sessionSecret,
} from "../../../../lib/auth";
import { json, validOrigin } from "../../../../lib/intake";
import { hash, sameSignature } from "../../../../lib/security";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") || "local";
}

export async function POST(request: Request) {
  if (!validOrigin(request))
    return json({ error: "Please sign in from this website." }, 403);

  const expected = process.env.ADMIN_PASSWORD;
  const secret = sessionSecret();
  if (!expected || !secret)
    return json({ error: "Owner sign-in is not configured." }, 503);

  try {
    const body = (await request.json()) as { password?: unknown };
    if (
      typeof body.password !== "string" ||
      body.password.length === 0 ||
      body.password.length > 200
    )
      return json({ error: "Enter the owner password." }, 400);

    // Basic online-guessing protection, keyed by a private digest of the IP.
    try {
      const windowStart = Math.floor(Date.now() / WINDOW_MS);
      const limitKey = await hash(
        "owner-login:" + clientIp(request) + ":" + windowStart,
      );
      const windowEnd = (windowStart + 1) * WINDOW_MS;
      await execute(
        "INSERT INTO rate_limits (limit_key, `count`, expires_at) VALUES (?, 1, ?) " +
          "ON DUPLICATE KEY UPDATE `count` = IF(expires_at < ?, 1, `count` + 1), expires_at = IF(expires_at < ?, ?, expires_at)",
        [limitKey, windowEnd, Date.now(), Date.now(), windowEnd],
      );
      const rate = await queryRow<{ count: number }>(
        "SELECT `count` FROM rate_limits WHERE limit_key = ? LIMIT 1",
        [limitKey],
      );
      if ((rate?.count || 0) > MAX_ATTEMPTS)
        return json(
          {
            error:
              "Too many sign-in attempts. Please wait ten minutes and try again.",
          },
          429,
        );
    } catch {
      // The database is required for the inbox anyway; do not block sign-in
      // on a transient rate-limit lookup failure.
    }

    const matches = sameSignature(
      await hash(body.password),
      await hash(expected),
    );
    if (!matches)
      return json({ error: "That password is not correct." }, 401);

    const token = await createSessionToken(secret);
    const store = await cookies();
    store.set(OWNER_COOKIE, token, ownerCookieOptions);

    return json({ ok: true });
  } catch {
    return json({ error: "Sign-in is unavailable. Please try again." }, 503);
  }
}
