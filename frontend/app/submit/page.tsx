import SubmissionForm from "@/components/SubmissionForm";

export default function SubmitPage() {
  return <section className="shell page-section narrow"><span className="eyebrow">Contribute to the collection</span><h1 className="page-title">Share a book</h1><p className="page-intro">Upload a PDF or EPUB that your school has permission to share. A librarian will review it before it appears in the library.</p><SubmissionForm /></section>;
}
