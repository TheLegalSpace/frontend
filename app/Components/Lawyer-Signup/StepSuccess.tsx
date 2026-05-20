// components/lawyer-signup/StepSuccess.tsx
"use client";

import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function StepSuccess() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-10">
      <div className="max-w-sm w-full bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-green-500" strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="text-[18px] font-medium text-gray-900 mb-2">You're all set</h2>
        <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
          Your verification is complete. You can now start using your account.
        </p>
        <Link
          href="/dashboard/feeds"
          className="block w-full py-2.5 bg-[#1A56DB] text-white text-[13px] font-medium rounded-lg hover:bg-[#1648b8] transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}