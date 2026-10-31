import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { listAll } from "@/lib/library";
import AdminBoard from "@/components/AdminBoard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const books = await listAll();
  return <section className="shell page-section"><span className="eyebrow">Librarian desk</span><h1 className="page-title">Book submissions</h1><p className="page-intro">Review sharing rights and book details before publishing. Approval extracts readable text for the listening player.</p><AdminBoard books={books.map(({ chapters, ...book }) => ({ ...book, parts: chapters.length }))} /></section>;
}
