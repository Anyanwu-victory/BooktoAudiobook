import { contributorClient } from "@/lib/contributor-auth";
import { sameOrigin } from "@/lib/admin";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  await (await contributorClient()).auth.signOut();
  return Response.json({ ok: true });
}
