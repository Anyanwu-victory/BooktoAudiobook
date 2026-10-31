"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Item = { id: string; title: string; author: string; description: string; subject: string; language: string; rights: string; sourceName: string; status: string; createdAt: string; parts: number };

export default function AdminBoard({ books }: { books: Item[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  async function review(id: string, decision: "published" | "rejected") {
    setBusy(id); setMessage("");
    try { const response = await fetch("/api/admin/review", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, decision }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || "Review failed."); router.refresh(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Review failed."); }
    finally { setBusy(""); }
  }
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); router.push("/"); router.refresh(); }
  const pending = books.filter((book) => book.status === "pending");
  return <><div className="admin-toolbar"><span>{pending.length} awaiting review · {books.filter((book) => book.status === "published").length} published</span><button onClick={logout}>Sign out</button></div>{message && <p className="form-error" role="alert">{message}</p>}{pending.length ? <div className="submission-list">{pending.map((book) => <article className="submission-card" key={book.id}><div><span className="eyebrow">Pending review</span><h2>{book.title}</h2><p>by {book.author}</p>{book.description && <p>{book.description}</p>}<dl><div><dt>File</dt><dd>{book.sourceName}</dd></div><div><dt>Subject</dt><dd>{book.subject || "—"}</dd></div><div><dt>Language</dt><dd>{book.language || "English"}</dd></div><div><dt>Sharing basis</dt><dd>{book.rights.replaceAll("-", " ")}</dd></div></dl></div><div className="review-actions"><a className="button button-outline" href={`/api/admin/submissions/${book.id}/file`}>Download source</a><button className="button button-primary" disabled={Boolean(busy)} onClick={() => review(book.id, "published")}>{busy === book.id ? "Processing…" : "Approve and publish"}</button><button className="button button-outline" disabled={Boolean(busy)} onClick={() => review(book.id, "rejected")}>Reject</button></div></article>)}</div> : <div className="empty-state"><div className="empty-icon">✓</div><h2>All caught up</h2><p>New student submissions will appear here.</p></div>}<h2 className="admin-subheading">Published books</h2><div className="published-list">{books.filter((book) => book.status === "published").map((book) => <a key={book.id} href={`/books/${book.id}`}><strong>{book.title}</strong><span>{book.author} · {book.parts} parts ↗</span></a>)}</div></>;
}
