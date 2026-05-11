// app/(dashboard)/layout.tsx
"use client"; // remove this if present

// ❌ Remove this wrong import entirely
// import { dynamic } from "next/dynamic";

// ✅ This is the correct way — just export it as a const
export const dynamic = "force-dynamic";

import Sidebar from "../Components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
}
