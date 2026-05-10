// services/profile.service.ts
import { api } from "./api";

export const profileService = {
  getMe: () => api.get("/api/v1/profile/me"),

  getById: (accountId: string) => api.get(`/api/v1/profile/${accountId}`),

  updateMe: (payload: Record<string, unknown>) =>
    api.patch("/api/v1/profile/me", payload),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/api/v1/profile/me/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadCover: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/api/v1/profile/me/cover", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  toggleAnonymous: (isAnonymous: boolean) =>
    api.patch("/api/v1/profile/me/anonymous", { isAnonymous }),

  updatePracticeAreas: (practiceAreaIds: string[]) =>
    api.patch("/api/v1/profile/me/practice-areas", { practiceAreaIds }),

  getConnections: (accountId: string, page = 1, limit = 20) =>
    api.get(`/api/v1/profile/${accountId}/connections`, { params: { page, limit } }),

  getArticles: (accountId: string, page = 1, limit = 20) =>
    api.get(`/api/v1/profile/${accountId}/articles`, { params: { page, limit } }),
};