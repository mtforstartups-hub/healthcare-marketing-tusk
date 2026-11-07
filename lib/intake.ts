import { execute, isDuplicateKeyError, queryRow, transaction } from "../db";
import { validateIntake, ValidationError, type Kind } from "./intake-core";
import { sealPayload, hash, sign } from "./security";
import registry from "../content/resource-files.json";

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: JSON_HEADERS });
}

export function validOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return (
    !!origin &&
    origin === new URL(request.url).origin &&
    request.headers.get("sec-fetch-site") !== "cross-site"
  );
}

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") || "local";
}

async function boundedBody(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new ValidationError("Please use the website form.");
  if (Number(request.headers.get("content-length") || 0) > 20000)
    throw new ValidationError("Please shorten your enquiry.");
  const reader = request.body?.getReader();
  if (!reader) throw new ValidationError("Please check the form.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 20000) {
      await reader.cancel();
      throw new ValidationError("Please shorten your enquiry.");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let i = 0;
  for (const c of chunks) {
    bytes.set(c, i);
    i += c.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new ValidationError("Please check the form and try again.");
  }
}

async function resourceResponse(reference: string, id: string, key: string) {
  const expires = Date.now() + 30 * 60 * 1000;
  const signature = await sign(reference + "." + id + "." + expires, key);
  return {
    reference,
    download_url:
      "/api/download?reference=" +
      encodeURIComponent(reference) +
      "&resource=" +
      encodeURIComponent(id) +
      "&expires=" +
      expires +
      "&signature=" +
      signature,
  };
}

async function cleanupExpired(now: number) {
  try {
    await transaction(async (connection) => {
      await connection.execute(
        "DELETE FROM deliveries WHERE reference IN (SELECT reference FROM requests WHERE expires_at < ?)",
        [now],
      );
      await connection.execute("DELETE FROM requests WHERE expires_at < ?", [now]);
      await connection.execute("DELETE FROM rate_limits WHERE expires_at < ?", [
        now,
      ]);
    });
  } catch {
    // Cleanup is best-effort; a saved enquiry must not depend on it.
  }
}

export async function intake(request: Request, kind: Kind) {
  if (!validOrigin(request))
    return json({ error: "Please submit this request from the website." }, 403);

  const key = process.env.INTAKE_ENCRYPTION_KEY;
  if (!key || !/^[0-9a-f]{64}$/.test(key))
    return json(
      {
        error:
          "The enquiry service is temporarily unavailable. Please email Healthcare@marketingtusk.com.",
      },
      503,
    );

  try {
    const details = validateIntake(await boundedBody(request), kind);
    const now = Date.now();

    if (kind === "resource" && !(details.resource_id! in registry))
      return json(
        {
          error:
            "This resource is temporarily unavailable. Please try again later.",
        },
        503,
      );

    const fingerprint = await hash(JSON.stringify(details));
    const existing = await queryRow<{
      reference: string;
      fingerprint: string;
      expires_at: number;
    }>(
      "SELECT reference, fingerprint, expires_at FROM requests WHERE idempotency_key = ? LIMIT 1",
      [details.idempotency_key],
    );

    if (existing) {
      if (existing.fingerprint !== fingerprint)
        return json(
          {
            error:
              "This request changed after a previous submission. Please refresh the page and submit again.",
          },
          409,
        );
      return json(
        kind === "resource"
          ? await resourceResponse(existing.reference, details.resource_id!, key)
          : { reference: existing.reference, accepted: true, duplicate: true },
      );
    }

    const limitKey = await sign(
      clientIp(request) + ":" + Math.floor(now / 600000),
      key,
    );
    const windowEnd = now + 600000;
    await execute(
      "INSERT INTO rate_limits (limit_key, `count`, expires_at) VALUES (?, 1, ?) " +
        "ON DUPLICATE KEY UPDATE `count` = IF(expires_at < ?, 1, `count` + 1), expires_at = IF(expires_at < ?, ?, expires_at)",
      [limitKey, windowEnd, now, now, windowEnd],
    );
    const rate = await queryRow<{ count: number }>(
      "SELECT `count` FROM rate_limits WHERE limit_key = ? LIMIT 1",
      [limitKey],
    );
    if ((rate?.count || 0) > 20)
      return json(
        {
          error:
            "There have been several requests recently. Please wait a few minutes or contact us directly.",
        },
        429,
      );

    const reference =
      "MTH-" +
      crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
    const payload = await sealPayload(
      { ...details, received_at: new Date(now).toISOString() },
      key,
    );

    try {
      await transaction(async (connection) => {
        await connection.execute(
          "INSERT INTO requests (reference, kind, status, idempotency_key, fingerprint, encrypted_payload, resource_id, service, icp, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            reference,
            kind,
            "new",
            details.idempotency_key,
            fingerprint,
            payload,
            details.resource_id || null,
            details.service || null,
            details.icp || null,
            now,
            now + 90 * 86400000,
          ],
        );
        if (process.env.CRM_WEBHOOK_URL && process.env.CRM_WEBHOOK_SECRET) {
          await connection.execute(
            "INSERT INTO deliveries (id, reference, status, attempts, created_at, next_at) VALUES (?, ?, ?, 0, ?, ?)",
            [crypto.randomUUID(), reference, "pending", now, now],
          );
        }
      });
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;
      const duplicate = await queryRow<{
        reference: string;
        fingerprint: string;
      }>(
        "SELECT reference, fingerprint FROM requests WHERE idempotency_key = ? LIMIT 1",
        [details.idempotency_key],
      );
      if (duplicate?.fingerprint === fingerprint)
        return json(
          kind === "resource"
            ? await resourceResponse(duplicate.reference, details.resource_id!, key)
            : {
                reference: duplicate.reference,
                accepted: true,
                duplicate: true,
              },
        );
      throw new Error("Storage unavailable");
    }

    await cleanupExpired(now);

    return json(
      kind === "resource"
        ? await resourceResponse(reference, details.resource_id!, key)
        : { reference, accepted: true },
      201,
    );
  } catch (error) {
    if (error instanceof ValidationError) return json({ error: error.message }, 400);
    return json(
      {
        error:
          "We could not save your enquiry. Please try again or email Healthcare@marketingtusk.com.",
      },
      503,
    );
  }
}
