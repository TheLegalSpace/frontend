import { api } from "./api";

export interface LoginPayload {
  authProvider: "email" | "google";
  email?: string;
  password?: string;
  fullName?: string;
  idToken?: string;
}
// services/auth.service.ts

// services/auth.service.ts

// services/auth.service.ts

export interface AuthResponse {
  error: boolean;
  message: string;
  data: {
    account: {
      id: string;
      authUserId: string;
      email: string;
      fullName: string;
      phone: string | null;
      role: "USER" | "LAWYER" | "FIRM" | "ADMIN";
      avatarUrl: string | null;
      coverUrl: string | null;
      bio: string | null;
      locationCity: string | null;
      locationCountry: string | null;
      isAnonymous: boolean;
      status: "active" | "inactive" | "suspended";
      avgRating: string;
      reviewCount: number;
      connectionCount: number;
      followerCount: number;
      followingCount: number;
      lastActiveAt: string;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
      lawyerProfile: null | Record<string, unknown>; // expand later when you have the shape
      firmProfile: null | Record<string, unknown>; // expand later when you have the shape
      practiceAreaLinks: unknown[];
    };
    session: {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    };
  };
}

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>("/api/v1/auth/login", payload),

  registerUser: (payload: LoginPayload & { fullName: string }) =>
    api.post<AuthResponse>("/api/v1/auth/register/user", payload),

  registerLawyer: (payload: Record<string, unknown>) =>
    api.post<AuthResponse>("/api/v1/auth/register/lawyer", payload),

  registerFirm: (payload: Record<string, unknown>) =>
    api.post<AuthResponse>("/api/v1/auth/register/firm", payload),

  logout: () => api.post("/api/v1/auth/logout"),

  forgotPassword: (email: string) =>
    api.post("/api/v1/auth/forgot-password", { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post("/api/v1/auth/reset-password", { token, newPassword }),

  deleteAccount: () => api.delete("/api/v1/auth/account"),
};
