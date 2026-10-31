import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublished } from "@/lib/library";
import Reader from "@/components/Reader";

export const dynamic = "force-dynamic";

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getPublished(id);
  if (!book) notFound();
  return <section className="shell page-section"><Link className="back-link" href="/#catalog">← Back to library</Link><div className="book-detail"><div className="detail-cover"><span>VOXA / SCHOOL LIBRARY</span><strong>{book.title}</strong><small>{book.author}</small><div className="detail-cover-waves" aria-hidden="true">)))</div></div><div className="detail-main"><span className="eyebrow">{book.subject || "Book"} · {book.language || "English"}</span><h1 className="page-title">{book.title}</h1><p className="book-byline">By {book.author}</p>{book.description && <p className="page-intro">{book.description}</p>}<div className="book-facts"><span>♫ {book.chapters.length} listening {book.chapters.length === 1 ? "part" : "parts"}</span><span>↗ Listen in your browser</span></div><Reader bookId={book.id} chapters={book.chapters} language={book.language} /></div></div></section>;
}
