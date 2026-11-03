-- Run once in the Supabase SQL Editor before setting LIBRARY_BACKEND=supabase.
create table if not exists public.books (
  id uuid primary key,
  title text not null,
  author text not null,
  description text not null default '',
  subject text not null default '',
  language text not null default '',
  rights text not null,
  source_name text not null,
  source_path text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'converted', 'published', 'rejected')),
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  published_at timestamptz,
  chapters jsonb not null default '[]'::jsonb,
  chapter_count integer not null default 0 check (chapter_count >= 0)
);

create index if not exists books_status_published_at_idx
  on public.books (status, published_at desc);
create index if not exists books_created_at_idx
  on public.books (created_at desc);

alter table public.books enable row level security;
revoke all on public.books from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'book-sources', 'book-sources', false, 15728640,
  array['application/pdf', 'application/epub+zip']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
