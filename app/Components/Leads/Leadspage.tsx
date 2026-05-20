"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Lead, LeadStatus } from "@/app/types/leads";
import { leadsService } from "@/services/leads.services";
import { connectSocket } from "@/services/socket.services";
import LeadsStatsRow from "./Leadsstatsrow";
import LeadCard from "./Leadcard";

const STATUS_TABS: { label: string; value: LeadStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Declined", value: "declined" },
  { label: "Expired", value: "expired" },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<LeadStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const hasMore = leads.length < total;

  const loadLeads = useCallback(
    async (status: LeadStatus | "all", pageNum: number, append = false) => {
      try {
        const res = await leadsService.getLeads(
          status === "all" ? undefined : status,
          pageNum,
          20
        );
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

  // Socket — new lead arrives in real time
  useEffect(() => {
    const token = localStorage.getItem("accessToken") ?? "";
    const socket = connectSocket(token);

    socket.on(
      "notification",
      (notif: { type: string; payload: { lead?: Lead } }) => {
        if (notif.type === "new_lead" && notif.payload?.lead) {
          setLeads((prev) => {
            if (prev.find((l) => l.id === notif.payload.lead!.id)) return prev;
            return [notif.payload.lead!, ...prev];
          });
          setTotal((prev) => prev + 1);
        }
      }
    );

    return () => {
      socket.off("notification");
    };
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-[22px] font-semibold text-gray-900 mb-6">Leads</h1>

        {/* Stats */}
        <LeadsStatsRow leads={leads} total={total} />

        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-gray-900">
            {activeTab === "all"
              ? "All Leads"
              : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Leads`}
          </h2>
          <span className="text-[12px] text-gray-400">{total} total</span>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 mb-5 bg-white border border-gray-100 rounded-xl p-1 w-fit overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition whitespace-nowrap ${
                activeTab === tab.value
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Leads list */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400 gap-2">
            <Loader2 size={16} className="animate-spin" />
            Loading leads...
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
            <p className="text-sm">No leads yet.</p>
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