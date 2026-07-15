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

// Returns all published events regardless of date — no startAt/endAt filter.
// Used as a fallback while the deployed server still runs startAt >= now.
export const usePublishedEvents = (page = 1, limit = 20) =>
  useQuery({
    queryKey: ["publishedEvents", page, limit],
    queryFn: () =>
      eventService.listPublished(page, limit).then((r) => r.data.data),
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
