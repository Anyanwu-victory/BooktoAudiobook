import SubmissionForm from "@/components/SubmissionForm";
import { currentContributor } from "@/lib/contributor-auth";
import { redirect } from "next/navigation";

export default async function SubmitPage() {
  if (!(await currentContributor())) redirect("/login");
  return <section className="shell page-section narrow"><span className="eyebrow">Your private space</span><h1 className="page-title">Upload a book</h1><p className="page-intro">Add a text-based PDF or EPUB. Convert it and listen privately before you decide whether to request publication.</p><SubmissionForm /></section>;
}
