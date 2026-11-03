import "server-only";

import { randomUUID } from "node:crypto";
import { getSupabase } from "@/lib/supabase";
import { extractChapters, type Book, type Chapter } from "@/lib/library-local";

const bucket = "book-sources";
const metadata = "id,title,author,description,subject,language,rights,source_name,status,created_at,approved_at,converted_at,publication_requested_at,rejected_at,published_at,chapter_count,owner_id";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Row = {
  id: string;
  title: string;
  author: string;
  description: string;
  subject: string;
  language: string;
  rights: string;
  source_name: string;
  source_path?: string;
  status: Book["status"];
  created_at: string;
  approved_at?: string | null;
  converted_at?: string | null;
  publication_requested_at?: string | null;
  rejected_at?: string | null;
  published_at?: string | null;
  chapter_count: number;
  owner_id?: string | null;
  chapters?: Chapter[];
};

function toBook(row: Row): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    description: row.description,
    subject: row.subject,
    language: row.language,
    rights: row.rights,
    sourceName: row.source_name,
    status: row.status,
    createdAt: row.created_at,
    approvedAt: row.approved_at ?? undefined,
    convertedAt: row.converted_at ?? undefined,
    publicationRequestedAt: row.publication_requested_at ?? undefined,
    rejectedAt: row.rejected_at ?? undefined,
    publishedAt: row.published_at ?? undefined,
    ownerId: row.owner_id ?? undefined,
    chapters: row.chapters ?? [],
    partCount: row.chapter_count,
  };
}

function check(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export async function listPublished(): Promise<Book[]> {
  const { data, error } = await getSupabase().from("books").select(metadata).eq("status", "published").order("published_at", { ascending: false });
  check(error);
  return ((data ?? []) as unknown as Row[]).map(toBook);
}

export async function listMine(ownerId: string): Promise<Book[]> {
  const { data, error } = await getSupabase().from("books").select(metadata).eq("owner_id", ownerId).order("created_at", { ascending: false });
  check(error);
  return ((data ?? []) as unknown as Row[]).map(toBook);
}

export async function listReviewable(): Promise<Book[]> {
  const { data, error } = await getSupabase().from("books").select(metadata)
    .in("status", ["pending_publication", "published", "rejected"])
    .order("created_at", { ascending: false });
  check(error);
  return ((data ?? []) as unknown as Row[]).map(toBook);
}

export async function getAccessible(id: string, ownerId?: string): Promise<Book | undefined> {
  if (!uuidPattern.test(id)) return undefined;
  const query = getSupabase().from("books").select(`${metadata},chapters`).eq("id", id);
  const { data, error } = await (ownerId ? query.or(`status.eq.published,owner_id.eq.${ownerId}`) : query.eq("status", "published")).maybeSingle();
  check(error);
  return data ? toBook(data as Row) : undefined;
}

export async function getForReview(id: string): Promise<Book | undefined> {
  if (!uuidPattern.test(id)) return undefined;
  const { data, error } = await getSupabase().from("books").select(`${metadata},chapters`)
    .eq("id", id).in("status", ["pending_publication", "published", "rejected"]).maybeSingle();
  check(error);
  return data ? toBook(data as Row) : undefined;
}

export async function getReviewFile(id: string): Promise<{ name: string; data: Buffer } | undefined> {
  if (!uuidPattern.test(id)) return undefined;
  const supabase = getSupabase();
  const { data: book, error } = await supabase.from("books").select("source_name,source_path")
    .eq("id", id).in("status", ["pending_publication", "published", "rejected"]).maybeSingle();
  check(error);
  if (!book) return undefined;
  const { data: file, error: downloadError } = await supabase.storage.from(bucket).download(book.source_path);
  check(downloadError);
  if (!file) throw new Error("The source file is missing from storage.");
  return { name: book.source_name, data: Buffer.from(await file.arrayBuffer()) };
}

export async function addSubmission(
  input: Pick<Book, "title" | "author" | "description" | "subject" | "language" | "rights" | "sourceName">,
  file: Buffer,
  ownerId: string,
): Promise<Book> {
  const supabase = getSupabase();
  const id = randomUUID();
  const extension = input.sourceName.toLowerCase().endsWith(".epub") ? "epub" : "pdf";
  const sourcePath = `${id}/source.${extension}`;
  const { error: uploadError } = await supabase.storage.from(bucket).upload(sourcePath, file, {
    contentType: extension === "epub" ? "application/epub+zip" : "application/pdf",
    upsert: false,
  });
  check(uploadError);
  const { data, error } = await supabase.from("books").insert({
    id,
    title: input.title,
    author: input.author,
    description: input.description,
    subject: input.subject,
    language: input.language,
    rights: input.rights,
    source_name: input.sourceName,
    source_path: sourcePath,
    owner_id: ownerId,
    status: "pending",
  }).select("*").single();
  if (error || !data) {
    await supabase.storage.from(bucket).remove([sourcePath]);
    throw new Error(error?.message ?? "Could not save the upload.");
  }
  return toBook(data as Row);
}

export async function convertBook(id: string, ownerId: string): Promise<void> {
  if (!uuidPattern.test(id)) throw new Error("Invalid book ID.");
  const supabase = getSupabase();
  const { data: book, error } = await supabase.from("books").select("source_name,source_path")
    .eq("id", id).eq("owner_id", ownerId).eq("status", "pending").maybeSingle();
  check(error);
  if (!book) throw new Error("This book is not available for conversion.");
  const { data: file, error: downloadError } = await supabase.storage.from(bucket).download(book.source_path);
  check(downloadError);
  if (!file) throw new Error("The source file is missing from storage.");
  const chapters = await extractChapters(Buffer.from(await file.arrayBuffer()), book.source_name);
  const { data, error: updateError } = await supabase.from("books").update({
    status: "converted",
    chapters,
    chapter_count: chapters.length,
    converted_at: new Date().toISOString(),
  }).eq("id", id).eq("owner_id", ownerId).eq("status", "pending").select("id").maybeSingle();
  check(updateError);
  if (!data) throw new Error("This book was already converted.");
}

export async function requestPublication(id: string, ownerId: string, rights: string): Promise<void> {
  if (!uuidPattern.test(id)) throw new Error("Invalid book ID.");
  const { data, error } = await getSupabase().from("books").update({
    status: "pending_publication",
    rights,
    publication_requested_at: new Date().toISOString(),
  }).eq("id", id).eq("owner_id", ownerId).eq("status", "converted").select("id").maybeSingle();
  check(error);
  if (!data) throw new Error("This book is not ready to request publication.");
}

export async function reviewPublication(id: string, decision: "published" | "rejected"): Promise<void> {
  if (!uuidPattern.test(id)) throw new Error("Invalid book ID.");
  const update = decision === "published"
    ? { status: decision, published_at: new Date().toISOString() }
    : { status: decision, rejected_at: new Date().toISOString() };
  const { data, error } = await getSupabase().from("books").update(update)
    .eq("id", id).eq("status", "pending_publication").select("id").maybeSingle();
  check(error);
  if (!data) throw new Error("This publication request was already reviewed.");
}
