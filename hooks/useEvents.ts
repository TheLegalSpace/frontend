// hooks/useEvents.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  eventService,
  Event,
  CreateEventPayload,
} from "../services/event.services";

export const useEvents = (page = 1, limit = 20) =>
  useQuery({
    queryKey: ["events", page, limit],
    queryFn: () => eventService.list(page, limit).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  });

export const useEvent = (id: string) =>
  useQuery({
    queryKey: ["events", id],
    queryFn: () => eventService.get(id).then((r) => r.data.data),
    enabled: !!id,
  });

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) => eventService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
};
