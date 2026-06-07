<<<<<<< HEAD
﻿import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
=======
﻿import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
>>>>>>> origin/Fixed-At-Last
import type { Lead, LeadStatus } from "@/app/types/leads";
import { leadsService } from "@/services/leads.services";

type LeadsResponse = {
  data?: {
    items?: Lead[];
    pagination?: { total?: number; page?: number; limit?: number };
  };
};

<<<<<<< HEAD
=======
// Mirrors the return type of leadsService.getStats()
type LeadStats = {
  total: number;
  pending: number;
  accepted: number;
  declined: number;
  expired: number;
};

// Shape TanStack stores for infinite queries
type InfiniteLeadsData = {
  pages: LeadsResponse[];
  pageParams: unknown[];
};

>>>>>>> origin/Fixed-At-Last
export const leadsKeys = {
  all: ["leads"] as const,
  lists: () => [...leadsKeys.all, "list"] as const,
  list: (status: LeadStatus, limit = 20) =>
    [...leadsKeys.lists(), status, limit] as const,
  stats: () => [...leadsKeys.all, "stats"] as const,
};

function parseLeadsResponse(res: unknown): { items: Lead[]; total: number } {
  const payload = res as LeadsResponse;
  const items = payload?.data?.items ?? [];
  const total = payload?.data?.pagination?.total ?? 0;
  return { items, total };
}

export function useLeads(status: LeadStatus, limit = 20) {
  return useInfiniteQuery({
    queryKey: leadsKeys.list(status, limit),
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === "number" ? pageParam : 1;
      const res = await leadsService.getLeads(status, page, limit);
      return res as LeadsResponse;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const { total } = parseLeadsResponse(lastPage);
      const loaded = allPages.reduce(
        (acc, page) => acc + (page?.data?.items?.length ?? 0),
        0,
      );
      if (loaded >= total) return undefined;
      return allPages.length + 1;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useLeadStats() {
  return useQuery({
    queryKey: leadsKeys.stats(),
    queryFn: () => leadsService.getStats(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useLeadsCache() {
  const queryClient = useQueryClient();

<<<<<<< HEAD
  const patchLeadStatus = (
    id: string,
    status: "accepted" | "declined",
  ) => {
    queryClient.setQueriesData(
      { queryKey: leadsKeys.lists() },
      (prev: unknown) => {
        // Infinite query data: { pages: LeadsResponse[]; pageParams: unknown[] }
        const data = prev as { pages?: LeadsResponse[]; pageParams?: unknown[] } | undefined;
        if (!data?.pages) return prev;

        return {
          ...data,
          pages: data.pages.map((p) => {
            const items = p?.data?.items ?? [];
            const nextItems = items.map((l) => (l.id === id ? { ...l, status } : l));
            return {
              ...p,
              data: {
                ...p.data,
                items: nextItems,
              },
            };
=======
  const patchLeadStatus = (id: string, status: "accepted" | "declined") => {
    // Update the lead's status in every cached page of every status tab
    queryClient.setQueriesData<InfiniteLeadsData>(
      { queryKey: leadsKeys.lists() },
      (prev) => {
        if (!prev?.pages) return prev;
        return {
          ...prev,
          pages: prev.pages.map((p) => {
            const items = p?.data?.items ?? [];
            const nextItems = items.map((l) =>
              l.id === id ? { ...l, status } : l,
            );
            return { ...p, data: { ...p.data, items: nextItems } };
>>>>>>> origin/Fixed-At-Last
          }),
        };
      },
    );

<<<<<<< HEAD
    // Keep stats roughly in sync
    queryClient.setQueryData(leadsKeys.stats(), (prev: any) => {
=======
    // Keep stats in sync — typed, no any
    queryClient.setQueryData<LeadStats>(leadsKeys.stats(), (prev) => {
>>>>>>> origin/Fixed-At-Last
      if (!prev) return prev;
      if (status === "accepted") {
        return {
          ...prev,
<<<<<<< HEAD
          pending: Math.max(0, (prev.pending ?? 0) - 1),
          accepted: (prev.accepted ?? 0) + 1,
=======
          pending: Math.max(0, prev.pending - 1),
          accepted: prev.accepted + 1,
>>>>>>> origin/Fixed-At-Last
        };
      }
      return {
        ...prev,
<<<<<<< HEAD
        pending: Math.max(0, (prev.pending ?? 0) - 1),
        declined: (prev.declined ?? 0) + 1,
=======
        pending: Math.max(0, prev.pending - 1),
        declined: prev.declined + 1,
>>>>>>> origin/Fixed-At-Last
      };
    });
  };

  const prependPendingLead = (lead: Lead) => {
<<<<<<< HEAD
    // Put new lead at top of pending list cache (page 1)
    queryClient.setQueryData(
      leadsKeys.list("pending", 20),
      (prev: any) => {
        const data = prev as { pages?: LeadsResponse[]; pageParams?: unknown[] } | undefined;
        if (!data?.pages?.length) return prev;

        const first = data.pages[0];
        const items = first?.data?.items ?? [];
        if (items.find((l) => l.id === lead.id)) return prev;

        const nextFirst = {
          ...first,
          data: {
            ...first.data,
            items: [lead, ...items],
          },
        };

        return { ...data, pages: [nextFirst, ...data.pages.slice(1)] };
      },
    );

    queryClient.setQueryData(leadsKeys.stats(), (prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        pending: (prev.pending ?? 0) + 1,
        total: (prev.total ?? 0) + 1,
=======
    // Put new lead at top of the pending list cache (page 1)
    queryClient.setQueryData<InfiniteLeadsData>(
      leadsKeys.list("pending", 20),
      (prev) => {
        if (!prev?.pages?.length) return prev;

        const first = prev.pages[0];
        const items = first?.data?.items ?? [];
        if (items.find((l) => l.id === lead.id)) return prev;

        const nextFirst: LeadsResponse = {
          ...first,
          data: { ...first.data, items: [lead, ...items] },
        };

        return { ...prev, pages: [nextFirst, ...prev.pages.slice(1)] };
      },
    );

    // Bump stats — typed, no any
    queryClient.setQueryData<LeadStats>(leadsKeys.stats(), (prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        pending: prev.pending + 1,
        total: prev.total + 1,
>>>>>>> origin/Fixed-At-Last
      };
    });
  };

  const invalidateLeads = () =>
    queryClient.invalidateQueries({ queryKey: leadsKeys.lists() });

  return { patchLeadStatus, prependPendingLead, invalidateLeads };
}
