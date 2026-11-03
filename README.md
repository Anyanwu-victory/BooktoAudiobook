# Voxa: books you can listen to

Voxa is a public book listening app. Contributors create an account, upload a text-based PDF or EPUB, convert it to listening parts, and hear it privately. They can request publication so anyone can discover and listen to it. Admins review publication requests.

## Set up

1. In the Supabase SQL Editor, run [`0001_library.sql`](frontend/supabase/migrations/0001_library.sql) and then [`0002_contributor_library.sql`](frontend/supabase/migrations/0002_contributor_library.sql). If you already ran the first file, run only the second.
2. From `frontend`, copy `.env.example` to `.env.local`. Set the project URL, publishable key, server secret key, admin password, and admin session secret. Keep the server secret out of Git and browser code.
3. In Supabase Authentication URL Configuration, set the Site URL to `http://localhost:3000` for local testing and allow `http://localhost:3000/auth/callback` as a redirect URL. If email confirmation is enabled, contributors must confirm their address before signing in.
4. From `frontend`, run `npm install`, `npm run check:supabase`, and `npm run dev`. Open `http://localhost:3000`.

`npm run check:supabase` verifies the books table has the contributor columns and the source bucket is private. Run all npm commands in `frontend`; the repository root is not the app directory.

## Test the flow

1. Create a contributor account with a username, email, and password at `/login`, then confirm its email if prompted. Signed-in contributors see their username in the header and on My books.
2. Upload a PDF or EPUB at `/submit`. The book appears only in `/library`.
3. Choose **Convert for listening**. The uploader can open and hear the book, while a signed-out visitor cannot.
4. Choose a sharing basis and **Request publication**. Sign in at `/admin/login` using the separate admin password, review the request, and choose **Publish book**.
5. Open the public catalog while signed out. The book is now available to everyone.

The app currently extracts text and uses browser speech synthesis. It does not generate audio files, use Hume AI, or perform OCR on scanned PDFs. Uploads are limited to 15 MB and extracted text to 500,000 characters.

## Data and access

Book records are in Supabase Postgres; source files are in a private Storage bucket. The app's server checks contributor ownership before showing or changing private books. Admin review covers only publication requests. Published books are served to visitors through the app. Contributor sessions use Supabase Auth; the admin password is separate for this first testable version.

Existing `.library-data` files are not deleted. To copy old local records into Supabase, run `npm run import:local` from `frontend` after configuring Supabase. Previously public converted books remain public when migrated or imported. Old private records without an owner account remain inaccessible to contributors. Keep a backup of `.library-data`.

## Production notes

- Use HTTPS, a strong admin password, and regular backups.
- Add durable rate limits and conversion jobs before scaling. The in-memory upload and sign-in limits reset on restart, and conversion runs during one HTTP request.
- The original repository contained a tracked backend `.env` with credentials. Its deletion from the current branch does not remove it from Git history. Rotate those credentials before public deployment.
