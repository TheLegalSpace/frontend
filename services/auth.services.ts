// services/auth.service.ts
import { api } from "./api";

export interface LoginPayload {
  authProvider: "email" | "google";
  email?: string;
  password?: string;
  idToken?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: "USER" | "LAWYER" | "FIRM" | "ADMIN";
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