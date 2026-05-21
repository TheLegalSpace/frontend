"use client";

import { useCallback, useEffect, useState } from "react";
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

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<LeadStatus>("pending");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

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

  useEffect(() => {
    setLoading(true);
    setLeads([]);
    setPage(1);
    loadLeads(activeTab, 1);
  }, [activeTab, loadLeads]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken") ?? "";
    const socket = connectSocket(token);
    socket.on("notification", (notif: { type: string; payload: { lead?: Lead } }) => {
      if (notif.type === "new_lead" && notif.payload?.lead) {
        setLeads((prev) => {
          if (prev.find((l) => l.id === notif.payload.lead!.id)) return prev;
          return [notif.payload.lead!, ...prev];
        });
        setTotal((prev) => prev + 1);
      }
    });
    return () => { socket.off("notification"); };
  }, []);

  function handleUpdate(id: string, status: "accepted" | "declined") {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
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

        {/* Stats — self-contained, never changes with tab */}
        <LeadsStatsRow />

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
          <h2 className="text-[15px] font-semibold text-gray-900">{activeLabel} Leads</h2>
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
                  {loadingMore ? <Loader2 size={14} className="animate-spin" /> : "Show More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}