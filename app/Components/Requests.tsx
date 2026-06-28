// components/requests/RequestsPage.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Loader2,
  AlertTriangle,
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

type TabKey = "active" | "accepted" | "declined" | "expired";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function resolveMatter(
  matter: string,
  practiceAreaMap: Record<string, string>,
): string {
  if (!matter) return "Unknown";
  if (practiceAreaMap[matter]) return practiceAreaMap[matter];
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
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
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

// ─── Request Card ─────────────────────────────────────────────────────────────
function RequestCard({
  request,
  tab,
  onCancel,
  isCancelling,
  practiceAreaMap,
  onViewMessage,
  onSearchAgain,
}: {
  request: LegalRequest;
  tab: TabKey;
  onCancel: (id: string) => void;
  isCancelling: boolean;
  practiceAreaMap: Record<string, string>;
  onViewMessage?: (request: LegalRequest) => void;
  onSearchAgain?: (request: LegalRequest) => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const { intakePayload, lawyerAccount, createdAt } = request;

  const matterName = resolveMatter(intakePayload.matter, practiceAreaMap);

  return (
    <>
      <div className="mb-6">
        <p className="text-[13px] text-gray-800 mb-2.5">
          {intakePayload.freeText && intakePayload.freeText !== "..."
            ? intakePayload.freeText
            : `Looking for legal help with ${matterName}`}
        </p>

        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            {/* Lawyer avatar + info */}
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
                  {matterName}
                </p>
                <p className="text-[12px] text-gray-400">
                  Budget: {formatBudget(intakePayload.budget)}
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-1 text-[12px] text-gray-400 shrink-0">
              <Clock className="w-3.5 h-3.5" />
              {timeAgo(createdAt)}
            </div>
          </div>
        </div>

        {/* CTA row */}
        <div className="flex justify-end mt-1.5">
          {tab === "active" && (
            <button
              onClick={() => setShowConfirm(true)}
              className="text-[12px] text-red-500 hover:underline"
            >
              Cancel Request
            </button>
          )}
          {tab === "accepted" && (
            <button
              onClick={() => onViewMessage?.(request)}
              className="text-[12px] text-blue-600 hover:underline"
            >
              View Message
            </button>
          )}
          {(tab === "declined" || tab === "expired") && (
            <button
              onClick={() => onSearchAgain?.(request)}
              className="text-[12px] text-blue-600 hover:underline"
            >
              Search again
            </button>
          )}
        </div>
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

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-10 text-center text-[13px] text-gray-400 border border-[#E5E7EB] rounded-xl">
      {message}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("active");
  const router = useRouter();

  const { data, isLoading, error, refetch } = useRequests();
  const cancelRequest = useCancelRequest();
  const practiceAreaMap = usePracticeAreaMap();

  const items = data?.items ?? [];
  const stats = useRequestStats(items);

  const tabItems: Record<TabKey, LegalRequest[]> = {
    active: items.filter((r) => r.status === "pending"),
    accepted: items.filter((r) => r.status === "accepted"),
    declined: items.filter((r) => r.status === "declined"),
    expired: items.filter((r) => r.status === "cancelled"),
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "active", label: "Active" },
    { key: "accepted", label: "Accepted" },
    { key: "declined", label: "Declined" },
    { key: "expired", label: "Expired" },
  ];

  const emptyMessages: Record<TabKey, string> = {
    active: "No active requests",
    accepted: "No accepted requests",
    declined: "No declined requests",
    expired: "No expired requests",
  };

  if (isLoading) {
    return (
      <div className="w-full px-4 py-6">
        <div className="flex items-center gap-2 text-[13px] text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading requests...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-4 py-6">
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

  const currentItems = tabItems[activeTab];

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 py-6">
        {/* Page title */}
        <h1 className="font-[Instrument_Serif] text-[22px] font-regulal text-gray-900 mb-[17px] font-[Instrument_Serif] ">
          Requests
        </h1>
        <span className="block h-px bg-[#E5E7EB] my-4 -mx-4" />

        {/* Stats — only 2 cards */}
        <div className="grid grid-cols-2 gap-3 mb-7 w-1/2">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <p className="text-[12px] text-gray-400 mb-2">Total Requests</p>
            <p className="text-[32px] font-light text-gray-900 leading-none mb-1.5">
              {data?.pagination.total ?? stats.total}
            </p>
            <p className="text-[12px] text-green-600">All time</p>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <p className="text-[12px] text-gray-400 mb-2">Active Requests</p>
            <p className="text-[32px] font-light text-gray-900 leading-none mb-1.5">
              {stats.active}
            </p>
            <p className="text-[12px] text-green-600">
              ↑ {stats.active} this month
            </p>
          </div>
        </div>

        {/* Tabs — matches Leads style: bordered container, underline indicator */}
        <div className="mb-5">
          <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
            <div className="flex items-center">
              {tabs.map((t) => {
                const isActive = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`relative flex-1 py-3 text-[13px] font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? "text-gray-900"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {t.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gray-900 rounded-t-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab content */}
        {currentItems.length === 0 ? (
          <EmptyState message={emptyMessages[activeTab]} />
        ) : (
          currentItems.map((r) => (
            <RequestCard
              key={r.id}
              request={r}
              tab={activeTab}
              onCancel={(id) => cancelRequest.mutate(id)}
              isCancelling={cancelRequest.isPending}
              practiceAreaMap={practiceAreaMap}
              onViewMessage={(req) => {
                if (req.conversationId) {
                  router.push(
                    `/dashboard/messages?conversationId=${req.conversationId}`,
                  );
                }
              }}
              onSearchAgain={(_req) => {
                router.push(`/dashboard/find-lawyer`);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}