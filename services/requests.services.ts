// services/requests.service.ts
import { api } from "./api";

export type RequestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "cancelled"
  | "completed";

export interface LawyerAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  locationCity: string | null;
  locationCountry: string | null;
  avgRating: string;
  reviewCount: number;
  connectionCount: number;
  lastActiveAt: string;
  createdAt: string;
}

export interface IntakePayload {
  budget: string;
  matter: string;
  freeText: string;
  location: string;
  preference: "lawyer" | "firm";
}

export interface LegalRequest {
  id: string;
  userAccountId: string;
  lawyerAccountId: string;
  intakePayload: IntakePayload;
  relevanceScore: number;
  status: RequestStatus;
  conversationId: string | null;
  createdAt: string;
  respondedAt: string | null;
  expiresAt: string;
  lawyerAccount: LawyerAccount;
}

export interface RequestsResponse {
  error: boolean;
  message: string;
  data: {
    items: LegalRequest[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface CreateRequestPayload {
  matter: string;
  budget: string;
  freeText: string;
  location: string;
  preference: "lawyer" | "firm";
}

// Map budget string to display format
export function formatBudget(budget: string): string {
  const map: Record<string, string> = {
    under_50k: "Under ₦50k",
    "50k_to_100k": "₦50k–₦100k",
    "100k_to_500k": "₦100k–₦500k",
    "500k_to_1m": "₦500k–₦1M",
    above_1m: "Above ₦1M",
  };
  return map[budget] ?? budget;
}

export interface SendRequestPayload {
  lawyerAccountId: string;
  intakePayload: {
    matter: string;
    budget: string;
    location: string;
    preference: string;
    freeText: string;
  };
}

export const requestsService = {
  list: (status?: RequestStatus, page = 1, limit = 20) =>
    api.get<RequestsResponse>("/requests", {
      params: { ...(status && { status }), page, limit },
    }),

  get: (id: string) =>
    api.get<{ error: boolean; message: string; data: LegalRequest }>(
      `/requests/${id}`,
    ),

  create: (payload: CreateRequestPayload) =>
    api.post<{ error: boolean; message: string; data: LegalRequest }>(
      "/requests",
      payload,
    ),

  sendRequest: (payload: SendRequestPayload) =>
    api.post<{ error: boolean; message: string; data: LegalRequest }>(
      "/requests",
      payload,
    ),

  cancel: (id: string) => api.delete(`/requests/${id}`),

  delete: (id: string) => api.delete(`/requests/${id}`),
};
