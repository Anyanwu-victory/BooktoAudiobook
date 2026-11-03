import { readFile } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  throw new Error("Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SECRET_KEY in frontend/.env.local before importing.");
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});
const dataDir = path.join(process.cwd(), ".library-data");
const books = JSON.parse(await readFile(path.join(dataDir, "books.json"), "utf8"));
let imported = 0;
let skipped = 0;

for (const book of books) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(book.id)) {
    throw new Error(`Invalid local book ID: ${book.id}`);
  }
  const { data: existing, error: lookupError } = await supabase
    .from("books").select("id").eq("id", book.id).maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) {
    skipped++;
    continue;
  }

  const extension = book.sourceName.toLowerCase().endsWith(".epub") ? "epub" : "pdf";
  const sourcePath = `${book.id}/source.${extension}`;
  const source = await readFile(path.join(dataDir, `${book.id}.source`));
  const { error: uploadError } = await supabase.storage.from("book-sources").upload(sourcePath, source, {
    contentType: extension === "epub" ? "application/epub+zip" : "application/pdf",
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase.from("books").insert({
    id: book.id,
    title: book.title,
    author: book.author,
    description: book.description,
    subject: book.subject,
    language: book.language,
    rights: book.rights,
    source_name: book.sourceName,
    source_path: sourcePath,
    status: book.status === "converted" ? "published" : book.status,
    created_at: book.createdAt,
    approved_at: book.approvedAt ?? null,
    published_at: book.publishedAt ?? (book.status === "converted" ? new Date().toISOString() : null),
    chapters: book.chapters,
    chapter_count: book.chapters.length,
  });
  if (insertError) {
    await supabase.storage.from("book-sources").remove([sourcePath]);
    throw insertError;
  }
  imported++;
  console.log(`Imported ${book.id}`);
}

console.log(`Finished: ${imported} imported, ${skipped} already present. Local files were kept.`);
