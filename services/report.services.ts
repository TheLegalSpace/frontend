// services/reportService.ts
import { api } from "@/services/api";

export interface ReportReason {
  value: string;
  label: string;
  description: string;
  requiresDetails: boolean;
}

interface ReportReasonsResponse {
  error: boolean;
  message: string;
  data: { items: ReportReason[] };
}

export async function fetchReportReasons(): Promise<ReportReason[]> {
  const res = await api.get<ReportReasonsResponse>("/posts/report-reasons");
  return res.data.data.items;
}

export interface SubmitReportPayload {
  reason: string;
  details?: string;
}

export interface SubmitReportResult {
  report: { id: string; reason: string; status: string; createdAt: string };
  alreadyReported: boolean;
  postHidden: boolean;
  autoHidden?: boolean;
  autoHideThreshold?: number;
}

interface SubmitReportResponse {
  error: boolean;
  message: string;
  data: SubmitReportResult;
}

export async function submitPostReport(
  postId: string,
  payload: SubmitReportPayload
): Promise<SubmitReportResult> {
  const res = await api.post<SubmitReportResponse>(
    `/posts/${postId}/reports`,
    payload
  );
  return res.data.data;
}