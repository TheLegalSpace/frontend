// hooks/usePracticeAreas.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export const usePracticeAreas = () =>
  useQuery({
    queryKey: ["practice-areas"],
    queryFn: () => api.get("/api/v1/practice-areas").then((r) => r.data),
    staleTime: 1000 * 60 * 60, // cache 1hr (matches backend cache)
  });