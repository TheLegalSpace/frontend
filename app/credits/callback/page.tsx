// app/credits/callback/page.tsx
"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import CreditsCallbackContent from "./CreditsCallbackContent";

export default function CreditsCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <Loader2 size={28} className="animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-[14px] text-gray-600">Loading…</p>
          </div>
        </div>
      }
    >
      <CreditsCallbackContent />
    </Suspense>
  );
}