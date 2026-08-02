// hooks/useReportReasons.ts
import { useQuery } from "@tanstack/react-query";
import { fetchReportReasons, ReportReason } from "@/services/report.services";

export function useReportReasons() {
  return useQuery<ReportReason[]>({
    queryKey: ["report-reasons"],
    queryFn: fetchReportReasons,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}