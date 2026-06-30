// services/admin.services.ts
//
// API methods for the Admin module (/admin/*).
//
// NOTE ON ENDPOINTS: the Postman collection shared for this build only
// documented Auth + Profile in detail. The paths below follow the same
// REST conventions used everywhere else in this codebase (see
// profile.services.ts, leads.services.ts) and are namespaced under
// `/admin`, matching the "Admin" folder already listed in the collection's
// sidebar. Confirm exact paths/payloads with the backend team and adjust
// here only — nothing else in the admin UI needs to change.
import { api } from "./api";
import {
  AdminDashboardData,
  AdminUserDetail,
  AdminUserListItem,
  AdminUserStats,
  AnalyticsData,
  CreateEventPayload,
  DocketEventDetail,
  DocketEventListItem,
  DocketStats,
  EmailTemplate,
  EventStatus,
  LegalNewsSurveyData,
  Pagination,
  PlatformAnnouncement,
  RevenueData,
  SubscriptionPlan,
  SubscriptionsData,
  SupportStats,
  SupportTicketDetail,
  SupportTicketListItem,
  TicketStatus,
  TlsServiceDetail,
  TlsServiceListItem,
  TlsServicesStats,
  TlsServiceStatus,
} from "@/app/types/admin";

export interface ListResponse<T> {
  error: boolean;
  message: string;
  data: {
    items: T[];
    pagination: Pagination;
  };
}

export interface SingleResponse<T> {
  error: boolean;
  message: string;
  data: T;
}

type ListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
};

export const adminService = {
  // ── Dashboard ────────────────────────────────────────────────────────────
  getDashboard: () =>
    api.get<SingleResponse<AdminDashboardData>>("/admin/dashboard"),

  // ── Users ────────────────────────────────────────────────────────────────
  getUserStats: () =>
    api.get<SingleResponse<AdminUserStats>>("/admin/users/stats"),

  getUsers: (params: ListParams = {}) =>
    api.get<ListResponse<AdminUserListItem>>("/admin/users", { params }),

  getUserById: (accountId: string) =>
    api.get<SingleResponse<AdminUserDetail>>(`/admin/users/${accountId}`),

  approveLawyer: (accountId: string) =>
    api.patch<SingleResponse<AdminUserDetail>>(
      `/admin/users/${accountId}/approve`,
    ),

  rejectLawyer: (accountId: string, reason?: string) =>
    api.patch<SingleResponse<AdminUserDetail>>(
      `/admin/users/${accountId}/reject`,
      { reason },
    ),

  suspendUser: (accountId: string, reason?: string) =>
    api.patch<SingleResponse<AdminUserDetail>>(
      `/admin/users/${accountId}/suspend`,
      { reason },
    ),

  reactivateUser: (accountId: string) =>
    api.patch<SingleResponse<AdminUserDetail>>(
      `/admin/users/${accountId}/reactivate`,
    ),

  // ── Subscriptions ────────────────────────────────────────────────────────
  getSubscriptions: () =>
    api.get<SingleResponse<SubscriptionsData>>("/admin/subscriptions"),

  updatePlan: (planId: string, payload: Partial<SubscriptionPlan>) =>
    api.patch<SingleResponse<SubscriptionPlan>>(
      `/admin/subscriptions/${planId}`,
      payload,
    ),

  // ── Revenue ──────────────────────────────────────────────────────────────
  getRevenue: (params: ListParams = {}) =>
    api.get<SingleResponse<RevenueData>>("/admin/revenue", { params }),

  // ── On the Docket (Events) ───────────────────────────────────────────────
  getDocketStats: () =>
    api.get<SingleResponse<DocketStats>>("/admin/events/stats"),

  getEvents: (params: ListParams = {}) =>
    api.get<ListResponse<DocketEventListItem>>("/admin/events", { params }),

  getEventById: (eventId: string) =>
    api.get<SingleResponse<DocketEventDetail>>(`/admin/events/${eventId}`),

  updateEventStatus: (eventId: string, status: EventStatus) =>
    api.patch<SingleResponse<DocketEventDetail>>(
      `/admin/events/${eventId}/status`,
      { status },
    ),

  createEvent: (payload: CreateEventPayload) => {
    const form = new FormData();
    form.append("eventName", payload.eventName);
    if (payload.flyer) form.append("flyer", payload.flyer);
    form.append("promotionStartDate", payload.promotionStartDate);
    form.append("promotionEndDate", payload.promotionEndDate);
    if (payload.additionalLink)
      form.append("additionalLink", payload.additionalLink);
    return api.post<SingleResponse<DocketEventDetail>>(
      "/admin/events",
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },

  // ── TLS Services (enquiries) ─────────────────────────────────────────────
  getTlsServiceStats: () =>
    api.get<SingleResponse<TlsServicesStats>>("/admin/tls-services/stats"),

  getTlsServiceEnquiries: (params: ListParams = {}) =>
    api.get<ListResponse<TlsServiceListItem>>("/admin/tls-services", {
      params,
    }),

  getTlsServiceById: (enquiryId: string) =>
    api.get<SingleResponse<TlsServiceDetail>>(
      `/admin/tls-services/${enquiryId}`,
    ),

  updateTlsServiceStatus: (enquiryId: string, status: TlsServiceStatus) =>
    api.patch<SingleResponse<TlsServiceDetail>>(
      `/admin/tls-services/${enquiryId}/status`,
      { status },
    ),

  // ── Legal News Survey ─────────────────────────────────────────────────────
  getLegalNewsSurvey: () =>
    api.get<SingleResponse<LegalNewsSurveyData>>(
      "/admin/legal-news-survey",
    ),

  // ── Support Center ────────────────────────────────────────────────────────
  getSupportStats: () =>
    api.get<SingleResponse<SupportStats>>("/admin/support/stats"),

  getSupportTickets: (params: ListParams = {}) =>
    api.get<ListResponse<SupportTicketListItem>>("/admin/support", {
      params,
    }),

  getSupportTicketById: (ticketId: string) =>
    api.get<SingleResponse<SupportTicketDetail>>(
      `/admin/support/${ticketId}`,
    ),

  updateSupportTicketStatus: (ticketId: string, status: TicketStatus) =>
    api.patch<SingleResponse<SupportTicketDetail>>(
      `/admin/support/${ticketId}`,
      { status },
    ),

  // ── Analytics ────────────────────────────────────────────────────────────
  getAnalytics: () =>
    api.get<SingleResponse<AnalyticsData>>("/admin/analytics"),

  // ── Announcements ────────────────────────────────────────────────────────
  getEmailTemplates: () =>
    api.get<ListResponse<EmailTemplate>>("/admin/announcements/templates"),

  updateEmailTemplate: (templateId: string, payload: Record<string, unknown>) =>
    api.patch<SingleResponse<EmailTemplate>>(
      `/admin/announcements/templates/${templateId}`,
      payload,
    ),

  getPlatformAnnouncements: () =>
    api.get<ListResponse<PlatformAnnouncement>>(
      "/admin/announcements/platform",
    ),

  createPlatformAnnouncement: (payload: Partial<PlatformAnnouncement>) =>
    api.post<SingleResponse<PlatformAnnouncement>>(
      "/admin/announcements/platform",
      payload,
    ),

  updatePlatformAnnouncement: (
    id: string,
    payload: Partial<PlatformAnnouncement>,
  ) =>
    api.patch<SingleResponse<PlatformAnnouncement>>(
      `/admin/announcements/platform/${id}`,
      payload,
    ),
};
