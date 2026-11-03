"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Item = {
  id: string;
  title: string;
  author: string;
  status: "pending" | "approved" | "converted" | "pending_publication" | "published" | "rejected";
  parts: number;
};

const labels: Record<Item["status"], string> = {
  pending: "Ready to convert",
  approved: "Legacy upload",
  converted: "Private · ready to listen",
  pending_publication: "Publication requested",
  published: "Published for everyone",
  rejected: "Not approved for publication · still private",
};

export default function MyBooks({ books }: { books: Item[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");
  const [rights, setRights] = useState<Record<string, string>>({});

  async function act(id: string, action: "convert" | "request-publication") {
    if (action === "request-publication" && !rights[id]) {
      setMessage("Choose why you can share the book publicly.");
      return;
    }
    setBusyId(id);
    setMessage("");
    try {
      const response = await fetch(`/api/books/${id}/action`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, rights: rights[id] }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update this book.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update this book.");
    } finally {
      setBusyId("");
    }
  }

  return <>
    <div className="admin-toolbar"><span>{books.length} {books.length === 1 ? "book" : "books"}</span></div>
    {message && <p className="form-error" role="alert">{message}</p>}
    {books.length ? <div className="submission-list">{books.map((book) => <article className="submission-card" key={book.id}>
      <div><span className="eyebrow">{labels[book.status]}</span><h2>{book.title}</h2><p>by {book.author}</p>{book.parts > 0 && <p>{book.parts} listening {book.parts === 1 ? "part" : "parts"}</p>}</div>
      <div className="review-actions">
        {book.status === "pending" && <button className="button button-primary" type="button" disabled={Boolean(busyId)} onClick={() => act(book.id, "convert")}>{busyId === book.id ? "Converting…" : "Convert for listening"}</button>}
        {["converted", "pending_publication", "published", "rejected"].includes(book.status) && <Link className="button button-outline" href={`/books/${book.id}`}>Listen</Link>}
        {book.status === "converted" && <>
          <label className="request-rights">Permission to share
            <select value={rights[book.id] ?? ""} onChange={(event) => setRights((current) => ({ ...current, [book.id]: event.target.value }))}>
              <option value="" disabled>Choose sharing basis</option>
              <option value="owned">I own this material</option>
              <option value="permission">The rights holder gave permission</option>
              <option value="open-license">It has an open license</option>
              <option value="public-domain">It is in the public domain</option>
            </select>
          </label>
          <button className="button button-primary" type="button" disabled={Boolean(busyId)} onClick={() => act(book.id, "request-publication")}>{busyId === book.id ? "Sending…" : "Request publication"}</button>
        </>}
      </div>
    </article>)}</div> : <div className="empty-state"><div className="empty-icon">♫</div><h2>No books yet</h2><p>Upload a PDF or EPUB to start your private listening library.</p><Link className="button button-primary" href="/submit">Upload your first book</Link></div>}
  </>;
}
