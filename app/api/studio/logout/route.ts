import { cookies } from "next/headers";
import { OWNER_COOKIE } from "../../../../lib/auth";
import { json, validOrigin } from "../../../../lib/intake";

export async function POST(request: Request) {
  if (!validOrigin(request))
    return json({ error: "Please sign out from this website." }, 403);

  const store = await cookies();
  store.delete(OWNER_COOKIE);
  return json({ ok: true });
}
