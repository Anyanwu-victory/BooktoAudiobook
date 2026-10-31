import { addSubmission } from "@/lib/library";
import { sameOrigin } from "@/lib/admin";

const maxBytes = 15 * 1024 * 1024;
const recent = new Map<string, number>();

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const now = Date.now();
  if (now - (recent.get(ip) ?? 0) < 60_000) {
    return Response.json({ error: "Please wait a minute before submitting another book." }, { status: 429 });
  }
  if (Number(request.headers.get("content-length")) > maxBytes + 50_000) {
    return Response.json({ error: "File must be 15 MB or smaller." }, { status: 413 });
  }
  try {
    const form = await request.formData();
    const file = form.get("file");
    const field = (key: string) => String(form.get(key) ?? "").trim();
    const title = field("title");
    const author = field("author");
    const description = field("description");
    const subject = field("subject");
    const language = field("language");
    const rights = field("rights");
    if (!(file instanceof File) || !/\.(pdf|epub)$/i.test(file.name) || file.size > maxBytes || file.size === 0) {
      return Response.json({ error: "Choose a PDF or EPUB file up to 15 MB." }, { status: 400 });
    }
    if (!title || !author || !rights || title.length > 120 || author.length > 120 || description.length > 500 || subject.length > 80 || language.length > 40) {
      return Response.json({ error: "Enter a title, author, and sharing rights. Keep details within the field limits." }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const isPdf = buffer.subarray(0, 5).toString() === "%PDF-";
    const isEpub = buffer.subarray(0, 2).toString() === "PK";
    if (file.name.toLowerCase().endsWith(".pdf") ? !isPdf : !isEpub) {
      return Response.json({ error: "The selected file does not match its extension." }, { status: 400 });
    }
    const book = await addSubmission({ title, author, description, subject, language, rights, sourceName: file.name }, buffer);
    recent.set(ip, now);
    return Response.json({ id: book.id, message: "Book submitted for review." }, { status: 201 });
  } catch {
    return Response.json({ error: "The book could not be submitted. Try again." }, { status: 500 });
  }
}
