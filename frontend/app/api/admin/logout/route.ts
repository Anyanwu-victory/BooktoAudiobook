import { sameOrigin, signOutAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  await signOutAdmin();
  return Response.json({ ok: true });
}
