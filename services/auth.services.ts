// services/auth.services.ts
import { api } from "./api";

export interface LoginPayload {
  authProvider: "email" | "google";
  email?: string;
  password?: string;
  idToken?: string;
  fullName?: string;
  role?: "USER" | "LAWYER" | "FIRM" | "ADMIN" | "PENDING_PROFESSIONAL";
}

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
      role: "USER" | "LAWYER" | "FIRM" | "ADMIN" | "PENDING_PROFESSIONAL";
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
      lawyerProfile: null | Record<string, unknown>;
      firmProfile: null | Record<string, unknown>;
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
    api.post<AuthResponse>("/auth/login", payload),

  registerUser: (payload: LoginPayload & { fullName: string }) =>
    api.post<AuthResponse>("/auth/register/user", payload),

  registerGoogleUser: (payload: LoginPayload & { fullName: string }) =>
    api.post<AuthResponse>("/auth/register/google", payload),

  registerLawyer: (payload: Record<string, unknown>) =>
    api.post<AuthResponse>("/auth/register/lawyer", payload),

  registerFirm: (payload: Record<string, unknown>) =>
    api.post<AuthResponse>("/auth/register/firm", payload),

  logout: () => api.post("/auth/logout"),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post("/auth/reset-password", { token, newPassword }),

  deleteAccount: () => api.delete("/auth/account"),
};