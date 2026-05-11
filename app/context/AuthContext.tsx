// context/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  AuthResponse,
  authService,
  LoginPayload,
} from "@/services/auth.services";

// context/AuthContext.tsx

// context/AuthContext.tsx

interface AuthContextType {
  user: AuthResponse["data"]["account"] | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  loginWithGoogle: (idToken: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse["data"]["account"] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true); // ← must start as true
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // Corrupted data — clear it
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      }
    } else {
      if (
        window.location.pathname !== "/signin" &&
        window.location.pathname !== "/"
      ) {
        router.push("/signin");
      }
    }

    setIsLoading(false); // ← always runs, even if no token
  }, []);

  const login = async (payload: LoginPayload) => {
    const response = await authService.login(payload);
    const { account, session } = response.data.data; // ← data.data because axios wraps in .data too

    localStorage.setItem("accessToken", session.accessToken);
    localStorage.setItem("refreshToken", session.refreshToken);
    localStorage.setItem("user", JSON.stringify(account));
    setUser(account);
  };
  const loginWithGoogle = async (idToken: string, fullName: string) => {
    const response = await authService.login({
      authProvider: "google",
      idToken,
      fullName,
    });
    const { account, session } = response.data.data;

    localStorage.setItem("accessToken", session.accessToken);
    localStorage.setItem("refreshToken", session.refreshToken);
    localStorage.setItem("user", JSON.stringify(account));
    setUser(account);
  };
  const logout = async () => {
    await authService.logout().catch(() => {});
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    if (typeof window !== "undefined") window.location.href = "/";
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
