"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Card = { id: string; title: string; author: string; description: string; subject: string; language: string; parts: number };
const palettes = ["cover-blue", "cover-coral", "cover-green", "cover-purple", "cover-gold"];

export default function Catalog({ books }: { books: Card[] }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => books.filter((book) => `${book.title} ${book.author} ${book.subject}`.toLowerCase().includes(query.toLowerCase().trim())), [books, query]);
  return <><label className="search-field"><span aria-hidden="true">⌕</span><span className="sr-only">Search books, authors, or subjects</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search books, authors, or subjects" /></label>{results.length ? <div className="book-grid">{results.map((book, index) => <Link className="book-card" href={`/books/${book.id}`} key={book.id}><div className={`book-cover ${palettes[index % palettes.length]}`}><span className="cover-mark">V / A</span><strong>{book.title}</strong><small>{book.author}</small><span className="cover-line" /></div><div className="book-meta"><span>{book.subject || "Book"} · {book.language || "English"}</span><h3>{book.title}</h3><p>{book.author}</p><small>{book.parts} listening {book.parts === 1 ? "part" : "parts"} <span aria-hidden="true">↗</span></small></div></Link>)}</div> : <div className="empty-state"><div className="empty-icon">♫</div><h3>{books.length ? "No books match your search" : "The shelves are ready"}</h3><p>{books.length ? "Try another title, author, or subject." : "The first approved book will appear here. Help your school start the collection."}</p>{!books.length && <Link className="button button-primary" href="/submit">Submit the first book</Link>}</div>}</>;
}
