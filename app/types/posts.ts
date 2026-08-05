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

// ── Post Reporting ──

export interface ReportReason {
  value: string;
  label: string;
  description: string;
  requiresDetails: boolean;
}

export interface ReportReasonsResponse {
  error: boolean;
  message: string;
  data: { items: ReportReason[] };
}

export interface ReportSubmitResponse {
  error: boolean;
  message: string;
  data: {
    report: { id: string; createdAt: string; reason: string; status: string };
    alreadyReported: boolean;
    postHidden: boolean;
    autoHidden?: boolean;
    autoHideThreshold?: number;
  };
}
