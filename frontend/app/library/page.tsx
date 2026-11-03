import { redirect } from "next/navigation";
import Link from "next/link";
import { contributorName, currentContributor } from "@/lib/contributor-auth";
import { listMine } from "@/lib/library";
import MyBooks from "@/components/MyBooks";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const user = await currentContributor();
  if (!user) redirect("/login");
  const books = await listMine(user.id);
  return <section className="shell page-section"><span className="eyebrow">Your private space</span><h1 className="page-title">Hello, {contributorName(user)}.</h1><p className="page-intro">Convert an upload and listen in your browser. It stays private until you request publication and it is approved.</p><div className="library-heading"><span>My books</span><Link className="button button-primary" href="/submit">Upload a book</Link></div><MyBooks books={books.map(({ chapters, partCount, ...book }) => ({ ...book, parts: partCount ?? chapters.length }))} /></section>;
}
