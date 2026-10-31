import Link from "next/link";
import { listPublished } from "@/lib/library";
import Catalog from "@/components/Catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  const books = await listPublished();
  const cards = books.map(({ id, title, author, description, subject, language, chapters }) => ({ id, title, author, description, subject, language, parts: chapters.length }));
  return <>
    <section className="hero shell"><div className="hero-copy"><span className="eyebrow">The school listening library</span><h1>Every story deserves to be <em>heard.</em></h1><p>Browse books your school has shared, open a chapter, and listen at your own pace. No student account needed.</p><div className="hero-actions"><a className="button button-primary" href="#catalog">Explore the library</a><Link className="text-link" href="/submit">Share a book <span aria-hidden="true">↗</span></Link></div></div><div className="hero-art" aria-hidden="true"><div className="sound-ring ring-one" /><div className="sound-ring ring-two" /><div className="art-book"><span>VOXA</span><strong>READ<br />WITH<br />YOUR<br />EARS.</strong><small>YOUR SCHOOL LIBRARY</small></div><div className="art-caption"><span className="play-dot">▶</span><span>Pick a book.<br /><strong>Press play.</strong></span></div></div></section>
    <section className="catalog-section" id="catalog"><div className="shell"><div className="section-heading"><div><span className="eyebrow">On the shelves</span><h2>Explore books</h2></div><p>{books.length} {books.length === 1 ? "book" : "books"} ready to listen</p></div><Catalog books={cards} /></div></section>
    <section className="contribute shell"><div><span className="eyebrow">Help the library grow</span><h2>Have a book your school can share?</h2><p>Submit it for review. A librarian will check it before students can listen.</p></div><Link className="button button-dark" href="/submit">Submit a book <span aria-hidden="true">↗</span></Link></section>
  </>;
}
