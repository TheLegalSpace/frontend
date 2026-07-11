// app/types/admin.ts
// Shared types for the Admin module (/admin/*).
// Mirrors the response shape used across the rest of the app:
// { error: boolean; message: string; data: T }

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Dashboard (API revamp) ─────────────────────────────────────────────────

export interface DashboardCards {
  totalRevenueKobo: number;
  totalUsers: number;
  activeSubscribers: number;
  newEnquiriesThisWeek: number;
  onTheDocket: number;
}

export interface PendingTasks {
  serviceEnquiries: number;
  lawyerVerifications: number;
  eventsNeedReview: number;
}

export type RecentActivityKind =
  | "service_request"
  | "payment"
  | "verification"
  | "event"
  | "other";

export interface RecentActivity {
  kind: RecentActivityKind;
  title: string;
  description: string;
  at: string; // ISO 8601
}

export interface AdminDashboardData {
  cards: DashboardCards;
  pendingTasks: PendingTasks;
  recentActivities: RecentActivity[];
}

// Legacy aliases removed — prefer explicit kobo fields in dashboard types

export interface PendingTask {
  id: string;
  label: string;
  count: number;
  href: string;
}

// ── Users ───────────────────────────────────────────────────────────────────

export type AdminUserType = "Lawyer" | "Law Firm" | "Client";
export type AdminUserStatus =
  | "Active"
  | "Under Review"
  | "Suspended"
  | "Failed";

export interface AdminUserStats {
  totalUsers: number;
  lawyers: number;
  lawFirms: number;
  clients: number;
  verifiedLawyers: number;
  suspendedUsers: number;
}

export interface AdminUserListItem {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  userType: AdminUserType;
  subscription: string;
  status: AdminUserStatus;
}

export interface AccountListItem {
  id: string;
  fullName: string;
  email: string;
  subscription: string | null;
  role: "USER" | "LAWYER" | "FIRM" | "ADMIN";
  status: "active" | "suspended" | "deleted" | "under_review";
  membershipTier: "community" | "professional";
  createdAt?: string;
  lawyerProfile?: {
    verificationStatus: "pending" | "under_review" | "verified" | "rejected";
  } | null;
  firmProfile?: {
    verificationStatus: "pending" | "under_review" | "verified" | "rejected";
  } | null;
  phone?: string;
  yearOfCall?: string;
  jurisdiction?: string;
}

export interface AdminUserDetail extends AdminUserListItem {
  phone?: string;
  yearOfCall?: string;
  jurisdiction?: string;
  callToBarDocument?: {
    name: string;
    sizeKb: number;
    url: string;
  } | null;
}

// ── Subscriptions ───────────────────────────────────────────────────────────

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string; // e.g. "Community Membership", "Professional Membership"
  tier: string;
  forRole: "LAWYER" | "FIRM" | null;
  priceKobo: number;
  intervalMonths: number;
  features: string[];
  isActive: boolean;
  subscriberCount: number;
}

export interface SubscriptionsStats {
  activeSubscribers: number;
  monthlyRevenueKobo: number;
  allTimeRevenueKobo: number;
  churnRate: number;
  churnApproximate: boolean;
}

export interface SubscriptionsData {
  stats: SubscriptionsStats;
  plans: SubscriptionPlan[];
}

// ── Revenue ──────────────────────────────────────────────────────────────────

export interface RevenueStats {
  totalRevenueKobo: number;
  totalRevenueGrowth: number;
  revenueThisMonthKobo: number;
  revenueThisMonthGrowth: number;
  subscriptionRevenueKobo: number;
  onTheDocketRevenueKobo: number;
}

export interface MonthlyRevenueRow {
  month: string;
  subscriptionsKobo: number;
  onTheDocketKobo: number;
  totalKobo: number;
  growth: number;
}

export interface RevenueData {
  stats: RevenueStats;
  monthly: MonthlyRevenueRow[];
  pagination: Pagination;
}

// ── On the Docket (Events) ───────────────────────────────────────────────────

export type EventStatus = "Approved" | "Pending" | "Rejected";

export interface DocketStats {
  totalEvents: number;
  pendingEvents: number;
  approvedEvents: number;
  // new API field: revenue in kobo
  revenueGeneratedKobo?: number;
}

