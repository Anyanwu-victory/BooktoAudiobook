import Link from "next/link";
import { notFound } from "next/navigation";
import { currentContributor } from "@/lib/contributor-auth";
import { getAccessible } from "@/lib/library";
import Reader from "@/components/Reader";

export const dynamic = "force-dynamic";

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentContributor();
  const book = await getAccessible(id, user?.id);
  if (!book) notFound();
  const isOwner = Boolean(user && book.ownerId === user.id);
  const ready = book.chapters.length > 0;
  return <section className="shell page-section"><Link className="back-link" href={isOwner ? "/library" : "/#catalog"}>← Back to {isOwner ? "My books" : "catalog"}</Link><div className="book-detail"><div className="detail-cover"><span>VOXA / LISTENING LIBRARY</span><strong>{book.title}</strong><small>{book.author}</small><div className="detail-cover-waves" aria-hidden="true">)))</div></div><div className="detail-main"><span className="eyebrow">{book.subject || "Book"} · {book.language || "English"}</span><h1 className="page-title">{book.title}</h1><p className="book-byline">By {book.author}</p>{book.description && <p className="page-intro">{book.description}</p>}<div className="book-facts"><span>♫ {book.chapters.length} listening {book.chapters.length === 1 ? "part" : "parts"}</span><span>{book.status === "published" ? "Public book" : "Private to you"}</span></div>{ready ? <Reader bookId={book.id} chapters={book.chapters} language={book.language} /> : <p className="form-note">This book has not been converted yet. Open My books to start conversion.</p>}</div></div></section>;
}
