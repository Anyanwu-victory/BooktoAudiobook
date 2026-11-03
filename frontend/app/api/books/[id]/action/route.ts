import { sameOrigin } from "@/lib/admin";
import { currentContributor } from "@/lib/contributor-auth";
import { convertBook, requestPublication } from "@/lib/library";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const user = await currentContributor();
  if (!user) return Response.json({ error: "Sign in to manage your books." }, { status: 401 });
  const { id } = await params;
  try {
    const { action, rights } = await request.json();
    if (action === "convert") await convertBook(id, user.id);
    else if (action === "request-publication") {
      if (!["owned", "permission", "open-license", "public-domain"].includes(rights)) {
        return Response.json({ error: "Choose why you can share this book publicly." }, { status: 400 });
      }
      await requestPublication(id, user.id, rights);
    }
    else return Response.json({ error: "Invalid book action." }, { status: 400 });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Book action failed." }, { status: 400 });
  }
}
