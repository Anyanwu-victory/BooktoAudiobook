import { isAdmin, sameOrigin } from "@/lib/admin";
import { reviewBook } from "@/lib/library";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await isAdmin())) return Response.json({ error: "Admin sign in required." }, { status: 401 });
  try {
    const { id, decision } = await request.json();
    if (typeof id !== "string" || !["published", "rejected"].includes(decision)) {
      return Response.json({ error: "Invalid review decision." }, { status: 400 });
    }
    await reviewBook(id, decision);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Review failed." }, { status: 400 });
  }
}
