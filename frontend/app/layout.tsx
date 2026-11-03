import type { Metadata } from "next";
import Link from "next/link";
import { contributorName, currentContributor } from "@/lib/contributor-auth";
import SignOutButton from "@/components/SignOutButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voxa | Turn books into listening",
  description:
    "Convert your books for listening and discover books shared by readers everywhere.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await currentContributor();
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="shell nav-wrap">
            <Link className="brand" href="/" aria-label="Voxa home">
              <span className="brand-icon">V</span>
              <span>
                voxa<span className="brand-period">.</span>
              </span>
            </Link>
            <nav aria-label="Main navigation">
              <Link href="/#catalog">Explore</Link>
              <Link href="/library">My books</Link>
              {user ? (
                <>
                  {/* <span className="nav-greeting">
                    Hello, {contributorName(user)}
                  </span> */}
                  <SignOutButton />
                </>
              ) : (
                <Link href="/login">Sign in</Link>
              )}
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="shell">
            <span className="brand footer-brand">
              voxa<span className="brand-period">.</span>
            </span>
            <p>Listen to books from anywhere.</p>
            <span>Read with your ears</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
