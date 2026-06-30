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

// ── Dashboard ───────────────────────────────────────────────────────────────

export interface AdminDashboardStats {
  totalRevenue: number;
  totalRevenueGrowth: number;
  totalUsers: number;
  totalUsersGrowth: number;
  activeSubscribers: number;
  activeSubscribersGrowth: number;
  newEnquiries: number;
  newEnquiriesGrowth: number;
  onTheDocket: number;
  onTheDocketGrowth: number;
}

export type ActivityType =
  | "advertisement_submitted"
  | "lawyer_verified"
  | "support_ticket"
  | "subscription_payment";

export interface RecentActivity {
  id: string;
  type: ActivityType;
  actorName: string;
  description: string;
  createdAt: string;
  amount?: number;
}

export interface PendingTask {
  id: string;
  label: string;
  count: number;
  href: string;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  recentActivities: RecentActivity[];
  pendingTasks: PendingTask[];
}

// ── Users ───────────────────────────────────────────────────────────────────

export type AdminUserType = "Lawyer" | "Law Firm" | "Client";
export type AdminUserStatus = "Active" | "Under Review" | "Suspended" | "Failed";

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
  name: string; // e.g. "Community Membership", "Professional Membership"
  audience: "USER" | "LAWYER" | "FIRM";
  billingLabel: string; // "Every 6 Months"
  priceMonthly: number;
  priceAnnual: number;
  isAnnual: boolean;
  description: string;
  features: string[];
  userCount: number;
  userCountLabel: string; // "users" | "firms"
}

export interface SubscriptionsStats {
  activeSubscribers: number;
  activeSubscribersGrowth: number;
  monthlyRevenue: number;
  monthlyRevenueGrowth: number;
  annualRevenue: number;
  annualRevenueGrowth: number;
  churnRate: number;
  churnRateChange: number;
}

export interface SubscriptionsData {
  stats: SubscriptionsStats;
  plans: SubscriptionPlan[];
}

// ── Revenue ──────────────────────────────────────────────────────────────────

export interface RevenueStats {
  totalRevenue: number;
  totalRevenueGrowth: number;
  revenueThisMonth: number;
  revenueThisMonthGrowth: number;
  subscriptionRevenue: number;
  onTheDocketRevenue: number;
}

export interface MonthlyRevenueRow {
  month: string;
  subscriptions: number;
  onTheDocket: number;
  total: number;
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
  revenueGenerated: number;
}

export interface DocketEventListItem {
  id: string;
  eventName: string;
  organizerEmail: string;
  flyerUrl: string;
  additionalInfoUrl?: string | null;
  startDate: string;
  endDate: string;
  status: EventStatus;
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
  payment: {
    amountPaid: number;
    paymentDate: string;
    paymentMethod: string;
    durationLabel: string;
    startDate: string;
    endDate: string;
  };
  metrics: {
    totalViews: number;
    totalClicks: number;
    ctr: number;
    costPerClick: number;
  };
  audience: {
    byDevice: { label: string; percent: number }[];
    byGeography: { label: string; percent: number }[];
    byUserType: { label: string; percent: number }[];
  };
}

export interface CreateEventPayload {
  eventName: string;
  flyer: File | null;
  promotionStartDate: string;
  promotionEndDate: string;
  additionalLink?: string;
}

// ── TLS Services (enquiries / leads) ─────────────────────────────────────────

export type TlsServiceStatus = "New" | "In Progress" | "Closed" | "Lead Lost";

export interface TlsServicesStats {
  totalEnquiries: number;
  newEnquiries: number;
  inProgress: number;
  closed: number;
}

export interface TlsServiceListItem {
  id: string;
  name: string;
  email: string;
  requestedService: string;
  dateSubmitted: string;
  status: TlsServiceStatus;
}

export interface TlsServiceDetail {
  id: string;
  lawFirmName: string;
  fullName: string;
  email: string;
  phone: string;
  serviceNeeded: string;
  hasWebsite: string;
  currentWebsiteUrl?: string;
  status: TlsServiceStatus;
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

export type TicketStatus = "Open" | "In Progress" | "Closed";

export interface SupportStats {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
}

export interface SupportTicketListItem {
  id: string;
  ticketRef: string;
  userName: string;
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
