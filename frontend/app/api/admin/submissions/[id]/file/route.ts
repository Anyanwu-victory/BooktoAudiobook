import { isAdmin } from "@/lib/admin";
import { getSubmissionFile } from "@/lib/library";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new Response("Admin sign in required.", { status: 401 });
  const { id } = await params;
  const file = await getSubmissionFile(id);
  if (!file) return new Response("Book not found.", { status: 404 });
  const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return new Response(new Uint8Array(file.data), {
    headers: {
      "content-type": filename.toLowerCase().endsWith(".pdf") ? "application/pdf" : "application/epub+zip",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "private, no-store",
    },
  });
}
