// services/api.ts
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";

type SessionTokens = {
  accessToken: string;
  refreshToken: string;
};

// Singleton refresh promise — all concurrent 401s wait on this,
// preventing multiple parallel refresh calls.
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

// Returns true when the backend says the token is invalid/expired,
// regardless of whether it used HTTP 200 or HTTP 401.
function isTokenError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("invalid or expired token") ||
    lower.includes("invalid token") ||
    lower.includes("token expired") ||
    lower.includes("jwt expired") ||
    lower.includes("unauthorized")
  );
}

async function refreshSession(): Promise<SessionTokens> {
  // If a refresh is already in-flight, reuse it.
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
    // Always clear so the next genuine expiry triggers a fresh refresh.
    refreshPromise = null;
  }
}

export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + process.env.NEXT_PUBLIC_API_PATH!,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ── Request interceptor: attach access token ──────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window === "undefined") return config;
  const token = getStoredToken("accessToken");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

// ── Response interceptor ──────────────────────────────────────────────────────
//
// ROOT CAUSE FIX:
// The backend returns HTTP 200 with { error: true, message: "invalid or expired token" }
// instead of a proper HTTP 401. The old code treated this as a logout event immediately,
// completely skipping the refresh-and-retry logic.
//
// Fix: when we detect a token error inside a 200 body, we synthetically convert it into
// the same retry flow used for real 401s — refresh the token and replay the request.
// Only if the refresh itself fails do we log the user out.
//
api.interceptors.response.use(
  async (response: AxiosResponse) => {
    // Backend returned HTTP 200 but signalled a token error in the body.
    if (response.data?.error === true) {
      const message: string = response.data?.message ?? "";

      if (isTokenError(message)) {
        const original = response.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Only attempt refresh once per request to avoid infinite loops.
        if (original._retry) {
          // Refresh already tried for this request and still getting token errors.
          clearStoredSession();
          window.dispatchEvent(new Event("auth:logout"));
          return Promise.reject(new Error(message));
        }

        original._retry = true;

        // Check if another concurrent request already refreshed the token.
        const sentAuthHeader = original.headers?.["Authorization"];
        const sentToken =
          typeof sentAuthHeader === "string"
            ? sentAuthHeader.split(" ")[1]
            : undefined;
        const currentToken = getStoredToken("accessToken");

        if (currentToken && sentToken && currentToken !== sentToken) {
          // Token was already refreshed by another request — just retry with new token.
          original.headers["Authorization"] = `Bearer ${currentToken}`;
          return api(original);
        }

        // Attempt a token refresh, then replay the original request.
        try {
          const session = await refreshSession();
          original.headers["Authorization"] = `Bearer ${session.accessToken}`;
          return api(original);
        } catch {
          clearStoredSession();
          window.dispatchEvent(new Event("auth:logout"));
          return Promise.reject(new Error(message));
        }
      }

      // Non-token business error in a 200 body — let callers handle it normally.
    }

    return response;
  },

  // HTTP-level errors (4xx / 5xx)
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      // If another concurrent request already refreshed the token, just retry.
      const authHeader = original.headers?.["Authorization"];
      const sentToken =
        typeof authHeader === "string"
          ? authHeader.split(" ")[1]
          : undefined;
      const currentToken = getStoredToken("accessToken");

      if (currentToken && sentToken && currentToken !== sentToken) {
        original.headers["Authorization"] = `Bearer ${currentToken}`;
        return api(original);
      }

      try {
        const session = await refreshSession();
        original.headers["Authorization"] = `Bearer ${session.accessToken}`;
        return api(original);
      } catch {
        clearStoredSession();
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);