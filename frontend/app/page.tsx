import Link from "next/link";
import { listPublished } from "@/lib/library";
import Catalog from "@/components/Catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  const books = await listPublished();
  const cards = books.map(({ id, title, author, description, subject, language, chapters, partCount }) => ({ id, title, author, description, subject, language, parts: partCount ?? chapters.length }));
  return <>
    <section className="hero shell"><div className="hero-copy"><span className="eyebrow">Books you can listen to</span><h1>Every story deserves to be <em>heard.</em></h1><p>Discover books shared by readers everywhere. Upload your own book, turn its text into a listening experience, and choose when to share it with the world.</p><div className="hero-actions"><a className="button button-primary" href="#catalog">Explore books</a><Link className="text-link" href="/library">Convert your book ↗</Link></div></div><div className="hero-art" aria-hidden="true"><div className="sound-ring ring-one" /><div className="sound-ring ring-two" /><div className="art-book"><span>VOXA</span><strong>READ<br />WITH<br />YOUR<br />EARS.</strong><small>LISTEN ANYWHERE</small></div><div className="art-caption"><span className="play-dot">▶</span><span>Pick a book.<br /><strong>Press play.</strong></span></div></div></section>
    <section className="catalog-section" id="catalog"><div className="shell"><div className="section-heading"><div><span className="eyebrow">Shared by readers</span><h2>Explore books</h2></div><p>{books.length} {books.length === 1 ? "book" : "books"} ready to listen</p></div><Catalog books={cards} /></div></section>
    <section className="contribute shell"><div><span className="eyebrow">Your next listen</span><h2>Have a book you want to hear?</h2><p>Upload and listen privately first. Request publication when you are ready to share it.</p></div><Link className="button button-dark" href="/library">Go to My books ↗</Link></section>
  </>;
}
