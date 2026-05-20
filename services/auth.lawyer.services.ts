// services/auth.lawyer.service.ts
import { api } from "./api";

export interface RegisterLawyerPayload {
  authProvider: "email";
  fullName: string;
  email: string;
  password: string;
  scn: string;
  callToBarYear: number;
  nbaBranch: string;
  practiceAreaIds: string[];
  feeRangeMin: number;
  feeRangeMax: number;
  locationCity: string;
  locationCountry: string;
}

export interface RegisterFirmPayload {
  authProvider: "email";
  firmName: string;
  email: string;
  password: string;
  rcNumber: string;
  firmEstablishmentYear: number;
  verifyingPartnerScn: string;
  practiceAreaIds: string[];
  feeRangeMin: number;
  feeRangeMax: number;
  locationCity: string;
}

export const lawyerAuthService = {
  registerLawyer: (payload: RegisterLawyerPayload) =>
    api.post("/auth/register/lawyer", payload),

  registerFirm: (payload: RegisterFirmPayload) =>
    api.post("/auth/register/firm", payload),
};