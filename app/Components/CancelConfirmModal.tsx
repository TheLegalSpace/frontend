// components/requests/CancelConfirmModal.tsx
"use client";

import { Loader2, X, XCircle } from "lucide-react";

interface CancelConfirmModalProps {
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}

export default function CancelConfirmModal({
  onConfirm,
  onClose,
  isLoading,
}: CancelConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5 text-gray-600" />
        </button>

        {/* Icon */}
        <div className="mb-4">
          <XCircle className="w-8 h-8 text-red-500" strokeWidth={1.5} />
        </div>

        {/* Content */}
        <h3 className="text-[16px] font-semibold text-gray-900 mb-2">
          Are you sure?
        </h3>
        <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
          This will withdraw your request from the lawyer. Cancelling does not
          restore your match allowance, so you will need a new match before you
          can send another request for this type of matter.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-3 border border-gray-200 rounded-xl text-[13px] font-medium text-gray-900 hover:bg-white transition-colors disabled:opacity-50"
          >
            Keep Request
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full py-3 bg-red-600 rounded-xl text-[13px] font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isLoading ? "Cancelling..." : "Cancel Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
