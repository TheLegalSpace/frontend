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
  (response) => response,
  async (error) => {
    const original = error.config;
    var router = useRouter();
    // Auto-refresh token on 401
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
          { refreshToken },
        );

        localStorage.setItem("accessToken", data.data.session.accessToken);
        localStorage.setItem("refreshToken", data.data.session.refreshToken);
        original.headers["Authorization"] =
          `Bearer ${data.data.session.accessToken}`;
        return api(original);
      } catch {
        // Refresh failed — log out
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        router.push("/signin");
      }
    }

    return Promise.reject(error);
  },
);
