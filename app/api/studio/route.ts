import { execute, queryRows } from "../../../db";
import { canManageEnquiries } from "../../../lib/admin";
import { json, validOrigin } from "../../../lib/intake";
import { openPayload } from "../../../lib/security";

type RequestRow = {
  reference: string;
  kind: string;
  status: string;
  created_at: number;
  encrypted_payload: string;
};

export async function GET(request: Request) {
  if (!(await canManageEnquiries()))
    return json({ error: "Owner access is required." }, 403);

  const key = process.env.INTAKE_ENCRYPTION_KEY;
  if (!key) return json({ error: "The enquiry inbox is unavailable." }, 503);

  try {
    const q = new URL(request.url).searchParams;
    const before = Number(q.get("before")) || Date.now() + 1;
    const now = Date.now();

    const rows = await queryRows<RequestRow>(
      "SELECT * FROM requests WHERE created_at < ? AND expires_at > ? ORDER BY created_at DESC LIMIT 51",
      [before, now],
    );
    const subset = rows.slice(0, 50);

    const items = await Promise.all(
      subset.map(async (r) => ({
        reference: r.reference,
        kind: r.kind,
        status: r.status,
        created_at: Number(r.created_at),
        details: await openPayload(r.encrypted_payload, key),
      })),
    );

    const totals = await queryRows<{ kind: string; total: number }>(
      "SELECT kind, COUNT(*) AS total FROM requests WHERE expires_at > ? GROUP BY kind",
      [now],
    );

    return json({
      items,
      totals: totals.map((t) => ({ kind: t.kind, total: Number(t.total) })),
      next_before:
        rows.length > 50 ? Number(subset[subset.length - 1].created_at) : null,
    });
  } catch {
    return json({ error: "The inbox could not be loaded. Please try again." }, 503);
  }
}

export async function PATCH(request: Request) {
  if (!validOrigin(request) || !(await canManageEnquiries()))
    return json({ error: "Owner access is required." }, 403);

  try {
    const body = (await request.json()) as { reference: string; status: string };
    if (
      !/^MTH-[A-F0-9]{12}$/.test(body.reference) ||
      !["new", "contacted", "qualified", "closed", "archived"].includes(
        body.status,
      )
    )
      return json({ error: "Please check the requested change." }, 400);

    await execute("UPDATE requests SET status = ? WHERE reference = ?", [
      body.status,
      body.reference,
    ]);
    return json({ saved: true });
  } catch {
    return json({ error: "The status could not be updated." }, 503);
  }
}
