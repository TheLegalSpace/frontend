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
// When isAdmin is true, uses the admin endpoint (returns ALL published events).
// Otherwise, uses the public endpoint (safe for any role — avoids 403 errors).
export const usePublishedEvents = (page = 1, limit = 20, isAdmin = false) =>
  useQuery({
    queryKey: ["publishedEvents", page, limit, isAdmin],
    queryFn: () =>
      eventService.listPublished(page, limit, isAdmin).then((r) => r.data.data),
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
