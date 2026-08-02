// app/Components/Feed/ReportPostModal.tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useReportReasons } from "@/hooks/useReport";
import { submitPostReport } from "@/services/report.services";

interface ReportPostModalProps {
  postId: string;
  onClose: () => void;
  onReported: (alreadyReported: boolean, message: string) => void;
}

export default function ReportPostModal({
  postId,
  onClose,
  onReported,
}: ReportPostModalProps) {
  const { data: reasons = [], isLoading: reasonsLoading } = useReportReasons();
  const [selected, setSelected] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedReason = reasons.find((r) => r.value === selected);
  const requiresDetails = selectedReason?.requiresDetails ?? false;
  const canSubmit =
    !!selected && (!requiresDetails || details.trim().length > 0) && !submitting;

  async function handleSubmit() {
    if (!selected) return;
    if (requiresDetails && !details.trim()) {
      setError("Please tell us what's wrong with this post");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await submitPostReport(postId, {
        reason: selected,
        ...(details.trim() ? { details: details.trim() } : {}),
      });

      onReported(
        result.alreadyReported,
        result.alreadyReported
          ? "You've already reported this post. Our team is reviewing it."
          : "Thanks for letting us know. We'll review this post."
      );
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMessage = err?.response?.data?.message;

      if (status === 400) {
        setError(serverMessage ?? "You can't report this post.");
      } else if (status === 404) {
        setError("Post not found");
      } else if (status === 429) {
        setError("You've reported a lot of posts recently, try again later");
      } else {
        setError(serverMessage ?? "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-lg font-semibold text-gray-900">Report Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <p className="px-5 pt-1 text-sm text-gray-500">
          Report posts that violate community guidelines or contain
          inappropriate content.
        </p>

        <div className="px-5 py-4 max-h-72 overflow-y-auto">
          {reasonsLoading ? (
            <div className="text-sm text-gray-400 py-4 text-center">
              Loading reasons...
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {reasons.map((reason) => (
                <label
                  key={reason.value}
                  className={`flex items-start gap-3 rounded-lg p-3 cursor-pointer border transition ${
                    selected === reason.value
                      ? "border-red-500 bg-red-50"
                      : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={reason.value}
                    checked={selected === reason.value}
                    onChange={() => {
                      setSelected(reason.value);
                      setError(null);
                    }}
                    className="mt-1 accent-red-600"
                  />
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-gray-900">
                      {reason.label}
                    </span>
                    <span className="block text-xs text-gray-500 mt-0.5">
                      {reason.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          )}

          {requiresDetails && (
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, 1000))}
              placeholder="Tell us what's wrong with this post"
              className="mt-3 w-full resize-none rounded-lg border border-gray-200 p-3 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-red-500"
              rows={3}
            />
          )}

          {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
        </div>

        <div className="flex border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 transition"
          >
            {submitting ? "Reporting..." : "Report Post"}
          </button>
        </div>
      </div>
    </div>
  );
}