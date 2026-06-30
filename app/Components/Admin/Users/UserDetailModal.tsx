// app/Components/Admin/Users/UserDetailModal.tsx
// Figma source: Users-2.png (lawyer pending), Users-3.png (lawyer active),
// Users-4.png (lawyer suspended), Users-5.png (client active), Users-6.png (client suspended)
"use client";

import { useState } from "react";
import { X, User, Mail, Phone, GraduationCap, MapPin, Eye, Loader2 } from "lucide-react";
import { AdminUserDetail } from "@/app/types/admin";
import { useAdminUserActions } from "@/hooks/useAdmin";

interface Props {
  user: AdminUserDetail;
  onClose: () => void;
}

function Field({
  icon: Icon,
  value,
  locked = false,
}: {
  icon: React.ElementType;
  value: string;
  locked?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3.5 py-2.5">
      <Icon size={15} className="text-gray-400 shrink-0" />
      <span className="text-[13px] text-gray-700 truncate flex-1">{value}</span>
      {locked && <span className="text-gray-300 text-[13px]">🔒</span>}
    </div>
  );
}

export default function UserDetailModal({ user, onClose }: Props) {
  const { approve, reject, suspend, reactivate } = useAdminUserActions(user.id);
  const [pending, setPending] = useState<string | null>(null);

  const isLawyerOrFirm = user.userType === "Lawyer" || user.userType === "Law Firm";

  async function run(action: "approve" | "reject" | "suspend" | "reactivate") {
    setPending(action);
    try {
      if (action === "approve") await approve.mutateAsync();
      if (action === "reject") await reject.mutateAsync(undefined);
      if (action === "suspend") await suspend.mutateAsync(undefined);
      if (action === "reactivate") await reactivate.mutateAsync();
      onClose();
    } finally {
      setPending(null);
    }
  }

  const isBusy = pending !== null;

  return (
    <div className="fixed inset-0 z-1000000001 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm z-1000000000"
        onClick={!isBusy ? onClose : undefined}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 z-1000000000 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 text-[13px] font-medium text-gray-700">
            {user.userType}
          </span>
          <button
            onClick={onClose}
            disabled={isBusy}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <Field icon={User} value={user.firstName} />
          <Field icon={User} value={user.lastName} />
        </div>

        <div className="mb-3">
          <Field icon={Mail} value={user.email} locked />
        </div>

        {isLawyerOrFirm && (
          <>
            <div className="mb-1.5">
              <Field icon={Phone} value={user.phone ?? "—"} />
            </div>
            <p className="text-[11px] text-gray-400 mb-3">
              Your number will remain confidential and will only be shared if
              you choose to do so.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field icon={GraduationCap} value={user.yearOfCall ?? "—"} />
              <Field icon={MapPin} value={user.jurisdiction ?? "—"} />
            </div>

            {user.callToBarDocument && (
              <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3.5 py-2.5 mb-5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-8 h-8 rounded bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    PDF
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] text-gray-800 truncate">
                      {user.callToBarDocument.name}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {user.callToBarDocument.sizeKb} KB
                    </p>
                  </div>
                </div>
                <a
                  href={user.callToBarDocument.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-gray-700"
                >
                  <Eye size={16} />
                </a>
              </div>
            )}
          </>
        )}

        <div className={isLawyerOrFirm ? "" : "mt-5"}>
          {user.status === "Under Review" && isLawyerOrFirm && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => run("approve")}
                disabled={isBusy}
                className="py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {pending === "approve" && <Loader2 size={14} className="animate-spin" />}
                Approve Lawyer
              </button>
              <button
                onClick={() => run("reject")}
                disabled={isBusy}
                className="py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {pending === "reject" && <Loader2 size={14} className="animate-spin" />}
                Reject Lawyer
              </button>
            </div>
          )}

          {user.status === "Active" && (
            <button
              onClick={() => run("suspend")}
              disabled={isBusy}
              className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {pending === "suspend" && <Loader2 size={14} className="animate-spin" />}
              Suspend {isLawyerOrFirm ? "Lawyer" : "Client"}
            </button>
          )}

          {user.status === "Suspended" && (
            <button
              onClick={() => run("reactivate")}
              disabled={isBusy}
              className="w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {pending === "reactivate" && <Loader2 size={14} className="animate-spin" />}
              Re-activate {isLawyerOrFirm ? "Lawyer" : "Client"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
