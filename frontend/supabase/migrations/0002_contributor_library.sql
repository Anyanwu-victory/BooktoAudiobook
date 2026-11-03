-- Run after 0001_library.sql. Existing converted books remain publicly listed.
alter table public.books
  add column if not exists owner_id uuid references auth.users(id) on delete set null,
  add column if not exists converted_at timestamptz,
  add column if not exists publication_requested_at timestamptz,
  add column if not exists rejected_at timestamptz;

alter table public.books drop constraint if exists books_status_check;
alter table public.books add constraint books_status_check
  check (status in ('pending', 'approved', 'converted', 'pending_publication', 'published', 'rejected'));

update public.books
set status = 'published', published_at = coalesce(published_at, now())
where status = 'converted' and owner_id is null;

create index if not exists books_owner_created_at_idx
  on public.books (owner_id, created_at desc);
create index if not exists books_publication_queue_idx
  on public.books (status, publication_requested_at desc);

alter table public.books enable row level security;
revoke all on public.books from anon, authenticated;
