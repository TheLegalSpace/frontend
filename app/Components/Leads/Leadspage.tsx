"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Lead, LeadStatus } from "@/app/types/leads";
import { leadsService } from "@/services/leads.services";
import { connectSocket } from "@/services/socket.services";
import LeadsStatsRow from "./Leadsstatsrow";
import LeadCard from "./Leadcard";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

const STATUS_TABS: { label: string; value: LeadStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Declined", value: "declined" },
  { label: "Expired", value: "expired" },
];

export default function LeadsPage() {
  const [activeTab, setActiveTab] = useState<LeadStatus | "all">("all");
  const queryClient = useQueryClient();

  const leadsQuery = useInfiniteQuery({
    queryKey: ["leads", activeTab],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      leadsService.getLeads(activeTab === "all" ? undefined : activeTab, pageParam, 20),
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if (!pagination) return undefined;
      return pagination.page < pagination.totalPages ? pagination.page + 1 : undefined;
    },
    staleTime: 1000 * 30,
  });

  const leads = useMemo(
    () =>
      leadsQuery.data?.pages.flatMap((page) => (page?.data?.items ?? []) as Lead[]) ?? [],
    [leadsQuery.data]
  );
  const total = leadsQuery.data?.pages[0]?.data?.pagination?.total ?? 0;
  const hasMore = leads.length < total;

  // Socket — new lead arrives in real time
  useEffect(() => {
    const token = localStorage.getItem("accessToken") ?? "";
    const socket = connectSocket(token);

    const handleNotification = (notif: { type: string; payload: { lead?: Lead } }) => {
      if (notif.type === "new_lead" && notif.payload?.lead) {
        queryClient.setQueryData(["leads", activeTab], (prev: any) => {
          if (!prev?.pages?.length) return prev;
          const newLead = notif.payload.lead!;
          const shouldInclude =
            activeTab === "all" || newLead.status === activeTab;
          if (!shouldInclude) return prev;

          const firstPageItems = (prev.pages[0]?.data?.items ?? []) as Lead[];
          if (firstPageItems.some((item) => item.id === newLead.id)) return prev;

          const updatedFirstPage = {
            ...prev.pages[0],
            data: {
              ...prev.pages[0].data,
              items: [newLead, ...firstPageItems].slice(0, 20),
              pagination: {
                ...prev.pages[0].data.pagination,
                total: (prev.pages[0].data.pagination?.total ?? 0) + 1,
              },
            },
          };

          return {
            ...prev,
            pages: [updatedFirstPage, ...prev.pages.slice(1)],
          };
        });
      }
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [activeTab, queryClient]);

  function handleUpdate(id: string, status: "accepted" | "declined") {
    queryClient.setQueryData(["leads", activeTab], (prev: any) => {
      if (!prev?.pages) return prev;
      return {
        ...prev,
        pages: prev.pages.map((page: any) => ({
          ...page,
          data: {
            ...page.data,
            items: (page.data?.items ?? []).map((lead: Lead) =>
              lead.id === id ? { ...lead, status } : lead
            ),
          },
        })),
      };
    });
  }

  async function handleShowMore() {
    await leadsQuery.fetchNextPage();
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
        {leadsQuery.isLoading ? (
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
                  disabled={leadsQuery.isFetchingNextPage}
                  className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800 transition disabled:opacity-50"
                >
                  {leadsQuery.isFetchingNextPage ? (
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
