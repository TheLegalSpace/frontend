// hooks/usePracticeAreas.ts
import { practiceAreasService } from "@/services/practice-areas.services";
import { useQuery } from "@tanstack/react-query";
 
export const usePracticeAreas = () =>
  useQuery({
    queryKey: ["practice-areas"],
    queryFn: () =>
      practiceAreasService.list().then((r) => r.data.data),
    staleTime: 1000 * 60 * 60, // ✅ cache 1hr — matches backend cache
  });