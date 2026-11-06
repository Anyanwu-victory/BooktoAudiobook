import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Supabase URL or server secret is missing.");

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});

function reason(error) {
  return String(error.message ?? error.name ?? "unknown")
    .replaceAll(key, "[redacted]")
    .replaceAll(url, "[project]")
    .slice(0, 200);
}

try {
  const [books, bucket] = await Promise.all([
    supabase.from("books").select("id,owner_id,publication_requested_at").limit(1),
    supabase.storage.getBucket("book-sources"),
  ]);
  const result = {
    books: books.error ? { ready: false, code: books.error.code, reason: reason(books.error) } : { ready: true },
    bucket: bucket.error
      ? { ready: false, status: bucket.error.status, reason: reason(bucket.error) }
      : { ready: true, private: bucket.data.public === false },
  };
  console.log(JSON.stringify(result));
  if (!result.books.ready || !result.bucket.ready || !result.bucket.private) process.exitCode = 1;
} catch (error) {
  console.error(`Supabase connection failed (${error instanceof Error ? error.name : "unknown error"}).`);
  process.exitCode = 1;
}
