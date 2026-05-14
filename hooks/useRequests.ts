// hooks/useRequests.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  requestsService,
  RequestStatus,
  LegalRequest,
  CreateRequestPayload,
} from "@/services/requests.services";

export const useRequests = (status?: RequestStatus) =>
  useQuery({
    queryKey: ["requests", status ?? "all"],
    queryFn: () =>
      requestsService.list(status).then((r) => r.data.data),
    staleTime: 1000 * 60 * 2,
  });

// Derived stats from the items list
export const useRequestStats = (items: LegalRequest[]) => {
  const total = items.length;
  const active = items.filter((r) => r.status === "accepted").length;
  const declined = items.filter((r) => r.status === "declined").length;
  const pending = items.filter((r) => r.status === "pending").length;
  return { total, active, declined, pending };
};

export const useCancelRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => requestsService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
};

export const useCreateRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRequestPayload) =>
      requestsService.create(payload).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
};