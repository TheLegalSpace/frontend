// app/(dashboard)/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../Components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { Providers } from "../providers";

export const dynamic = "force-dynamic";

function hasSession() {
  return typeof window !== "undefined" && !!localStorage.getItem("accessToken");
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user || !hasSession()) {
      router.replace("/");
      return;
    }
    if (user.role === "ADMIN") {
      router.replace("/admin");
    }
  }, [user, isLoading, router]);

  // Re-check auth when restored from browser back/forward cache
  useEffect(() => {
    const redirectIfUnauthenticated = () => {
      if (!hasSession()) {
        router.replace("/");
      }
    };

    window.addEventListener("pageshow", redirectIfUnauthenticated);
    window.addEventListener("popstate", redirectIfUnauthenticated);
    return () => {
      window.removeEventListener("pageshow", redirectIfUnauthenticated);
      window.removeEventListener("popstate", redirectIfUnauthenticated);
    };
  }, [router]);

  if (isLoading || !user || !hasSession()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="w-7 h-7 rounded-full border-2 border-gray-300 border-t-black animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Providers>
        <Sidebar />
        <main className="flex-1 min-w-0 md:pt-0">{children}</main>
      </Providers>
    </div>
  );
}
