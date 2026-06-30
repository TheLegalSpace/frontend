// hooks/useAdmin.ts
import { adminService } from "@/services/admin.services";
import {
  CreateEventPayload,
  EventStatus,
  PlatformAnnouncement,
  SubscriptionPlan,
  TicketStatus,
  TlsServiceStatus,
} from "@/app/types/admin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const STALE = 1000 * 60 * 2;

type ListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
};

// ── Dashboard ────────────────────────────────────────────────────────────────
export const useAdminDashboard = () =>
  useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => adminService.getDashboard().then((r) => r.data.data),
    staleTime: STALE,
  });

// ── Users ──────────────────────────────────────────────────────────────────
export const useAdminUserStats = () =>
  useQuery({
    queryKey: ["admin", "users", "stats"],
    queryFn: () => adminService.getUserStats().then((r) => r.data.data),
    staleTime: STALE,
  });

export const useAdminUsers = (params: ListParams) =>
  useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => adminService.getUsers(params).then((r) => r.data.data),
    staleTime: STALE,
  });

export const useAdminUser = (accountId: string, enabled = true) =>
  useQuery({
    queryKey: ["admin", "users", accountId],
    queryFn: () =>
      adminService.getUserById(accountId).then((r) => r.data.data),
    enabled: enabled && !!accountId,
    staleTime: STALE,
  });

export const useAdminUserActions = (accountId: string) => {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
  };

  const approve = useMutation({
    mutationFn: () => adminService.approveLawyer(accountId).then((r) => r.data),
    onSuccess: invalidate,
  });
  const reject = useMutation({
    mutationFn: (reason?: string) =>
      adminService.rejectLawyer(accountId, reason).then((r) => r.data),
    onSuccess: invalidate,
  });
  const suspend = useMutation({
    mutationFn: (reason?: string) =>
      adminService.suspendUser(accountId, reason).then((r) => r.data),
    onSuccess: invalidate,
  });
  const reactivate = useMutation({
    mutationFn: () =>
      adminService.reactivateUser(accountId).then((r) => r.data),
    onSuccess: invalidate,
  });

  return { approve, reject, suspend, reactivate };
};

// ── Subscriptions ─────────────────────────────────────────────────────────
export const useAdminSubscriptions = () =>
  useQuery({
    queryKey: ["admin", "subscriptions"],
    queryFn: () => adminService.getSubscriptions().then((r) => r.data.data),
    staleTime: STALE,
  });

export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      planId,
      payload,
    }: {
      planId: string;
      payload: Partial<SubscriptionPlan>;
    }) => adminService.updatePlan(planId, payload).then((r) => r.data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] }),
  });
};

// ── Revenue ──────────────────────────────────────────────────────────────────
export const useAdminRevenue = (params: ListParams) =>
  useQuery({
    queryKey: ["admin", "revenue", params],
    queryFn: () => adminService.getRevenue(params).then((r) => r.data.data),
    staleTime: STALE,
  });

// ── On the Docket (Events) ───────────────────────────────────────────────────
export const useDocketStats = () =>
  useQuery({
    queryKey: ["admin", "events", "stats"],
    queryFn: () => adminService.getDocketStats().then((r) => r.data.data),
    staleTime: STALE,
  });

export const useDocketEvents = (params: ListParams) =>
  useQuery({
    queryKey: ["admin", "events", params],
    queryFn: () => adminService.getEvents(params).then((r) => r.data.data),
    staleTime: STALE,
  });

export const useDocketEvent = (eventId: string, enabled = true) =>
  useQuery({
    queryKey: ["admin", "events", eventId],
    queryFn: () =>
      adminService.getEventById(eventId).then((r) => r.data.data),
    enabled: enabled && !!eventId,
    staleTime: STALE,
  });

export const useUpdateEventStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, status }: { eventId: string; status: EventStatus }) =>
      adminService.updateEventStatus(eventId, status).then((r) => r.data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] }),
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEventPayload) =>
      adminService.createEvent(payload).then((r) => r.data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] }),
  });
};

// ── TLS Services (enquiries) ─────────────────────────────────────────────────
export const useTlsServiceStats = () =>
  useQuery({
    queryKey: ["admin", "tls-services", "stats"],
    queryFn: () =>
      adminService.getTlsServiceStats().then((r) => r.data.data),
    staleTime: STALE,
  });

export const useTlsServiceEnquiries = (params: ListParams) =>
  useQuery({
    queryKey: ["admin", "tls-services", params],
    queryFn: () =>
      adminService.getTlsServiceEnquiries(params).then((r) => r.data.data),
    staleTime: STALE,
  });

export const useTlsServiceEnquiry = (enquiryId: string, enabled = true) =>
  useQuery({
    queryKey: ["admin", "tls-services", enquiryId],
    queryFn: () =>
      adminService.getTlsServiceById(enquiryId).then((r) => r.data.data),
    enabled: enabled && !!enquiryId,
    staleTime: STALE,
  });

export const useUpdateTlsServiceStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      enquiryId,
      status,
    }: {
      enquiryId: string;
      status: TlsServiceStatus;
    }) =>
      adminService.updateTlsServiceStatus(enquiryId, status).then((r) => r.data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "tls-services"] }),
  });
};

// ── Legal News Survey ─────────────────────────────────────────────────────────
export const useLegalNewsSurvey = () =>
  useQuery({
    queryKey: ["admin", "legal-news-survey"],
    queryFn: () =>
      adminService.getLegalNewsSurvey().then((r) => r.data.data),
    staleTime: STALE,
  });

// ── Support Center ────────────────────────────────────────────────────────────
export const useSupportStats = () =>
  useQuery({
    queryKey: ["admin", "support", "stats"],
    queryFn: () => adminService.getSupportStats().then((r) => r.data.data),
    staleTime: STALE,
  });

export const useSupportTickets = (params: ListParams) =>
  useQuery({
    queryKey: ["admin", "support", params],
    queryFn: () =>
      adminService.getSupportTickets(params).then((r) => r.data.data),
    staleTime: STALE,
  });

export const useSupportTicket = (ticketId: string, enabled = true) =>
  useQuery({
    queryKey: ["admin", "support", ticketId],
    queryFn: () =>
      adminService.getSupportTicketById(ticketId).then((r) => r.data.data),
    enabled: enabled && !!ticketId,
    staleTime: STALE,
  });

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      ticketId,
      status,
    }: {
      ticketId: string;
      status: TicketStatus;
    }) =>
      adminService
        .updateSupportTicketStatus(ticketId, status)
        .then((r) => r.data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "support"] }),
  });
};

// ── Analytics ────────────────────────────────────────────────────────────────
export const useAdminAnalytics = () =>
  useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => adminService.getAnalytics().then((r) => r.data.data),
    staleTime: STALE,
  });

// ── Announcements ──────────────────────────────────────────────────────────────
export const useEmailTemplates = () =>
  useQuery({
    queryKey: ["admin", "announcements", "templates"],
    queryFn: () =>
      adminService.getEmailTemplates().then((r) => r.data.data.items),
    staleTime: STALE,
  });

export const usePlatformAnnouncements = () =>
  useQuery({
    queryKey: ["admin", "announcements", "platform"],
    queryFn: () =>
      adminService.getPlatformAnnouncements().then((r) => r.data.data.items),
    staleTime: STALE,
  });

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<PlatformAnnouncement>) =>
      adminService.createPlatformAnnouncement(payload).then((r) => r.data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin", "announcements", "platform"],
      }),
  });
};
