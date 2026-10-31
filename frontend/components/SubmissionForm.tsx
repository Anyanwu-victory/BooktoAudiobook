"use client";

import { useState, type FormEvent } from "react";

export default function SubmissionForm() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    try { const response = await fetch("/api/submissions", { method: "POST", body: new FormData(event.currentTarget) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || "Submission failed."); setSuccess(true); setMessage("Your book has been sent to the librarian for review."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Submission failed."); }
    finally { setBusy(false); }
  }
  if (success) return <div className="form-panel success-panel" role="status"><span className="success-symbol">✓</span><h2>Book submitted</h2><p>{message}</p><a className="button button-primary" href="/">Back to the library</a></div>;
  return <form className="form-panel" onSubmit={submit}><div className="form-row"><label>Book title <input name="title" maxLength={120} required placeholder="e.g. Things Fall Apart" /></label><label>Author <input name="author" maxLength={120} required placeholder="Author’s name" /></label></div><div className="form-row"><label>Subject <input name="subject" maxLength={80} placeholder="e.g. Literature" /></label><label>Language <input name="language" maxLength={40} defaultValue="English" /></label></div><label>Short description <textarea name="description" maxLength={500} rows={3} placeholder="What is this book about?" /></label><label>Permission to share <select name="rights" required defaultValue=""><option value="" disabled>Choose the source of permission</option><option value="school-owned">The school owns this material</option><option value="permission">The rights holder gave permission</option><option value="open-license">It has an open license</option><option value="public-domain">It is in the public domain</option></select></label><label className="file-field">PDF or EPUB file <input name="file" type="file" accept=".pdf,.epub,application/pdf,application/epub+zip" required /><small>Maximum 15 MB. Text-based files work best; scanned PDFs need OCR first.</small></label><p className="form-note">Submitting a book does not publish it immediately. The librarian checks every submission.</p>{message && <p className="form-error" role="alert">{message}</p>}<button className="button button-primary" disabled={busy} type="submit">{busy ? "Sending book…" : "Submit for review"}</button></form>;
}
