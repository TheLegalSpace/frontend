"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { creditsService } from "@/services/credits.services";
import { useCreditsCache } from "@/hooks/useCredits";

export default function CreditsCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { invalidateCredits } = useCreditsCache();

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const reference = searchParams.get("reference");
    if (!reference) {
      setStatus("error");
      setMessage("Missing payment reference.");
      return;
    }

    creditsService
      .verifyPurchase(reference)
      .then(() => {
        invalidateCredits();
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err?.response?.data?.message ??
            "We couldn't verify this payment. If you were charged, your credits will still be added shortly."
        );
      });
  }, [searchParams, invalidateCredits]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        {status === "verifying" && (
          <>
            <Loader2 size={28} className="animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-[14px] text-gray-600">Confirming your payment…</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 size={32} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-[16px] font-semibold text-gray-900 mb-1">
              Credits added
            </h2>
            <p className="text-[13px] text-gray-500 mb-6">
              Your wallet has been topped up.
            </p>
            <button
              onClick={() => router.push("/dashboard/TLS-Research")}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition"
            >
              Back to Research
            </button>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle size={32} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-[16px] font-semibold text-gray-900 mb-1">
              Verification issue
            </h2>
            <p className="text-[13px] text-gray-500 mb-6">{message}</p>
            <button
              onClick={() => router.push("/dashboard/TLS-Research")}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition"
            >
              Back to Research
            </button>
          </>
        )}
      </div>
    </div>
  );
}