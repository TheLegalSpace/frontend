// services/profile.service.ts
import { api } from "./api";
import { AuthResponse } from "./auth.services";
import type { PracticeAreaFee } from "./settings.services";
export type ProfessionalRole = "LAWYER" | "FIRM"; // NEW

export type PracticeAreaRef =
  | string
  | {
      id: string;
      name: string;
      slug?: string;
      isActive?: boolean;
      createdAt?: string;
      // Backend now returns a fee range (in kobo) per practice area.
      minFee?: number;
      maxFee?: number;
    };

export type ProfileData = AuthResponse["data"]["account"] & {
  isFollowing: boolean;
  practiceAreas: PracticeAreaRef[];
};

export type ProfileResponse = {
  error: boolean;
  message: string;
  data: ProfileData;
  email?: string;
  isAnonymous?: boolean;
  fullName?: string;
  phone?: string;
  role?: string;
};
export interface Review {
  id: string;
  reviewerAccountId: string;
  reviewedAccountId: string;
  rating: number;
  body: string;
  createdAt: string;
  reviewer: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    isAnonymous: boolean;
    role: string;
  };
}
export interface ReviewsResponse {
  error: boolean;
  message: string;
  data: {
    items: Review[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface ProfileArticle {
  id: string;
  title: string;
  slug: string;
  body?: string | null;
  excerpt?: string | null;
  readCount: number;
  publishedAt: string;
  pdfUrl?: string | null;
  createdAt?: string;
  likeCount: number;
  dislikeCount: number;
}

export interface ProfileArticlesResponse {
  error: boolean;
  message: string;
  data: {
    items: ProfileArticle[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export const profileService = {
  getMe: () => api.get<ProfileResponse>("/profile/me"),

  getById: (accountId: string) =>
    api.get<ProfileResponse>(`/profile/${accountId}`),

  updateMe: (payload: Record<string, unknown>) =>
    api.patch<ProfileResponse>("/profile/me", payload),

  // NEW — call the moment the user picks Lawyer or Firm, before showing plans.
  // Re-callable and idempotent — safe to call again if they switch selection.
  setProfessionalRole: (role: ProfessionalRole) =>
    api.patch<ProfileResponse>("/profile/me/professional-role", { role }),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/profile/me/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadCover: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/profile/me/cover", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  toggleAnonymous: (isAnonymous: boolean) =>
    api.patch("/profile/me/anonymous", { isAnonymous }),

  updatePracticeAreas: (practiceAreas: PracticeAreaFee[]) =>
    api.patch("/profile/me/practice-areas", { practiceAreas }),

  getConnections: (accountId: string, page = 1, limit = 20) =>
    api.get(`/profile/${accountId}/connections`, { params: { page, limit } }),

  getArticles: (accountId: string, page = 1, limit = 20) =>
    api.get<ProfileArticlesResponse>(`/profile/${accountId}/articles`, {
      params: { page, limit },
    }),
  getReviews: (accountId: string, page = 1, limit = 20) =>
    api.get<ReviewsResponse>(`/profile/${accountId}/reviews`, {
      params: { page, limit },
    }),
  // getReviews: (accountId: string, page = 1, limit = 20) =>
  //   api.get(`/profile/${accountId}/reviews`, { params: { page, limit } }),

  getPosts: (accountId: string, page = 1, limit = 20) =>
    api.get(`/profile/${accountId}/posts`, { params: { page, limit } }),
};
