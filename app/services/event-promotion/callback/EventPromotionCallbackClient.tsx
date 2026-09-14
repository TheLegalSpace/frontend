// app/services/event-promotion/callback/EventPromotionCallbackClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { verifyEventPromotionPayment } from "@/services/servicesApi.services";

type Status = "verifying" | "success" | "failed";

interface EventData {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  status: string;
  coverUrl?: string | null;
}

interface ServiceRequestData {
  id: string;
  type: string;
  status: string;
  paymentStatus: string;
  payload?: {
    title?: string;
    address?: string;
    startAt?: string;
    endAt?: string;
    [key: string]: unknown;
  };
  event?: EventData;
  [key: string]: unknown;
}

/** Map backend error messages to user-friendly explanations. */
function friendlyError(msg: string): string {
  const lower = msg.toLowerCase();

  if (lower.includes("payment was not successful")) {
    return "Your payment was not successful. Please try again or contact your bank if you were charged.";
  }
  if (lower.includes("not for an event promotion")) {
    return "This payment reference does not match an event promotion. Please verify you used the correct link.";
  }
  if (lower.includes("do not own")) {
    return "This payment was made with a different account. Please log in with the correct account.";
  }
  if (lower.includes("reference is required")) {
    return "No payment reference was provided. If you were charged, please contact support.";
  }
  if (lower.includes("paystack")) {
    return "We could not verify this payment with our payment provider right now. Please try again or contact support if you were charged.";
  }
  // Fallback
  return "We couldn't confirm this payment. If you were charged, please contact support.";
}

/** Format a date string to a readable format (e.g. "Jul 15, 2026"). */
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function EventPromotionCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("Confirming your payment…");
  const [eventData, setEventData] = useState<EventData | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const reference =
      searchParams.get("reference") ?? searchParams.get("trxref");

    (async () => {
      if (!reference) {
        setStatus("failed");
        setMessage(
          "Missing payment reference. Please contact support if you were charged.",
        );
        return;
      }

      try {
        const res = await verifyEventPromotionPayment(reference);
        const sr = res?.data as ServiceRequestData | undefined;

        if (sr?.paymentStatus === "paid") {
          // Extract event details from the response
          const ev = sr.event ?? (sr.payload as EventData | undefined) ?? null;
          setEventData(ev);
          setStatus("success");

          const eventTitle = ev?.title || sr.payload?.title || "your event";
          setMessage(
            `Payment confirmed! "${eventTitle}" is now pending TLS review before it goes live.`,
          );
        } else {
          setStatus("failed");
          setMessage(friendlyError("Payment was not successful"));
        }
      } catch (err: unknown) {
        const axiosErr = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        const backendMsg =
          axiosErr?.response?.data?.message ?? axiosErr?.message ?? "";
        setStatus("failed");
        setMessage(friendlyError(backendMsg));
      }
    })();
  }, [searchParams]);

  const eventTitle = eventData?.title;
  const eventStart = eventData?.startAt ? formatDate(eventData.startAt) : null;
  const eventEnd = eventData?.endAt ? formatDate(eventData.endAt) : null;

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
          <p className="text-[15px] font-medium text-gray-900">
            Payment successful
          </p>
          <p className="text-[13px] text-gray-500 max-w-sm">{message}</p>

          {eventTitle && (
            <div className="mt-2 rounded-xl border border-gray-100 bg-gray-50 px-5 py-3 text-left max-w-sm w-full">
              {eventTitle && (
                <p className="text-[13px] font-medium text-gray-900">
                  {eventTitle}
                </p>
              )}
              {(eventStart || eventEnd) && (
                <p className="text-[12px] text-gray-400 mt-1">
                  {eventStart} – {eventEnd}
                </p>
              )}
              {eventData?.status && (
                <span className="inline-block mt-2 rounded-full bg-yellow-100 text-yellow-800 text-[11px] font-medium px-2.5 py-0.5">
                  {eventData.status === "pending_review"
                    ? "Pending Review"
                    : eventData.status}
                </span>
              )}
            </div>
          )}

          <button
            onClick={() => router.replace("/dashboard/TLS-Services")}
            className="mt-2 rounded-xl bg-blue-600 text-white text-[13px] font-medium px-5 py-2.5 hover:bg-blue-700 transition"
          >
            Go to my requests
          </button>
        </>
      )}

      {status === "failed" && (
        <>
          <XCircle className="w-10 h-10 text-red-500" />
          <p className="text-[15px] font-medium text-gray-900">
            Payment not confirmed
          </p>
          <p className="text-[13px] text-gray-500 max-w-sm">{message}</p>
          <button
            onClick={() => router.replace("/dashboard/TLS-Services")}
            className="mt-2 rounded-xl border border-gray-200 text-gray-700 text-[13px] font-medium px-5 py-2.5 hover:border-gray-300 transition"
          >
            Back to my requests
          </button>
        </>
      )}
    </div>
  );
}
