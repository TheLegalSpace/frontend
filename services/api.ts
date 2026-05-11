// services/api.ts
"use client";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { useRouter } from "next/navigation";

export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + process.env.NEXT_PUBLIC_API_PATH!,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;

  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.data?.error === true) {
      const message = response.data?.message ?? "Something went wrong";

      // Token errors specifically
      if (
        message.toLowerCase().includes("invalid or expired token") ||
        message.toLowerCase().includes("unauthorized")
      ) {
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(new Error(message));
      }
    }
    return response;
  },
    async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
          { refreshToken }
        );

        // Check if refresh itself returned an error
        if (data?.error === true) throw new Error(data.message);

        localStorage.setItem("accessToken", data.data.session.accessToken);
        localStorage.setItem("refreshToken", data.data.session.refreshToken);
        original.headers["Authorization"] = `Bearer ${data.data.session.accessToken}`;
        return api(original);
      } catch {
        // Refresh failed — full logout
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth:logout"));
      }
    }
  }
);
