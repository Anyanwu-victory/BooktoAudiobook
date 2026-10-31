import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export type Chapter = { id: string; title: string; text: string };
export type Book = {
  id: string;
  title: string;
  author: string;
  description: string;
  subject: string;
  language: string;
  rights: string;
  sourceName: string;
  status: "pending" | "published" | "rejected";
  createdAt: string;
  publishedAt?: string;
  chapters: Chapter[];
};

const dataDir = path.join(process.cwd(), ".library-data");
const indexFile = path.join(dataDir, "books.json");
let pendingWrite = Promise.resolve();

async function readBooks(): Promise<Book[]> {
  try {
    return JSON.parse(await readFile(indexFile, "utf8")) as Book[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function updateBooks(change: (books: Book[]) => Book[]): Promise<void> {
  const operation = pendingWrite.then(async () => {
    await mkdir(dataDir, { recursive: true });
    const next = change(await readBooks());
    const temporary = `${indexFile}.${randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify(next, null, 2));
    await rename(temporary, indexFile);
  });
  pendingWrite = operation.catch(() => undefined);
  await operation;
}

export async function listPublished(): Promise<Book[]> {
  return (await readBooks())
    .filter((book) => book.status === "published")
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
}

export async function listAll(): Promise<Book[]> {
  return (await readBooks()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPublished(id: string): Promise<Book | undefined> {
  return (await readBooks()).find((book) => book.id === id && book.status === "published");
}

export async function getSubmissionFile(id: string): Promise<{ name: string; data: Buffer } | undefined> {
  const book = (await readBooks()).find((entry) => entry.id === id);
  if (!book) return undefined;
  return { name: book.sourceName, data: await readFile(path.join(dataDir, `${id}.source`)) };
}

export async function addSubmission(input: Omit<Book, "id" | "status" | "createdAt" | "chapters">, file: Buffer): Promise<Book> {
  const book: Book = {
    ...input,
    id: randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
    chapters: [],
  };
  await mkdir(dataDir, { recursive: true });
  await writeFile(path.join(dataDir, `${book.id}.source`), file, { flag: "wx" });
  await updateBooks((books) => [...books, book]);
  return book;
}

export async function reviewBook(id: string, decision: "published" | "rejected"): Promise<void> {
  const book = (await readBooks()).find((entry) => entry.id === id);
  if (!book || book.status !== "pending") throw new Error("This submission is no longer pending.");
  const chapters = decision === "published"
    ? await extractChapters(await readFile(path.join(dataDir, `${id}.source`)), book.sourceName)
    : [];
  await updateBooks((books) => books.map((entry) => entry.id === id && entry.status === "pending"
    ? { ...entry, status: decision, chapters, publishedAt: decision === "published" ? new Date().toISOString() : undefined }
    : entry));
}

async function extractChapters(file: Buffer, name: string): Promise<Chapter[]> {
  let text = "";
  if (name.toLowerCase().endsWith(".pdf")) {
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
    text = (await pdfParse(file)).text;
  } else if (name.toLowerCase().endsWith(".epub")) {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(file);
    const container = await zip.file("META-INF/container.xml")?.async("string");
    const opfPath = container?.match(/full-path=["']([^"']+)["']/i)?.[1];
    if (!opfPath) throw new Error("This EPUB has no readable contents.");
    const opf = await zip.file(opfPath)?.async("string");
    if (!opf) throw new Error("This EPUB has no readable contents.");
    const items = new Map<string, string>();
    for (const match of opf.matchAll(/<item\s+([^>]+)>/gi)) {
      const id = match[1].match(/\bid=["']([^"']+)["']/i)?.[1];
      const href = match[1].match(/\bhref=["']([^"']+)["']/i)?.[1];
      if (id && href) items.set(id, href);
    }
    const base = path.posix.dirname(opfPath);
    const parts: string[] = [];
    for (const match of opf.matchAll(/<itemref\s+([^>]+)>/gi)) {
      const id = match[1].match(/\bidref=["']([^"']+)["']/i)?.[1];
      const href = id && items.get(id);
      if (!href) continue;
      const content = await zip.file(path.posix.normalize(path.posix.join(base, decodeURIComponent(href))))?.async("string");
      if (content) parts.push(content);
    }
    text = parts.map(stripMarkup).join("\n\n");
  } else {
    throw new Error("Only PDF and EPUB files are supported.");
  }
  text = text.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (text.length < 40) throw new Error("No readable text was found. Scanned PDFs need OCR before upload.");
  if (text.length > 500_000) throw new Error("This book is too long for the current library limit.");
  const paragraphs = text.split(/\n\s*\n/);
  const parts: string[] = [];
  let current = "";
  for (const paragraph of paragraphs) {
    if (current.length + paragraph.length > 4500 && current) {
      parts.push(current.trim());
      current = "";
    }
    current += `${paragraph}\n\n`;
  }
  if (current.trim()) parts.push(current.trim());
  return parts.flatMap((part) => part.match(/[\s\S]{1,4500}/g) ?? []).map((part, index) => ({
    id: String(index + 1), title: `Part ${index + 1}`, text: part.trim(),
  }));
}

function stripMarkup(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/(?:p|h[1-6]|div|li)>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)));
}
