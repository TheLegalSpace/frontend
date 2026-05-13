// hooks/useEvents.ts
import { useQuery } from "@tanstack/react-query";
import { eventService, Event } from "../services/event.services";

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