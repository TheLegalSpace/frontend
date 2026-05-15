// services/settings.service.ts
import { api } from "./api";

export interface UpdateProfilePayload {
  fullName?: string;
  bio?: string;
  phone?: string;
  locationCity?: string;
  locationCountry?: string;
}

export const settingsService = {
  updateProfile: (payload: UpdateProfilePayload) =>
    api.patch("/profile/me", payload),

  toggleAnonymous: (isAnonymous: boolean) =>
    api.patch("/profile/me/anonymous", { isAnonymous }),

  deleteAccount: () => api.delete("/auth/account"),
};