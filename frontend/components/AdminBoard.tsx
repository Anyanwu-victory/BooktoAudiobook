"use client";

import { useRouter } from "next/navigation";
import { useState, type KeyboardEvent } from "react";
import type { Book } from "@/lib/library";

type Tab = "pending_publication" | "published" | "rejected";
type Item = {
  id: string;
  title: string;
  author: string;
  description: string;
  subject: string;
  language: string;
  rights: string;
  sourceName: string;
  status: Book["status"];
  createdAt: string;
  parts: number;
};

const tabs: { id: Tab; label: string; emptyTitle: string; emptyText: string }[] = [
  { id: "pending_publication", label: "Requests", emptyTitle: "No requests yet", emptyText: "Books submitted for public sharing will appear here." },
  { id: "published", label: "Published", emptyTitle: "No published books yet", emptyText: "Approved books will appear in the public catalog." },
  { id: "rejected", label: "Rejected", emptyTitle: "No rejected requests", emptyText: "Rejected books remain private to their contributors." },
];

export default function AdminBoard({ books }: { books: Item[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("pending_publication");
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");
  const visible = books.filter((book) => book.status === activeTab);
  const selectedTab = tabs.find((tab) => tab.id === activeTab)!;

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>) {
    const index = tabs.findIndex((tab) => tab.id === activeTab);
    const nextIndex = event.key === "ArrowRight" ? (index + 1) % tabs.length
      : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length
      : event.key === "Home" ? 0
      : event.key === "End" ? tabs.length - 1
      : -1;
    if (nextIndex < 0) return;
    event.preventDefault();
    const next = tabs[nextIndex].id;
    setActiveTab(next);
    setMessage("");
    document.getElementById(`tab-${next}`)?.focus();
  }

  async function review(id: string, decision: "published" | "rejected") {
    setBusyId(id);
    setMessage("");
    try {
      const response = await fetch("/api/admin/review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, decision }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not review this book.");
      setActiveTab(decision);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not review this book.");
    } finally {
      setBusyId("");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return <>
    <div className="admin-toolbar"><span>{books.length} public {books.length === 1 ? "request or book" : "requests and books"}</span><button onClick={logout}>Sign out</button></div>
    <div className="admin-tabs" role="tablist" aria-label="Publication status">
      {tabs.map((tab) => <button key={tab.id} id={`tab-${tab.id}`} type="button" role="tab" aria-selected={activeTab === tab.id} aria-controls={`panel-${tab.id}`} tabIndex={activeTab === tab.id ? 0 : -1} className={activeTab === tab.id ? "active" : ""} onClick={() => { setActiveTab(tab.id); setMessage(""); }} onKeyDown={handleTabKey}>{tab.label}<span className="tab-count">{books.filter((book) => book.status === tab.id).length}</span></button>)}
    </div>
    <div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`} className="admin-tab-panel">
      {message && <p className="form-error" role="alert">{message}</p>}
      {visible.length ? <div className="submission-list">{visible.map((book) => <article className="submission-card" key={book.id}><div><span className="eyebrow">{selectedTab.label}</span><h2>{book.title}</h2><p>by {book.author}</p>{book.description && <p>{book.description}</p>}<dl><div><dt>File</dt><dd>{book.sourceName}</dd></div><div><dt>Subject</dt><dd>{book.subject || "—"}</dd></div><div><dt>Language</dt><dd>{book.language || "English"}</dd></div><div><dt>Sharing basis</dt><dd>{book.rights.replaceAll("-", " ")}</dd></div><div><dt>Listening parts</dt><dd>{book.parts}</dd></div></dl></div><div className="review-actions"><a className="button button-outline" href={`/admin/books/${book.id}`}>Preview listening</a><a className="button button-outline" href={`/api/admin/submissions/${book.id}/file`}>Download source</a>{activeTab === "pending_publication" && <><button className="button button-primary" disabled={Boolean(busyId)} onClick={() => review(book.id, "published")}>{busyId === book.id ? "Saving…" : "Publish book"}</button><button className="button button-outline" disabled={Boolean(busyId)} onClick={() => review(book.id, "rejected")}>Reject request</button></>}{activeTab === "published" && <a className="button button-primary" href={`/books/${book.id}`}>Open book</a>}</div></article>)}</div> : <div className="empty-state"><div className="empty-icon">♫</div><h2>{selectedTab.emptyTitle}</h2><p>{selectedTab.emptyText}</p></div>}
    </div>
  </>;
}
