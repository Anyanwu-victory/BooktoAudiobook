import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { listReviewable } from "@/lib/library";
import AdminBoard from "@/components/AdminBoard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const books = await listReviewable();
  return <section className="shell page-section"><span className="eyebrow">Publication review</span><h1 className="page-title">Shared books</h1><p className="page-intro">Review requests before books appear in the public catalog. Contributors can already listen to their own conversions privately.</p><AdminBoard books={books.map(({ chapters, partCount, ...book }) => ({ ...book, parts: partCount ?? chapters.length }))} /></section>;
}
