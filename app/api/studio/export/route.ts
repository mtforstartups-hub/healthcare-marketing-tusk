import { queryRows } from "../../../../db";
import { canManageEnquiries } from "../../../../lib/admin";
import { openPayload } from "../../../../lib/security";

export async function GET() {
  if (!(await canManageEnquiries()))
    return new Response("Owner access required", { status: 403 });

  const key = process.env.INTAKE_ENCRYPTION_KEY;
  if (!key) return new Response("Inbox unavailable", { status: 503 });

  try {
    const rows = await queryRows<{
      reference: string;
      kind: string;
      status: string;
      created_at: number;
      encrypted_payload: string;
    }>(
      "SELECT * FROM requests WHERE expires_at > ? ORDER BY created_at DESC LIMIT 10000",
      [Date.now()],
    );

    const escape = (v: unknown) => {
      let s = typeof v === "object" ? JSON.stringify(v) : String(v ?? "");
      if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
      return '"' + s.replace(/"/g, '""') + '"';
    };

    const csv = [
      [
        "Reference",
        "Type",
        "Status",
        "Received",
        "Name",
        "Organization",
        "Email",
        "Phone",
        "City",
        "Sector",
        "Service",
        "Contact preference",
        "Resource",
        "Marketing opt in",
        "Notes",
        "Additional answers",
      ]
        .map(escape)
        .join(","),
    ];

    for (const r of rows) {
      const d = await openPayload(r.encrypted_payload, key);
      csv.push(
        [
          r.reference,
          r.kind,
          r.status,
          new Date(Number(r.created_at)).toISOString(),
          d.name,
          d.organization,
          d.email,
          d.phone,
          d.city,
          d.icp,
          d.service,
          d.contact_preference,
          d.resource_id,
          d.marketing_opt_in,
          d.notes,
          d.answers,
        ]
          .map(escape)
          .join(","),
      );
    }

    return new Response("\uFEFF" + csv.join("\r\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="Healthcare_Enquiries.csv"',
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch {
    return new Response(
      "The enquiry export could not be created. Please try again.",
      {
        status: 503,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "private, no-store",
          "X-Robots-Tag": "noindex, nofollow",
        },
      },
    );
  }
}
