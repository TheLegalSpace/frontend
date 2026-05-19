// components/requests/RequestsPage.tsx
"use client";

import { useState } from "react";
import {
  Clock,
  Loader2,
  AlertTriangle,
  MapPin,
  X,
  XCircle,
} from "lucide-react";
import {
  useRequests,
  useRequestStats,
  useCancelRequest,
} from "@/hooks/useRequests";
import { formatBudget, LegalRequest } from "@/services/requests.services";
import { usePracticeAreaMap } from "@/hooks/usePracticeAreas";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatExpiry(dateStr: string): string {
  const days = Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (days < 0) return "Expired";
  if (days === 0) return "Expires today";
  return `Expires in ${days}d`;
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// ✅ Resolves matter — handles both UUID and name string
function resolveMatter(
  matter: string,
  practiceAreaMap: Record<string, string>,
): string {
  if (!matter) return "Unknown";
  // If it's a UUID in the map → return the name
  if (practiceAreaMap[matter]) return practiceAreaMap[matter];
  // If it's already a name string (e.g. "Aviation Law") → return as-is
  return matter;
}

// ─── Cancel Modal ─────────────────────────────────────────────────────────────
function CancelConfirmModal({
  onConfirm,
  onClose,
  isLoading,
}: {
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5 text-gray-600" />
        </button>

        <div className="mb-4">
          <XCircle className="w-8 h-8 text-red-500" strokeWidth={1.5} />
        </div>

        <h3 className="text-[16px] font-semibold text-gray-900 mb-2">
          Are you sure?
        </h3>
        <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
          This will withdraw your request from the lawyer. You can submit a new
          request anytime.
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-3 border border-gray-200 rounded-xl text-[13px] font-medium text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50"
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

// ─── Request Card ─────────────────────────────────────────────────────────────
function RequestCard({
  request,
  onCancel,
  isCancelling,
  showCancel = true,
  practiceAreaMap, // ✅ passed as prop — no hook call inside non-hook
}: {
  request: LegalRequest;
  onCancel: (id: string) => void;
  isCancelling: boolean;
  showCancel?: boolean;
  practiceAreaMap: Record<string, string>;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const { intakePayload, lawyerAccount, createdAt, expiresAt, status } = request;

  // ✅ Resolves UUID → name, or returns name string as-is
  const matterName = resolveMatter(intakePayload.matter, practiceAreaMap);

  return (
    <>
      <div className="mb-6">
        <p className="text-[13px] text-gray-800 mb-2.5">
          {intakePayload.freeText && intakePayload.freeText !== "..."
            ? intakePayload.freeText
            : `Looking for legal help with ${matterName}`}
        </p>

        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            {/* Lawyer info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {lawyerAccount.avatarUrl &&
              !lawyerAccount.avatarUrl.includes("google.com/imgres") ? (
                <img
                  src={lawyerAccount.avatarUrl}
                  alt={lawyerAccount.fullName}
                  className="w-11 h-11 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="w-11 h-11 bg-[#1e293b] rounded-lg flex items-center justify-center text-[11px] font-medium text-white shrink-0">
                  {getInitials(lawyerAccount.fullName)}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-gray-900 truncate">
                  {lawyerAccount.fullName}
                </p>
                <p className="text-[12px] text-gray-400">
                  {matterName} · {formatBudget(intakePayload.budget)}
                </p>
                {lawyerAccount.locationCity && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-gray-300 shrink-0" />
                    <span className="text-[11px] text-gray-400">
                      {lawyerAccount.locationCity},{" "}
                      {lawyerAccount.locationCountry}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className="flex items-center gap-1 text-[12px] text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                {timeAgo(createdAt)}
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  status === "pending"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : status === "accepted"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : status === "declined"
                        ? "bg-red-50 text-red-500 border-red-100"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                }`}
              >
                {status}
              </span>
              {status === "pending" && expiresAt && (
                <span className="text-[10px] text-gray-400">
                  {formatExpiry(expiresAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        {showCancel && (
          <div className="flex justify-end mt-1.5">
            <button
              onClick={() => setShowConfirm(true)}
              className="text-[12px] text-red-500 hover:underline"
            >
              Cancel Request
            </button>
          </div>
        )}
      </div>

      {showConfirm && (
        <CancelConfirmModal
          isLoading={isCancelling}
          onClose={() => setShowConfirm(false)}
          onConfirm={() => {
            onCancel(request.id);
            setShowConfirm(false);
          }}
        />
      )}
    </>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-[18px] font-medium text-gray-900 mb-5 pb-3 border-b border-gray-100">
      {title}
    </h2>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-8 text-center text-[13px] text-gray-400 border border-gray-100 rounded-xl mb-6">
      {message}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RequestsPage() {
  const { data, isLoading, error, refetch } = useRequests();
  const cancelRequest = useCancelRequest();

  // ✅ One hook call at the top level — passed down as prop
  const practiceAreaMap = usePracticeAreaMap();

  const items = data?.items ?? [];
  const stats = useRequestStats(items);

  const pending = items.filter((r) => r.status === "pending");
  const active = items.filter((r) => r.status === "accepted");
  const declined = items.filter((r) => r.status === "declined");
  const completed = items.filter((r) => r.status === "completed");

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-[13px] text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading requests...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[13px] text-red-500">
            <AlertTriangle className="w-4 h-4" />
            Failed to load requests.
          </div>
          <button
            onClick={() => refetch()}
            className="text-[12px] text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ✅ Helper to render RequestCard with map injected
  const renderCard = (r: LegalRequest, showCancel = true) => (
    <RequestCard
      key={r.id}
      request={r}
      onCancel={(id) => cancelRequest.mutate(id)}
      isCancelling={cancelRequest.isPending}
      showCancel={showCancel}
      practiceAreaMap={practiceAreaMap} // ✅ passed as prop
    />
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-[22px] font-medium text-gray-900 mb-5 pb-4 border-b border-gray-100">
        Requests
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-[12px] text-gray-400 mb-2">Total Requests</p>
          <p className="text-[32px] font-light text-gray-900 leading-none mb-1.5">
            {data?.pagination.total ?? stats.total}
          </p>
          <p className="text-[12px] text-green-600">All time</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-[12px] text-gray-400 mb-2">Active Requests</p>
          <p className="text-[32px] font-light text-gray-900 leading-none mb-1.5">
            {stats.active}
          </p>
          <p className="text-[12px] text-green-600">↑ {stats.pending} pending</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-[12px] text-gray-400 mb-2">Declined Requests</p>
          <p className="text-[32px] font-light text-gray-900 leading-none mb-1.5">
            {stats.declined}
          </p>
          <button className="text-[12px] text-blue-600 hover:underline text-left">
            Request legal help again.
          </button>
        </div>
      </div>

      {/* Pending */}
      <SectionHeader title="Pending Requests" />
      {pending.length === 0
        ? <EmptyState message="No pending requests" />
        : pending.map((r) => renderCard(r))}

      {/* Active */}
      {active.length > 0 && (
        <>
          <SectionHeader title="Active Requests" />
          {active.map((r) => renderCard(r))}
        </>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <>
          <SectionHeader title="Completed Requests" />
          {completed.map((r) => renderCard(r, false))}
        </>
      )}

      {/* Declined */}
      {declined.length > 0 && (
        <>
          <SectionHeader title="Declined Requests" />
          {declined.map((r) => renderCard(r, false))}
        </>
      )}
    </div>
  );
}