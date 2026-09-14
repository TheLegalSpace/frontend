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
  fullName: string; // ✅ not firstName/lastName
  phone: string;
  role: string;
  bio?: string;
  locationCity?: string;
  locationCountry?: string;
}

/**
 * New per-practice-area fee shape used by:
 *   POST /profile/me/lawyer/setup
 *   POST /profile/me/firm/setup
 *   PATCH /profile/me/practice-areas
 * Fees are in kobo (naira × 100); minFee ≤ maxFee.
 */
export interface PracticeAreaFee {
  practiceAreaId: string;
  minFee: number;
  maxFee: number;
}

/**
 * PATCH /profile/me/practice-areas now takes a single array of practice areas,
 * each with its fee range. (The old practiceAreaIds + separate services arrays,
 * and GET/PUT /profile/me/services, were removed by the backend.)
 */
export interface UpdatePracticeAreasPayload {
  practiceAreas: PracticeAreaFee[];
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
};


