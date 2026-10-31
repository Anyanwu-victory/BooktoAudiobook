import { checkPassword, sameOrigin, signInAdmin } from "@/lib/admin";

const attempts = new Map<string, { count: number; until: number }>();

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const now = Date.now();
  const state = attempts.get(ip);
  if (state && state.until > now && state.count >= 5) {
    return Response.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }
  try {
    const body = await request.json();
    if (typeof body.password !== "string" || !checkPassword(body.password)) {
      attempts.set(ip, { count: (state?.until && state.until > now ? state.count : 0) + 1, until: now + 15 * 60_000 });
      return Response.json({ error: "Incorrect password." }, { status: 401 });
    }
    attempts.delete(ip);
    await signInAdmin();
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not sign in." }, { status: 500 });
  }
}
