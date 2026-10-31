# Voxa school listening library

Voxa is a school library where students can browse approved books and listen to them without creating an account. Students can submit text-based PDF or EPUB books for a librarian to review.

## Run locally

1. Open `frontend` and run `npm install`.
2. Copy `frontend/.env.example` to `frontend/.env.local`. Set a password of at least 12 characters and a random session secret of at least 32 characters.
3. Run `npm run dev` in `frontend`, then open http://localhost:3000.
4. Students can submit a book at `/submit`. Sign in at `/admin/login` to review it. Approved books appear in the catalog.

The app stores submitted files and book records in `frontend/.library-data`, which is excluded from Git. Back this directory up. The app expects a persistent writable filesystem and one running server instance. It is suitable for a school-hosted pilot; multi-instance or serverless deployment needs shared object storage and a database.

## Listening

The browser reads approved book text aloud using its available speech voices. Listening speed and chapter navigation are included. The last selected part is saved in that browser. Voice quality and language availability depend on the device. This version does not generate downloadable MP3 files or perform OCR on scanned PDFs.

## Review and rights

Submissions remain private until a librarian publishes them. The selected sharing basis is a claim by the submitter; the librarian must verify rights before approval. Approval extracts text and splits it into listening parts. Files are limited to 15 MB, and extracted text is limited to 500,000 characters.

## Production notes

- Use HTTPS, a strong admin password, and regular backups.
- Put rate limiting and upload size limits at the reverse proxy as well as in the app. The app's in-memory limits reset on restart.
- Replace local JSON/file storage with a database and object storage before running multiple server instances.
- The original repository contained a tracked backend `.env` with credentials. Its deletion on this branch does not remove it from Git history. Rotate those credentials before any public deployment.
