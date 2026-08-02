export interface PostAuthor {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  isAnonymous?: boolean;
}

export interface MyPost {
  id: string;
  body: string;
  authorAccountId: string;
  likeCount: number;
  dislikeCount: number;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor;
  pdfUrl?: string | null;
  title?: string | null;
  pdfName?: string | null;
  pdfSizeBytes?: number | null;
  moderationStatus?: "under_review" | null;
}