import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { getForReview } from "@/lib/library";
import Reader from "@/components/Reader";

export const dynamic = "force-dynamic";

export default async function AdminBookPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const book = await getForReview(id);
  if (!book) notFound();
  return <section className="shell page-section narrow"><Link className="back-link" href="/admin">← Back to publication review</Link><span className="eyebrow">Review before sharing</span><h1 className="page-title">{book.title}</h1><p className="page-intro">By {book.author}</p><p><strong>Sharing basis:</strong> {book.rights.replaceAll("-", " ")}</p>{book.chapters.length ? <Reader bookId={book.id} chapters={book.chapters} language={book.language} /> : <p className="form-note">No converted text is available for this legacy book.</p>}</section>;
}
