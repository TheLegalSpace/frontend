import { api } from "./api";
import type {
  ApiEnvelope,
  ServiceRequest,
  ServiceRequestPayload,
  EventPromotionFormValues,
  EventPromotionResponseData,
  ServiceRequestListResponse,
} from "../app/types/services";

export async function submitServiceRequest(
  body: ServiceRequestPayload
): Promise<ApiEnvelope<ServiceRequest>> {
  const res = await api.post("/services/requests", body);
  return res.data;
}

export async function submitEventPromotion(
  values: EventPromotionFormValues
): Promise<ApiEnvelope<EventPromotionResponseData>> {
  const fd = new FormData();

  if (values.flyer) fd.append("flyer", values.flyer);
  fd.append("title", values.title);
  fd.append("startAt", values.startAt);
  fd.append("endAt", values.endAt);
  fd.append("shareOnSocial", values.shareOnSocial ? "true" : "false");
  fd.append("links", values.links);

  if (values.contactName) fd.append("contactName", values.contactName);
  if (values.contactEmail) fd.append("contactEmail", values.contactEmail);
  if (values.contactPhone) fd.append("contactPhone", values.contactPhone);
  if (values.firmName) fd.append("firmName", values.firmName);

  const res = await api.post("/services/event-promotion", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getMyServiceRequests(
  page = 1,
  limit = 20
): Promise<ApiEnvelope<ServiceRequestListResponse>> {
  const res = await api.get("/services/me", { params: { page, limit } });
  return res.data;
}

export async function getServiceRequest(
  id: string
): Promise<ApiEnvelope<ServiceRequest>> {
  const res = await api.get(`/services/${id}`);
  return res.data;
}

export function computeEventPromotionPricing(
  startAt: string,
  endAt: string,
  shareOnSocial: boolean
) {
  const DAILY_RATE = 1000;
  const SOCIAL_ADDON = 5000;

  if (!startAt || !endAt) {
    return { days: 0, promotionFee: 0, socialFee: 0, total: 0 };
  }

  const start = new Date(startAt);
  const end = new Date(endAt);

  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = Math.floor(
    (Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) -
      Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) /
      msPerDay
  );

  const days = Math.max(diff + 1, 0);

  const promotionFee = days * DAILY_RATE;
  const socialFee = shareOnSocial ? SOCIAL_ADDON : 0;
  const total = promotionFee + socialFee;

  return { days, promotionFee, socialFee, total };
}