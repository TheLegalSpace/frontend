// services/profile.service.ts
import { api } from "./api";
import { AuthResponse } from "./auth.services";

type ProfileData = AuthResponse["data"]["account"] & {
  isFollowing: boolean;
  practiceAreas: string[];
};

interface ProfileResponse {
  error: boolean;
  message: string;
  data: ProfileData;
  email?: string;
  isAnonymous?: boolean;
  fullName?: string;
}

export const profileService = {
  getMe: () => api.get<ProfileResponse>("/profile/me"),

  getById: (accountId: string) =>
    api.get<ProfileResponse>(`/profile/${accountId}`),

  updateMe: (payload: Record<string, unknown>) =>
    api.patch<ProfileResponse>("/profile/me", payload),

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

  updatePracticeAreas: (practiceAreaIds: string[]) =>
    api.patch("/profile/me/practice-areas", { practiceAreaIds }),

  getConnections: (accountId: string, page = 1, limit = 20) =>
    api.get(`/profile/${accountId}/connections`, { params: { page, limit } }),

  getArticles: (accountId: string, page = 1, limit = 20) =>
    api.get(`/profile/${accountId}/articles`, { params: { page, limit } }),

  getReviews: (accountId: string, page = 1, limit = 20) =>
    api.get(`/profile/${accountId}/reviews`, { params: { page, limit } }),

  getPosts: (accountId: string, page = 1, limit = 20) =>
    api.get(`/profile/${accountId}/posts`, { params: { page, limit } }),
};