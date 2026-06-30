// app/admin/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../Components/Admin/AdminSidebar";
import { useAuth } from "../context/AuthContext";
import { Providers } from "../providers";

export const dynamic = "force-dynamic";

function hasSession() {
  return typeof window !== "undefined" && !!localStorage.getItem("accessToken");
}

export default function AdminLayout({
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
    if (user.role !== "ADMIN") {
      router.replace("/dashboard/feeds");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !hasSession() || user.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="w-7 h-7 rounded-full border-2 border-gray-300 border-t-black animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Providers>
        <AdminSidebar />
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </Providers>
    </div>
  );
}
