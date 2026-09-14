"use client";

import { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  UserX,
  RotateCcw,
  Clock,
} from "lucide-react";
import { useReportQueue, useTakeReportAction } from "@/hooks/useAdmin";
import type { ReportedPostItem, ReportActionPayload } from "@/app/types/admin";
import AdminPageHeader from "../shared/AdminPageHeader";
import StatCard from "../shared/StatCard";
import TablePagination from "../shared/TablePagination";
import { useToast } from "@/app/context/ToastContext";

type FilterStatus = "pending" | "actioned" | "dismissed";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max) + "\u2026" : text;
}

// ── Action Modal ──
function ActionModal({
  item,
  action,
  onClose,
}: {
  item: ReportedPostItem;
  action: "remove" | "dismiss";
  onClose: () => void;
}) {
  const { showSuccess, showError } = useToast();
  const mutation = useTakeReportAction();
  const [reason, setReason] = useState("");

  const handleSubmit = async () => {
    if (action === "remove" && !reason.trim()) {
      showError(
        "Please provide a reason — it will be sent to the post author.",
      );
      return;
    }
    try {
      const payload: ReportActionPayload = {
        action,
        reason: reason.trim() || "Reviewed by admin",
      };
      await mutation.mutateAsync({ postId: item.post.id, payload });
      showSuccess(
        action === "remove"
          ? "Post removed and notifications sent."
          : "Reports dismissed — post restored.",
      );
      onClose();
    } catch (err: any) {
      showError(
        err?.response?.data?.message ?? err?.message ?? "Action failed.",
      );
    }
  };

  const isRemove = action === "remove";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isRemove ? "bg-red-50" : "bg-green-50"
            }`}
          >
            {isRemove ? (
              <UserX className="w-5 h-5 text-red-500" />
            ) : (
              <RotateCcw className="w-5 h-5 text-green-500" />
            )}
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">
              {isRemove ? "Remove this post?" : "Dismiss reports?"}
            </h3>
            <p className="text-[12px] text-gray-500">
              {isRemove
                ? "The post will be deleted and the author notified."
                : "Reports cleared, auto-hide lifted. Post back in circulation."}
            </p>
          </div>
        </div>

        {/* Post preview */}
        <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-[#E5E7EB]">
          <p className="text-[12px] font-medium text-gray-900 mb-1">
            {item.post.author.fullName}
          </p>
          <p className="text-[12px] text-gray-600 line-clamp-3">
            {item.post.body}
          </p>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
            <span>{item.openReportCount} report(s)</span>
            <span>Top: {item.topReasonLabel}</span>
          </div>
        </div>

        {/* Reason input */}
        <label className="block mb-4">
          <span className="text-[13px] font-medium text-gray-700">
            {isRemove ? "Reason for removal" : "Internal note (optional)"}
          </span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              isRemove
                ? "This reason is sent verbatim to the author — make it read like something a person wrote\u2026"
                : "Why these reports are being dismissed\u2026"
            }
            rows={3}
            className="w-full mt-1.5 text-[13px] border border-[#E5E7EB] rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
          />
          {isRemove && (
            <p className="text-[11px] text-amber-600 mt-1">
              The reason will be sent to the post author in their notification.
            </p>
          )}
        </label>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-gray-600 hover:text-gray-900 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className={`px-5 py-2 text-[13px] font-semibold text-white rounded-xl transition flex items-center gap-2 disabled:opacity-50 ${
              isRemove
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {mutation.isPending && (
              <Loader2 size={14} className="animate-spin" />
            )}
            {isRemove ? "Remove Post" : "Dismiss Reports"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function ReportsPage() {
  const [status, setStatus] = useState<FilterStatus>("pending");
  const [page, setPage] = useState(1);
  const [actionModal, setActionModal] = useState<{
    item: ReportedPostItem;
    action: "remove" | "dismiss";
  } | null>(null);

  const { data, isLoading, isError } = useReportQueue({
    status,
    page,
    limit: 15,
  });
  const items = data?.items ?? [];
  const stats = data?.stats;
  const pagination = data?.pagination;

  const filters: {
    label: string;
    value: FilterStatus;
    icon: React.ReactNode;
  }[] = [
    {
      label: "Pending",
      value: "pending",
      icon: <AlertTriangle size={14} />,
    },
    {
      label: "Actioned",
      value: "actioned",
      icon: <CheckCircle size={14} />,
    },
    { label: "Dismissed", value: "dismissed", icon: <XCircle size={14} /> },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Reported Posts" />

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 md:px-8">
          <StatCard label="Pending Posts" value={stats.pendingPosts} />
          <StatCard label="Auto-Hidden" value={stats.autoHiddenPosts} />
          <StatCard label="Pending Reports" value={stats.pendingReports} />
          <StatCard
            label="Auto-Hide Threshold"
            value={`${stats.autoHideThreshold} reports`}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap px-6 md:px-8">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setStatus(f.value);
              setPage(1);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium transition ${
              status === f.value
                ? "bg-[#1D4ED8] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.icon}
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="px-6 md:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
            <Loader2 size={16} className="animate-spin" />
            Loading reports…
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-red-500 text-sm">
            Failed to load reports. Try again.
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No reported posts to review.
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#E5E7EB] rounded-xl">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-gray-50 border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Post</th>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    Author
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-center">
                    Reports
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    Top Reason
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    Last Reported
                  </th>
                  {status === "pending" && (
                    <th className="px-4 py-3 font-medium text-gray-500 text-right">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {items.map((item) => (
                  <tr key={item.post.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 max-w-xs">
                      <div className="flex items-start gap-2">
                        {item.autoHidden && (
                          <ShieldAlert
                            size={14}
                            className="text-amber-500 shrink-0 mt-0.5"
                          />
                        )}
                        <div>
                          <p className="text-gray-900 line-clamp-2">
                            {truncate(item.post.body, 120)}
                          </p>
                          {item.post.title && (
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              Article: {truncate(item.post.title, 60)}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-700">
                        {item.post.author.fullName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-medium ${
                          item.openReportCount >= 3
                            ? "bg-red-50 text-red-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.openReportCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-600">
                        {item.topReasonLabel}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(item.reasons)
                          .filter(([, count]) => (count as number) > 0)
                          .map(([key, count]) => (
                            <span
                              key={key}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500"
                            >
                              {key}: {count as number}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {timeAgo(item.lastReportedAt)}
                      </div>
                    </td>
                    {status === "pending" && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              setActionModal({ item, action: "dismiss" })
                            }
                            className="px-3 py-1.5 text-[12px] font-medium text-green-600 hover:bg-green-50 rounded-lg transition"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() =>
                              setActionModal({ item, action: "remove" })
                            }
                            className="px-3 py-1.5 text-[12px] font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {pagination && (
              <TablePagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onChange={setPage}
              />
            )}
          </div>
        )}
      </div>

      {/* Action modal */}
      {actionModal && (
        <ActionModal
          item={actionModal.item}
          action={actionModal.action}
          onClose={() => setActionModal(null)}
        />
      )}
    </div>
  );
}
