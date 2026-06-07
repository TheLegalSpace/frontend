// lib/errors.ts

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function parseApiError(err: unknown): {
  message: string;
  status: number;
  code: string;
} {
  if (typeof err === "object" && err !== null) {
    const axiosErr = err as any;
    const status = axiosErr?.response?.status ?? 0;
    const data = axiosErr?.response?.data;
    const message =
      data?.message ??
      axiosErr?.message ??
      "Something went wrong. Please try again.";

    const code = (() => {
      if (status === 404) return "NOT_FOUND";
      if (status === 400) return "BAD_REQUEST";
      if (status === 401) return "UNAUTHORIZED";
      if (status === 403) return "FORBIDDEN";
      if (status === 409) return "CONFLICT";
      if (status === 422) return "VALIDATION_ERROR";
      if (status === 429) return "RATE_LIMITED";
      if (status >= 500) return "SERVER_ERROR";
      if (!status) return "NETWORK_ERROR";
      return "UNKNOWN_ERROR";
    })();

    return { message, status, code };
  }

  return {
    message: "Something went wrong. Please try again.",
    status: 0,
    code: "UNKNOWN_ERROR",
  };
}

export const ERROR_MESSAGES: Record<string, string> = {
  NOT_FOUND: "Account not found. Please check your details.",
  BAD_REQUEST: "Invalid request. Please check your details.",
  UNAUTHORIZED: "Your session has expired. Please sign in again.",
  FORBIDDEN: "You don't have permission to do this.",
  CONFLICT: "An account with this email already exists.",
  VALIDATION_ERROR: "Please check your details and try again.",
  RATE_LIMITED: "Too many attempts. Please wait a moment and try again.",
  SERVER_ERROR: "Our servers are having issues. Please try again shortly.",
  NETWORK_ERROR: "No internet connection. Please check your network.",
  UNKNOWN_ERROR: "Something went wrong. Please try again.",
};

export function getErrorMessage(err: unknown): string {
  const { message, code } = parseApiError(err);
  if (message && message !== "Something went wrong. Please try again.") {
    return message;
  }
  return ERROR_MESSAGES[code] ?? message;
}