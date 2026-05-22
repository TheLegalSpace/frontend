// services/settings.service.ts
import { api } from "./api";

export interface UpdateProfilePayload {
  fullName?: string;
  bio?: string;
  phone?: string;
  locationCity?: string;
  locationCountry?: string;
}
export interface UpdatePersonalInfoPayload {
  fullName: string;   // ✅ not firstName/lastName
  phone: string;
  bio?: string;
  locationCity?: string;
  locationCountry?: string;
}

export interface UpdatePracticeAreasPayload {
  practiceAreaIds: string[];
  primaryAreaId: string;
  secondaryAreaId: string;
}

export interface ServiceRow {
  service: string;
  pricing: string;
}

export interface UpdateServicesPayload {
  practiceAreaId: string;
  services: ServiceRow[];
}
export const settingsService = {
  updateProfile: (payload: UpdateProfilePayload) =>
    api.patch("/profile/me", payload),

  toggleAnonymous: (isAnonymous: boolean) =>
    api.patch("/profile/me/anonymous", { isAnonymous }),

  deleteAccount: () => api.delete("/auth/account"),

  updatePersonalInfo: (payload: UpdatePersonalInfoPayload) =>
    api.patch("/profile/me", payload),

  updatePracticeAreas: (payload: UpdatePracticeAreasPayload) =>
    api.patch("/profile/me/practice-areas", payload),

  updateServices: (payload: UpdateServicesPayload) =>
    api.patch("/profile/me/services", payload),
};
