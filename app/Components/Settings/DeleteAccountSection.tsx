// components/settings/DeleteAccountSection.tsx
"use client";

import { useState } from "react";
import { Trash2, X, Loader2 } from "lucide-react";
import { useDeleteAccount } from "@/hooks/useSettings";
import { useAuth } from "@/app/context/AuthContext";

export default function DeleteAccountSection() {
  const [showModal, setShowModal] = useState(false);
  const deleteAccount = useDeleteAccount();
  const { logout } = useAuth();

  const handleDelete = async () => {
    try {
      await deleteAccount.mutateAsync();
      await logout();
    } catch (err) {
      console.error("Delete account failed:", err);
    }
  };

  return (
    <>
      <div className="py-6">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-2">
          Delete Account
        </h2>
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-gray-600 flex-1 pr-4">
            This action will permanently remove your account and profile from
            TheLegalSpace.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
            aria-label="Delete account"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Confirm modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>

            <h3 className="text-[16px] font-semibold text-gray-900 mb-2">
              Are you sure?
            </h3>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
              This will permanently delete your account and all associated data.
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowModal(false)}
                disabled={deleteAccount.isPending}
                className="w-full py-3 border border-gray-200 rounded-xl text-[13px] font-medium text-gray-700 hover:bg-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteAccount.isPending}
                className="w-full py-3 bg-red-600 rounded-xl text-[13px] font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteAccount.isPending && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                {deleteAccount.isPending ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
