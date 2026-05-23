// context/AuthContext.tsx — full updated version
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  AuthResponse,
  authService,
  LoginPayload,
} from "@/services/auth.services";
import { profileService } from "@/services/profile.services";
import { parseApiError } from "@/lib/error";
import { useRouter } from "next/navigation";

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_NOT_FOUND"
  | "ACCOUNT_EXISTS"
  | "REGISTRATION_FAILED"
  | "SESSION_EXPIRED"
  | "NETWORK_ERROR"
  | "SERVER_ERROR"
  | "UNKNOWN_ERROR";

export interface AuthError {
  code: AuthErrorCode;
  message: string;
}

interface AuthContextType {
  user: AuthResponse["data"]["account"] | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  loginWithGoogle: (idToken: string, fullName: string, avatarUrl?: string) => Promise<void>;
  logout: () => Promise<void>;
  saveSession: (data: AuthResponse["data"]) => void; // ✅ exposed for register flow
}

const AuthContext = createContext<AuthContextType | null>(null);

// ✅ Routing helper — shared between login and register
export function getPostAuthRoute(account: AuthResponse["data"]["account"]): string {
   if (account.role === "PENDING_PROFESSIONAL") {
    return "/register/lawyer-setup";
  }
  if (account.role === "LAWYER" && !account.lawyerProfile) {
    return "/register/lawyer-setup";
  }
  if (account.role === "FIRM" && !account.firmProfile) {
    return "/register/firm-setup";
  }
  return "/dashboard/feeds";
}
 
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse["data"]["account"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setIsLoading(false);
        return;
      }

      profileService
        .getMe()
        .then((r) => {
          const fresh = r.data.data;
          localStorage.setItem("user", JSON.stringify(fresh));
          setUser(fresh);
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleAuthLogout = () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
      router.replace("/signin");
    };
    window.addEventListener("auth:logout", handleAuthLogout);
    return () => window.removeEventListener("auth:logout", handleAuthLogout);
  }, [router]);

  // ✅ Exposed so RegisterFlow can call it after OTP verify
  const saveSession = (data: AuthResponse["data"]) => {
    const { account, session } = data;
    localStorage.setItem("accessToken", session.accessToken);
    localStorage.setItem("refreshToken", session.refreshToken);
    localStorage.setItem("user", JSON.stringify(account));
    setUser(account);
  };

  const clearSession = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  const classifyError = (err: unknown): AuthError => {
    const { status, message, code } = parseApiError(err);
    if (code === "NETWORK_ERROR") return { code: "NETWORK_ERROR", message: "No internet connection." };
    if (status >= 500) return { code: "SERVER_ERROR", message: "Server error. Please try again." };
    if (status === 404 || message.toLowerCase().includes("not found")) return { code: "ACCOUNT_NOT_FOUND", message: "Account not found." };
    if (status === 401 || message.toLowerCase().includes("invalid") || message.toLowerCase().includes("incorrect")) return { code: "INVALID_CREDENTIALS", message: "Incorrect email or password." };
    if (status === 409 || message.toLowerCase().includes("already exists")) return { code: "ACCOUNT_EXISTS", message: "An account with this email already exists." };
    return { code: "UNKNOWN_ERROR", message: message || "Something went wrong." };
  };

  const syncGoogleAvatar = async (googleAvatarUrl: string) => {
    try {
      const imageResponse = await fetch(googleAvatarUrl);
      const blob = await imageResponse.blob();
      const file = new File([blob], "avatar.jpg", { type: blob.type });
      await profileService.uploadAvatar(file);
      setUser((prev) => prev ? { ...prev, avatarUrl: googleAvatarUrl } : prev);
    } catch {
      console.warn("Avatar sync failed");
    }
  };

  const login = async (payload: LoginPayload): Promise<void> => {
    try {
      const response = await authService.login(payload);
      if (!response?.data?.data) throw { code: "UNKNOWN_ERROR", message: "Unexpected response." };

      const data = response.data.data;
      saveSession(data);

      // ✅ Route based on profile completion — handles incomplete setup
      const route = getPostAuthRoute(data.account);
      router.replace(route);
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "code" in err) throw err;
      throw classifyError(err);
    }
  };

  const loginWithGoogle = async (
    idToken: string,
    fullName: string,
    avatarUrl?: string,
  ): Promise<void> => {
    const attemptLogin = async () =>
      authService.login({ authProvider: "google", idToken, fullName });

    const handlePostLogin = async (data: AuthResponse["data"], googleAvatarUrl?: string) => {
      saveSession(data);
      if (googleAvatarUrl && !data.account.avatarUrl) {
        await syncGoogleAvatar(googleAvatarUrl);
      }
      // ✅ Route based on profile completion
      const route = getPostAuthRoute(data.account);
      router.replace(route);
    };

    try {
      const response = await attemptLogin();
      await handlePostLogin(response.data.data, avatarUrl);
    } catch (err: unknown) {
      const authError = classifyError(err);
      if (authError.code === "ACCOUNT_NOT_FOUND") {
        try {
          await authService.registerUser({ authProvider: "google", idToken, fullName });
          const response = await attemptLogin();
          await handlePostLogin(response.data.data, avatarUrl);
        } catch (registerErr: unknown) {
          const registerError = classifyError(registerErr);
          if (registerError.code === "ACCOUNT_EXISTS") {
            try {
              const response = await attemptLogin();
              await handlePostLogin(response.data.data, avatarUrl);
            } catch (finalErr: unknown) {
              throw classifyError(finalErr);
            }
            return;
          }
          throw registerError;
        }
        return;
      }
      if (authError.code === "SESSION_EXPIRED") {
        window.dispatchEvent(new Event("auth:logout"));
        throw authError;
      }
      throw authError;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch {}
    finally {
      clearSession();
      router.replace("/signin");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, logout, saveSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};