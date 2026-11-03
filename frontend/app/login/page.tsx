import ContributorLogin from "@/components/ContributorLogin";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { currentContributor } from "@/lib/contributor-auth";

export default async function LoginPage() {
  if (await currentContributor()) redirect("/library");
  return <section className="shell page-section narrow"><span className="eyebrow">Your books</span><h1 className="page-title">Sign in or create an account</h1><p className="page-intro">Keep your conversions private, return to them later, and choose when to request publication.</p><Suspense fallback={null}><ContributorLogin /></Suspense></section>;
}
