import "server-only";

export type { Book, Chapter } from "@/lib/library-local";
export {
  addSubmission,
  convertBook,
  getAccessible,
  getForReview,
  getReviewFile,
  listMine,
  listPublished,
  listReviewable,
  requestPublication,
  reviewPublication,
} from "@/lib/library-supabase";
