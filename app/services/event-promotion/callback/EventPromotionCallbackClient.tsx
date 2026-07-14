// app/services/event-promotion/callback/EventPromotionCallbackClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { verifyEventPromotionPayment } from "@/services/servicesApi.services";

type Status = "verifying" | "success" | "failed";

export default function EventPromotionCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("Confirming your payment…");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const reference = searchParams.get("reference") ?? searchParams.get("trxref");

    (async () => {
      if (!reference) {
        setStatus("failed");
        setMessage("Missing payment reference. Please contact support if you were charged.");
        return;
      }

      try {
        const res = await verifyEventPromotionPayment(reference);
        const sr = res?.data;

        if (sr?.paymentStatus === "paid") {
          setStatus("success");
          setMessage(
            "Payment confirmed! Your event is now pending TLS review before it goes live."
          );
        } else {
          // Verified but not marked paid — Paystack said not-success, or
          // this reference belongs to something else. Backend already
          // guards these cases and throws, so this branch is a fallback.
          setStatus("failed");
          setMessage("We couldn't confirm this payment. If you were charged, contact support.");
        }
      } catch {
        setStatus("failed");
        setMessage("We couldn't confirm this payment. If you were charged, contact support.");
      }
    })();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      {status === "verifying" && (
        <>
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <p className="text-[14px] text-gray-500">{message}</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 className="w-10 h-10 text-green-500" />
          <p className="text-[15px] font-medium text-gray-900">Payment successful</p>
          <p className="text-[13px] text-gray-500 max-w-sm">{message}</p>
          <button
            onClick={() => router.replace("/dashboard/services")}
            className="mt-2 rounded-xl bg-blue-600 text-white text-[13px] font-medium px-5 py-2.5 hover:bg-blue-700 transition"
          >
            Go to my requests
          </button>
        </>
      )}

      {status === "failed" && (
        <>
          <XCircle className="w-10 h-10 text-red-500" />
          <p className="text-[15px] font-medium text-gray-900">Payment not confirmed</p>
          <p className="text-[13px] text-gray-500 max-w-sm">{message}</p>
          <button
            onClick={() => router.replace("/dashboard/services")}
            className="mt-2 rounded-xl border border-gray-200 text-gray-700 text-[13px] font-medium px-5 py-2.5 hover:border-gray-300 transition"
          >
            Back to my requests
          </button>
        </>
      )}
    </div>
  );
}