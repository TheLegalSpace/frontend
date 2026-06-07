// app/Components/Leads/LeadsPage.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Lead, LeadStatus } from "@/app/types/leads";
import { connectSocket } from "@/services/socket.services";
import LeadsStatsRow from "./Leadsstatsrow";
import LeadCard from "./Leadcard";
import { useLeads, useLeadStats, useLeadsCache } from "@/hooks/useLeads";

const STATUS_TABS: { label: string; value: LeadStatus }[] = [
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Declined", value: "declined" },
  { label: "Expired", value: "expired" },
];

export default function LeadsPage() {
  const [activeTab, setActiveTab] = useState<LeadStatus>("pending");

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useLeads(activeTab, 20);

  const { data: stats } = useLeadStats();
  const { patchLeadStatus, prependPendingLead } = useLeadsCache();

  const leads = (data?.pages ?? []).flatMap(
    (p) => p?.data?.items ?? [],
  ) as Lead[];
  const total = (data?.pages?.[0]?.data?.pagination?.total ?? 0) as number;

  // Use a ref so the socket handler always has the latest prependPendingLead
  // without needing to re-register the listener on every render.
  const notificationHandlerRef = useRef<
    ((notif: { type: string; payload: { lead?: Lead } }) => void) | undefined
  >(undefined);

  useEffect(() => {
    const token = localStorage.getItem("accessToken") ?? "";
    const socket = connectSocket(token);

    const handler = (notif: { type: string; payload: { lead?: Lead } }) => {
      if (notif.type === "new_lead" && notif.payload?.lead) {
        // Only prepend to pending — avoids polluting other tab caches
        prependPendingLead(notif.payload.lead);
      }
    };

    notificationHandlerRef.current = handler;
    socket.on("notification", handler);

    return () => {
      socket.off("notification", handler);
    };
  }, [prependPendingLead]);

  function handleUpdate(id: string, status: "accepted" | "declined") {
    patchLeadStatus(id, status);
  }

  async function handleShowMore() {
    await fetchNextPage();
  }

  const activeLabel =
    STATUS_TABS.find((t) => t.value === activeTab)?.label ?? "";

  return (
<<<<<<< HEAD
    <div className="flex flex-col h-full w-full bg-white pt-18.75">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="px-4 py-4">
          {/* Stats */}
          <LeadsStatsRow stats={stats ?? null} />

          {/* Tabs */}
          <div className="mb-5">
            <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
              <div className="flex items-center">
                {STATUS_TABS.map((tab) => {
                  const isActive = activeTab === tab.value;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setActiveTab(tab.value)}
                      className={`relative flex-1 py-3 text-[13px] font-medium whitespace-nowrap transition-colors ${
                        isActive
                          ? "text-gray-900"
                          : "text-gray-400 hover:text-gray-600"
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
=======
    <div className="min-h-screen bg-white">
      <div className=" ">
        <h1 className="font-[Instrument_Serif] text-[20px] leading-none font-light text-[#1F2937] ps-4 pt-6 pb-px">
          Leads
        </h1>
        <div className="w-full h-px bg-[#E6EAED] my-4"></div>
        {/* Stats */}
        <LeadsStatsRow stats={stats ?? null} />

        {/* Tabs */}
        <div className="sticky top-0 z-20  px-4  mb-5">
          <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
            <div className="flex items-center">
              {STATUS_TABS.map((tab) => {
                const isActive = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`relative flex-1 py-3 text-[13px] font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? "text-gray-900"
                        : "text-gray-400 hover:text-gray-600"
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
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-[15px] font-semibold text-gray-900">
            {activeLabel} Leads
          </h2>
          <span className="text-[12px] text-gray-400">{total} total</span>
        </div>
>>>>>>> origin/Fixed-At-Last

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400 gap-2">
            <Loader2 size={16} className="animate-spin" />
            Loading leads...
          </div>
        ) : leads.length === 0 ? (
<<<<<<< HEAD
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
=======
          <div className="flex flex-col items-center justify-center py-16 px-4 gap-2 text-gray-400">
>>>>>>> origin/Fixed-At-Last
            <p className="text-sm">No {activeTab} leads yet.</p>
          </div>
        ) : (
          <>
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onUpdate={handleUpdate} />
            ))}

            {hasNextPage && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleShowMore}
                  disabled={isFetchingNextPage}
                  className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800 transition disabled:opacity-50"
                >
                  {isFetchingNextPage ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Show More"
                  )}
                </button>
              </div>
            )}
          </>
        )}
<<<<<<< HEAD
        </div>
=======
>>>>>>> origin/Fixed-At-Last
      </div>
    </div>
  );
}
