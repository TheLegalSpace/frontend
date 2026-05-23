"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Lead, LeadStatus } from "@/app/types/leads";
import { leadsService } from "@/services/leads.services";
import { connectSocket } from "@/services/socket.services";
import LeadsStatsRow from "./Leadsstatsrow";
import LeadCard from "./Leadcard";

const STATUS_TABS: { label: string; value: LeadStatus }[] = [
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Declined", value: "declined" },
  { label: "Expired", value: "expired" },
];

interface LeadStats {
  total: number;
  pending: number;
  accepted: number;
  declined: number;
  expired: number;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<LeadStatus>("pending");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [stats, setStats] = useState<LeadStats | null>(null);

  const hasMore = leads.length < total;

  const loadLeads = useCallback(
    async (status: LeadStatus, pageNum: number, append = false) => {
      try {
        const res = await leadsService.getLeads(status, pageNum, 20);
        const items: Lead[] = res?.data?.items ?? [];
        const totalCount: number = res?.data?.pagination?.total ?? 0;
        setTotal(totalCount);
        setLeads((prev) => (append ? [...prev, ...items] : items));
      } catch (err) {
        console.error("Failed to load leads:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  // FIX: Load stats once here and pass them down to LeadsStatsRow.
  // Previously LeadsStatsRow made 5 independent API calls on every mount.
  // Now it's a single batch here, shared with the child — no redundant fetches.
  const loadStats = useCallback(async () => {
    try {
      const [totalRes, pendingRes, acceptedRes, declinedRes, expiredRes] =
        await Promise.all([
          leadsService.getLeads(undefined, 1, 1),
          leadsService.getLeads("pending", 1, 1),
          leadsService.getLeads("accepted", 1, 1),
          leadsService.getLeads("declined", 1, 1),
          leadsService.getLeads("expired", 1, 1),
        ]);
      setStats({
        total: totalRes?.data?.pagination?.total ?? 0,
        pending: pendingRes?.data?.pagination?.total ?? 0,
        accepted: acceptedRes?.data?.pagination?.total ?? 0,
        declined: declinedRes?.data?.pagination?.total ?? 0,
        expired: expiredRes?.data?.pagination?.total ?? 0,
      });
    } catch (err) {
      console.error("Failed to fetch lead stats:", err);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    setLoading(true);
    setLeads([]);
    setPage(1);
    loadLeads(activeTab, 1);
  }, [activeTab, loadLeads]);

  // FIX: Store the handler in a ref so the same function reference is passed
  // to both socket.on and socket.off. Without this, each mount registers a new
  // inline arrow function — socket.off can't match it, so listeners stack up
  // and the same lead gets prepended 2–4 times.
  const notificationHandlerRef = useRef<(notif: {
    type: string;
    payload: { lead?: Lead };
  }) => void>(undefined);

  useEffect(() => {
    const token = localStorage.getItem("accessToken") ?? "";
    const socket = connectSocket(token);

    // Always remove any previously registered handler before adding a new one
    if (notificationHandlerRef.current) {
      socket.off("notification", notificationHandlerRef.current);
    }

    const handler = (notif: { type: string; payload: { lead?: Lead } }) => {
      if (notif.type === "new_lead" && notif.payload?.lead) {
        setLeads((prev) => {
          if (prev.find((l) => l.id === notif.payload.lead!.id)) return prev;
          return [notif.payload.lead!, ...prev];
        });
        setTotal((prev) => prev + 1);
        // Also bump pending count in stats
        setStats((prev) =>
          prev ? { ...prev, pending: prev.pending + 1, total: prev.total + 1 } : prev
        );
      }
    };

    notificationHandlerRef.current = handler;
    socket.on("notification", handler);

    return () => {
      socket.off("notification", handler);
    };
  }, []); // empty deps is correct — handler captures setLeads/setTotal via closure

  function handleUpdate(id: string, status: "accepted" | "declined") {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    // Keep stats in sync when a lead is actioned
    setStats((prev) => {
      if (!prev) return prev;
      if (status === "accepted") {
        return { ...prev, pending: Math.max(0, prev.pending - 1), accepted: prev.accepted + 1 };
      }
      if (status === "declined") {
        return { ...prev, pending: Math.max(0, prev.pending - 1), declined: prev.declined + 1 };
      }
      return prev;
    });
  }

  async function handleShowMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    await loadLeads(activeTab, nextPage, true);
  }

  const activeLabel = STATUS_TABS.find((t) => t.value === activeTab)?.label ?? "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-[22px] font-semibold text-gray-900 mb-6">Leads</h1>

        {/* Stats — data fetched here, passed down (no redundant child fetches) */}
        <LeadsStatsRow stats={stats} />

        {/* Tabs */}
        <div className="sticky top-0 z-20 bg-gray-50 -mx-4 px-4 mb-5">
          <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
            <div className="flex items-center">
              {STATUS_TABS.map((tab) => {
                const isActive = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`relative flex-1 py-3 text-[13px] font-medium whitespace-nowrap transition-colors ${
                      isActive ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gray-900 rounded-t-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-gray-900">
            {activeLabel} Leads
          </h2>
          <span className="text-[12px] text-gray-400">{total} total</span>
        </div>

        {/* Leads list */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400 gap-2">
            <Loader2 size={16} className="animate-spin" />
            Loading leads...
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
            <p className="text-sm">No {activeTab} leads yet.</p>
          </div>
        ) : (
          <>
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onUpdate={handleUpdate} />
            ))}
            {hasMore && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleShowMore}
                  disabled={loadingMore}
                  className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800 transition disabled:opacity-50"
                >
                  {loadingMore ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Show More"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}