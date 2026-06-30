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
  role: string;
  bio?: string;
  locationCity?: string;
  locationCountry?: string;
}

export interface UpdatePracticeAreasPayload {
  practiceAreaIds: string[];
  primaryAreaId: string;
  secondaryAreaId: string;
}

export interface SignupServiceRow {
  service: string;
  pricing: string;
}

export interface UpdateServicesPayload {
  practiceAreaId: string;
  services: SignupServiceRow[];
}

export interface ServiceOffering {
  id: string;
  accountId: string;
  practiceAreaId: string;
  name: string;
  price: number; // in kobo
  createdAt: string;
  updatedAt: string;
}
export interface ServiceRow {
  practiceAreaId: string;
  name: string;
  price: number; // in kobo
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
export const settingsService = {
  updateProfile: (payload: UpdateProfilePayload) =>
    api.patch("/profile/me", payload),

  toggleAnonymous: (isAnonymous: boolean) =>
    api.patch("/profile/me/anonymous", { isAnonymous }),

  deleteAccount: () => api.delete("/auth/account"),
getServices: () =>
    api.get<{ error: boolean; message: string; data: ServiceOffering[] }>(
      "/profile/me/services"
    ),
  updatePersonalInfo: (payload: UpdatePersonalInfoPayload) =>
    api.patch("/profile/me", payload),

  updatePracticeAreas: (payload: UpdatePracticeAreasPayload) =>
    api.patch("/profile/me/practice-areas", payload),

  updateServices: (services: ServiceRow[]) =>
    api.put<{ data: { items: ServiceOffering[]; feeRangeMin: number; feeRangeMax: number } }>(
      "/profile/me/services",
      { services }
    ),
};