export interface DocketEventListItem {
  id: string;
  type:
    | "event_promotion"
    | "website"
    | "appointment"
    | "productivity"
    | "consulting";
  status: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  firmName?: string;
  payload?: {
    endAt: string;
    links: string[];
    title: string;
    startAt: string;
    flyerUrl: string;
    shareOnSocial: boolean;
  };
  amount?: number;
  pricing?: {
    days: number;
    totalKobo: number;
    dailyRateKobo: number;
    socialAddonKobo: number;
  };
  paymentStatus?: string;
  eventId?: string;
  createdAt: string;
  updatedAt: string;
  event?: {
    id: string;
    title: string;
    description?: string | null;
    coverUrl?: string;
    location?: string | null;
    startAt?: string;
    endAt?: string;
    registrationUrl?: string | null;
    status?: string;
    clickCount?: number;
    createdByAdminId?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  account?: {
    id: string;
    fullName?: string;
    email?: string;
    role?: string;
  };
  // Backward-compatible fields
  eventName?: string;
  organizerEmail?: string;
  flyerUrl?: string;
  additionalInfoUrl?: string | null;
  startDate?: string;
  endDate?: string;
}

export interface DocketEventDetail {
  id: string;
  eventName: string;
  flyerUrl: string;
  additionalInfoUrl?: string | null;
  address: string;
  tlsSocials?: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  status: EventStatus;
  payment?: {
    amountPaid: number;
    paymentDate: string;
    paymentMethod: string;
    durationLabel: string;
    startDate: string;
    endDate: string;
  };
  amount?: number;
  pricing?: {
    days?: number;
    totalKobo: number;
    dailyRateKobo: number;
    socialAddonKobo: number;
  };
  payload?: {
    endAt: string;
    links: string[];
    title: string;
    startAt: string;
    flyerUrl: string;
    shareOnSocial: boolean;
  };
  event?: {
    id: string;
    title: string;
    description?: string | null;
    coverUrl?: string;
    location?: string | null;
    startAt?: string;
    endAt?: string;
    registrationUrl?: string | null;
    status?: string;
    clickCount?: number;
    createdByAdminId?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  paymentStatus?: string;
  metrics: {
    approximate?: boolean;
    totalViews: number;
    totalClicks: number;
    ctr: number;
    costPerClick?: number;
    costPerClickKobo?: number;
    audience?: {
      byDevice?: { label: string; percent: number }[];
      byGeography?: { label: string; percent: number }[];
      byUserType?: Record<string, { percentage: number }>;
    };
  };
  audience?: {
    byDevice: { label: string; percent: number }[];
    byGeography: { label: string; percent: number }[];
    byUserType: { label: string; percent: number }[];
  };
}

export interface CreateEventPayload {
  eventName: string;
  flyer: File | null;
  startAt: string;
  endAt: string;
  shareOnSocial: Boolean;
  links: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  firmName?: string;
  title: string;
  promotionStartDate: string;
  promotionEndDate: string;
  additionalLink?: string;
}

// ── TLS Services (enquiries / leads) ─────────────────────────────────────────

export type TlsServiceStatus =
  | "new"
  | "in_progress"
  | "lead_lost"
  | "closed"
  | "pending"
  | "active"
  | "completed";

export interface TlsServicesStats {
  totalEnquiries: number;
  newEnquiries: number;
  inProgress: number;
  closed: number;
}

export interface TlsServiceListItem {
  id: string;
  type:
    | "website"
    | "appointment"
    | "productivity"
    | "consulting"
    | "event_promotion";
  status: TlsServiceStatus;
  paymentStatus?: string;
  amount?: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  firmName?: string;
  eventId?: string;
  account?: {
    id: string;
    fullName?: string;
    email?: string;
    role?: string;
  };
  createdAt: string;
  updatedAt: string;
  payload?: Record<string, unknown>;
  pricing?: {
    days: number;
    totalKobo: number;
    dailyRateKobo: number;
    socialAddonKobo: number;
  };
  event?: {
    id: string;
    title: string;
    description?: string | null;
    coverUrl?: string;
    location?: string | null;
    startAt?: string;
    endAt?: string;
    registrationUrl?: string | null;
    status?: string;
    clickCount?: number;
    createdByAdminId?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface TlsServiceDetail extends TlsServiceListItem {
  note?: string;
}

// ── Legal News Survey ─────────────────────────────────────────────────────────

export interface SurveyFeatureRequest {
  label: string;
  votes: number;
}

export interface LegalNewsSurveyData {
  totalResponses: number;
  yesResponses: number;
  noResponses: number;
  participationRate: number;
  participationRateGrowth: number;
  byUserType: { label: string; count: number; percent: number }[];
  topFeatureRequests: SurveyFeatureRequest[];
  distribution: { label: string; percent: number; color: string }[];
}

// ── Support Center ────────────────────────────────────────────────────────────

export type TicketStatus = "open" | "in_progress" | "closed";

export interface SupportStats {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
}

export interface SupportTicketListItem {
  id: string;
  ticketNumber: string;
  name: string;
  subject: string;
  dateSubmitted: string;
  status: TicketStatus;
}

export interface SupportTicketDetail {
  id: string;
  ticketRef: string;
  name: string;
  email: string;
  category: string;
  createdAt: string;
  message: string;
  status: TicketStatus;
}

// ── Analytics ──────────────────────────────────────────────────────────────────

export interface AnalyticsData {
  dailyActiveUsers: number;
  dailyActiveUsersGrowth: number;
  monthlyActiveUsers: number;
  monthlyActiveUsersGrowth: number;
  avgSessionDuration: string;
  avgSessionDurationGrowth: string;
  pageViews: number;
  pageViewsGrowth: number;
  mostVisitedPages: { label: string; views: number }[];
  topSearchQueries: { query: string; count: number }[];
  platformStats: {
    desktopUsers: number;
    mobileUsers: number;
    tabletUsers: number;
    avgLoadTime: string;
    bounceRate: number;
    pagesPerSession: number;
  };
}

// ── Announcements ──────────────────────────────────────────────────────────────

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  updatedAt: string;
}

export interface PlatformAnnouncement {
  id: string;
  title: string;
  body: string;
  isActive: boolean;
  scheduledFor?: string | null;
  createdAt: string;
}
