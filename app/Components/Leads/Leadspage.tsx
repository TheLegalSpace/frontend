"use client";


import { useEffect, useRef,useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Lead, LeadStatus } from "@/app/types/leads";
import { connectSocket } from "@/services/socket.services";
import LeadsStatsRow from "./Leadsstatsrow";
import LeadCard from "./Leadcard";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useLeads, useLeadStats, useLeadsCache } from "@/hooks/useLeads";

const STATUS_TABS: { label: string; value: LeadStatus }[] = [
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
  const [activeTab, setActiveTab] = useState<LeadStatus>("pending");

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useLeads(activeTab, 20);

  const { data: stats } = useLeadStats();
  const { patchLeadStatus, prependPendingLead } = useLeadsCache();

  const leads = (data?.pages ?? []).flatMap((p) => p?.data?.items ?? []) as Lead[];
  const total = (data?.pages?.[0]?.data?.pagination?.total ?? 0) as number;

  // ── Socket: new leads ─────────────────────────────────────────────────────
  const notificationHandlerRef = useRef<(notif: {
    type: string;
    payload: { lead?: Lead };
  }) => void>(undefined);

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
    if (notificationHandlerRef.current) {
      socket.off("notification", notificationHandlerRef.current);
    }

    const handler = (notif: { type: string; payload: { lead?: Lead } }) => {
      if (notif.type === "new_lead" && notif.payload?.lead) {
        // Only affect pending cache + stats; avoids refetching everything
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

  const activeLabel = STATUS_TABS.find((t) => t.value === activeTab)?.label ?? "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-[22px] font-semibold text-gray-900 mb-6">Leads</h1>

        {/* Stats — cached */}
        <LeadsStatsRow stats={stats ?? null} />

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

        {/* Leads list */}
        {leadsQuery.isLoading ? (
        {isLoading ? (
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

            {hasNextPage && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleShowMore}
                  disabled={leadsQuery.isFetchingNextPage}
                  className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800 transition disabled:opacity-50"
                >
                  {leadsQuery.isFetchingNextPage ? (
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
      </div>
    </div>
  );
}
