// hooks/usePracticeAreas.ts
import { practiceAreasService } from "@/services/practice-areas.services";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const usePracticeAreas = () =>
  useQuery({
    queryKey: ["practice-areas"],
    queryFn: () => practiceAreasService.list().then((r) => r.data.data),
    staleTime: 1000 * 60 * 60, // ✅ cache 1hr — matches backend cache
  });

// ✅ Returns a map of id → name
export const usePracticeAreaMap = () => {
  const { data: practiceAreas } = usePracticeAreas();

  const map = useMemo(() => {
    const result: Record<string, string> = {};
    practiceAreas?.forEach((a) => {
      result[a.id] = a.name;
    });
    return result;
  }, [practiceAreas]);

  return map;
};

// ✅ Find a single area by id
export const usePracticeAreaById = (id: string | null | undefined) => {
  const { data: practiceAreas } = usePracticeAreas();
  return practiceAreas?.find((a) => a.id === id) ?? id;
};
