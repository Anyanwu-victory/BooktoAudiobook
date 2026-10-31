import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: "Voxa | School listening library", description: "Listen to books from your school library." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><header className="site-header"><div className="shell nav-wrap"><Link className="brand" href="/" aria-label="Voxa home"><span className="brand-icon">V</span><span>voxa<span className="brand-period">.</span></span></Link><nav aria-label="Main navigation"><Link href="/#catalog">Library</Link><Link href="/submit">Submit a book</Link><Link className="admin-link" href="/admin">Librarian</Link></nav></div></header><main>{children}</main><footer className="site-footer"><div className="shell"><span className="brand footer-brand">voxa<span className="brand-period">.</span></span><p>Books for every kind of learner.</p><span>Made for your school library</span></div></footer></body></html>;
}
