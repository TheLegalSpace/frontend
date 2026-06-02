"use client";

import { useState } from "react";
import { X, Star, Loader2 } from "lucide-react";
import { messagesService } from "@/services/messages.services";

interface Props {
  conversationId: string;
  participantName: string;
  /** "client" = user reviewing the lawyer | "lawyer" = lawyer reviewing the client */
  reviewerRole: "client" | "lawyer";
  onClose: () => void;
  onSubmitted?: () => void;
}

export default function ReviewModal({
  conversationId,
  participantName,
  reviewerRole,
  onClose,
  onSubmitted,
}: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title =
    reviewerRole === "client"
      ? "Rate this lawyer"
      : "Rate this client interaction";

  const subtitle =
    reviewerRole === "client"
      ? `Share your experience with ${participantName}. Your feedback helps others find trusted legal help.`
      : "Your feedback is seen by verified lawyers on TheLegalSpace, helping them make informed choices.";

  async function handleSubmit() {
    if (rating === 0) {
      setError("Please select a star rating before submitting.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await messagesService.submitReview(conversationId, { rating, body });
      setSubmitted(true);
      onSubmitted?.();
    } catch (err) {
      console.error("Failed to submit review:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 font-['Geist']">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
          aria-label="Close"
        >
          <X size={15} className="text-gray-500" />
        </button>

        {submitted ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <Star size={22} className="text-green-600 fill-green-600" />
            </div>
            <h2 className="text-[18px] font-medium font-['Instrument_Serif'] text-gray-900">
              Review submitted
            </h2>
            <p className="text-[13px] text-gray-500">
              Thank you for your feedback.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2 rounded-full bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-700 transition"
            >
              Done
            </button>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <h2 className="text-[18px] font-medium font-['Instrument_Serif'] text-gray-900 mb-1">
              {title}
            </h2>
            <p className="text-[12px] text-gray-500 leading-relaxed mb-5">
              {subtitle}
            </p>

            {/* Stars */}
            <div className="flex items-center gap-1.5 mb-5">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hovered || rating);
                return (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      size={28}
                      className={
                        active
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                );
              })}
            </div>

            {/* Text area */}
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type a message..."
              rows={5}
              className="w-full px-3 py-2.5 text-[13px] bg-white border border-gray-200 rounded-xl outline-none focus:border-gray-300 placeholder:text-gray-400 resize-none leading-relaxed"
            />

            {/* Error */}
            {error && (
              <p className="text-[12px] text-red-500 mt-2">{error}</p>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              className="mt-4 w-full py-2.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 text-[13px] font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Submit
            </button>
          </>
        )}
      </div>
    </div>
  );
}