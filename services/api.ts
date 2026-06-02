// services/api.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

type SessionTokens = {
  accessToken: string;
  refreshToken: string;
};

let refreshPromise: Promise<SessionTokens> | null = null;

function getStoredToken(key: "accessToken" | "refreshToken") {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

function saveSessionTokens(tokens: SessionTokens) {
  if (typeof window === "undefined") return;
  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);
}

function clearStoredSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

async function refreshSession(): Promise<SessionTokens> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getStoredToken("refreshToken");
    if (!refreshToken) throw new Error("No refresh token");

    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
      { refreshToken }
    );

    if (data?.error === true) throw new Error(data.message);

    const tokens = {
      accessToken: data.data.session.accessToken,
      refreshToken: data.data.session.refreshToken,
    };

    saveSessionTokens(tokens);
    return tokens;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + process.env.NEXT_PUBLIC_API_PATH!,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window === "undefined") return config;
  const token = getStoredToken("accessToken");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.data?.error === true) {
      const message = response.data?.message ?? "Something went wrong";
      if (
        message.toLowerCase().includes("invalid or expired token") ||
        message.toLowerCase().includes("unauthorized")
      ) {
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(new Error(message));
      }
    }
    return response; // ✅ Always return response on success
  },
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const session = await refreshSession();
        original.headers["Authorization"] = `Bearer ${session.accessToken}`;

        return api(original); // ✅ Retry original request, not reject
      } catch {
        clearStoredSession();
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(error); // ✅ Reject after failed refresh
      }
    }

    // ✅ CRITICAL — always reject so axios errors bubble up to AuthContext
    return Promise.reject(error);
  }
);
