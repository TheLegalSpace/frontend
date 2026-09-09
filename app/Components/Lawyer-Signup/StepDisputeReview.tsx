// app/Components/Lawyer-Signup/StepDisputeReview.tsx
"use client";

import { useRouter } from "next/navigation";

export default function StepDisputeReview() {
  const router = useRouter();

  return (
    <div className="w-full max-w-md">
      <h2 className="text-[28px] sm:text-[32px] font-semibold text-gray-900 mb-2 font-dmSans leading-tight">
        Your dispute is under review
      </h2>
      <p className="text-[14px] text-gray-500 mb-8 font-dmSans leading-relaxed">
        Your dispute has been submitted successfully and is currently under
        review. We&apos;ll notify you once verification is complete and your
        dispute has been resolved.
      </p>
      <button
        onClick={() => router.replace("/dashboard/feeds")}
        className="w-full py-3.5 bg-[#1A56DB] text-white text-[14px] font-medium rounded-xl hover:bg-[#1648b8] transition-colors font-dmSans"
      >
        Continue
      </button>
    </div>
  );
}
