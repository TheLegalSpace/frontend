// context/AuthContext.tsx
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
  loginWithGoogle: (
    idToken: string,
    fullName: string,
    avatarUrl?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse["data"]["account"] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter(); // ✅ router at top level of component

  // Restore session from localStorage on mount
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
      }

      // ✅ Optionally refresh from API to get latest role
      profileService
        .getMe()
        .then((r) => {
          const fresh = r.data.data;
          localStorage.setItem("user", JSON.stringify(fresh));
          setUser(fresh); // ← overrides with latest from server
        })
        .catch(() => {}) // silent fail — cached data still works
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
    setIsLoading(false);
  }, []);

  // Listen for logout events from api.ts interceptor
  useEffect(() => {
    const handleAuthLogout = () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
      router.replace("/signin"); // ✅ navigate from event too
    };
    window.addEventListener("auth:logout", handleAuthLogout);
    return () => window.removeEventListener("auth:logout", handleAuthLogout);
  }, []);

  const saveSession = (data: AuthResponse["data"]) => {
    const { account, session } = data;
    localStorage.setItem("accessToken", session.accessToken);
    localStorage.setItem("refreshToken", session.refreshToken);
    localStorage.setItem("user", JSON.stringify(account));
    setUser(account);
  };

  const classifyError = (err: unknown): AuthError => {
    const { status, message, code } = parseApiError(err);

    if (code === "NETWORK_ERROR") {
      return {
        code: "NETWORK_ERROR",
        message: "No internet connection. Please check your network.",
      };
    }
    if (status >= 500) {
      return {
        code: "SERVER_ERROR",
        message: "Our servers are having issues. Please try again.",
      };
    }
    if (
      status === 404 ||
      message.toLowerCase().includes("account not found") ||
      message.toLowerCase().includes("not found")
    ) {
      return {
        code: "ACCOUNT_NOT_FOUND",
        message: "Account not found. Please register first.",
      };
    }
    if (
      status === 401 ||
      message.toLowerCase().includes("invalid") ||
      message.toLowerCase().includes("incorrect") ||
      message.toLowerCase().includes("wrong password")
    ) {
      return {
        code: "INVALID_CREDENTIALS",
        message: "Incorrect email or password.",
      };
    }
    if (
      status === 409 ||
      message.toLowerCase().includes("already exists") ||
      message.toLowerCase().includes("conflict")
    ) {
      return {
        code: "ACCOUNT_EXISTS",
        message: "An account with this email already exists.",
      };
    }

    return {
      code: "UNKNOWN_ERROR",
      message: message || "Something went wrong. Please try again.",
    };
  };

  // Fetch Google avatar and upload to backend
  const syncGoogleAvatar = async (googleAvatarUrl: string): Promise<void> => {
    const imageResponse = await fetch(googleAvatarUrl);
    const blob = await imageResponse.blob();
    const file = new File([blob], "avatar.jpg", { type: blob.type });
    await profileService.uploadAvatar(file);
    setUser((prev) => (prev ? { ...prev, avatarUrl: googleAvatarUrl } : prev));
  };

  const login = async (payload: LoginPayload): Promise<void> => {
    try {
      const response = await authService.login(payload);

      if (!response?.data?.data) {
        throw {
          code: "UNKNOWN_ERROR",
          message:
            response?.data?.message ?? "Unexpected response from server.",
        };
      }

      saveSession(response.data.data);
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "code" in err) {
        throw err; // already an AuthError
      }
      const authError = classifyError(err);
      console.error("Login error:", authError);
      throw authError;
    }
  };

  const loginWithGoogle = async (
    idToken: string,
    fullName: string,
    avatarUrl?: string,
  ): Promise<void> => {
    const attemptLogin = async () => {
      const response = await authService.login({
        authProvider: "google",
        idToken,
        fullName,
      });
      return response;
    };

    const handlePostLogin = async (
      data: AuthResponse["data"],
      googleAvatarUrl?: string,
    ) => {
      saveSession(data);

      // Sync avatar for any user with no avatar
      const hasNoAvatar = !data.account.avatarUrl;
      if (googleAvatarUrl && hasNoAvatar) {
        try {
          console.log("Syncing Google avatar...");
          await syncGoogleAvatar(googleAvatarUrl);
        } catch (avatarErr) {
          console.warn("Avatar sync failed — non-critical:", avatarErr);
        }
      }
    };

    try {
      // Existing user
      const response = await attemptLogin();
      await handlePostLogin(response.data.data, avatarUrl);
    } catch (err: unknown) {
      const authError = classifyError(err);
      console.log("Google login error:", authError);

      // Account doesn't exist — auto register
      if (authError.code === "ACCOUNT_NOT_FOUND") {
        try {
          console.log("Auto-registering:", fullName);

          await authService.registerUser({
            authProvider: "google",
            idToken,
            fullName,
          });

          console.log("Registered — logging in...");
          const response = await attemptLogin();
          await handlePostLogin(response.data.data, avatarUrl);
        } catch (registerErr: unknown) {
          const registerError = classifyError(registerErr);
          console.error("Registration error:", registerError);

          // Race condition — account created between login and register
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
    } catch {
      // best effort
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
      router.replace("/signin"); // ✅ navigate directly — don't rely on ProtectedRoute
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
