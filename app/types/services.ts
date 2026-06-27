export type ServiceRequestType =
  | "website"
  | "appointment"
  | "productivity"
  | "consulting";

export interface BaseServiceRequestPayload {
  type: ServiceRequestType;
  contactName?: string;
  contactEmail: string;
  contactPhone?: string;
  firmName?: string;
}

// ── website ──────────────────────────────────────────────────────────────
export interface WebsitePayload {
  need: "new" | "redesign" | "migration";
  hasWebsite: boolean;
  currentWebsiteUrl?: string;
}

export interface WebsiteRequest extends BaseServiceRequestPayload {
  type: "website";
  payload: WebsitePayload;
}

// ── appointment ──────────────────────────────────────────────────────────
export interface AppointmentPayload {
  currentBooking: string;
  desiredBooking: string;
  numLawyers: number;
  numOffices: number;
  numPracticeAreas: number;
  requirements: string;
}

export interface AppointmentRequest extends BaseServiceRequestPayload {
  type: "appointment";
  payload: AppointmentPayload;
}

// ── productivity ─────────────────────────────────────────────────────────
export type ImprovementArea =
  | "Time Tracking"
  | "Operational Dashboard"
  | "Reporting & Analytics"
  | "Staff Management"
  | "Task Management"
  | "Internal Approvals"
  | "Other";

export interface ProductivityPayload {
  improvementAreas: ImprovementArea[];
  numLawyers: number;
  numOffices: number;
  numPracticeAreas: number;
  processToImprove: string;
}

export interface ProductivityRequest extends BaseServiceRequestPayload {
  type: "productivity";
  payload: ProductivityPayload;
}

// ── consulting ───────────────────────────────────────────────────────────
export type ConsultingHelpArea =
  | "Digital Transformation"
  | "Workflow Optimization"
  | "Legal-Tech Strategy"
  | "Law Firm Automation"
  | "Process Improvement"
  | "Other";

export type ConsultationType = "30min" | "60min" | "assessment";
export type MeetingFormat = "virtual" | "physical" | "none";

export interface ConsultingPayload {
  helpAreas: ConsultingHelpArea[];
  consultationType: ConsultationType;
  meetingFormat: MeetingFormat;
  preferredDate: string; // YYYY-MM-DD
  preferredTime: string; // HH:mm
  challenge: string;
}

export interface ConsultingRequest extends BaseServiceRequestPayload {
  type: "consulting";
  payload: ConsultingPayload;
}

export type ServiceRequestPayload =
  | WebsiteRequest
  | AppointmentRequest
  | ProductivityRequest
  | ConsultingRequest;

export interface ServiceRequest {
  id: string;
  type: ServiceRequestType | "event_promotion";
  status: string;
  amount?: number;
  pricing?: EventPromotionPricing;
  [key: string]: unknown;
}

export interface ApiEnvelope<T> {
  error: boolean;
  message: string;
  data: T;
}

// ── event promotion ─────────────────────────────────────────────────────
export interface EventPromotionPricing {
  days: number;
  dailyRateKobo: number;
  socialAddonKobo: number;
  totalKobo: number;
}

export interface EventPromotionFormValues {
  flyer: File | null;
  title: string;
  startAt: string; // ISO date-time
  endAt: string; // ISO date-time
  shareOnSocial: boolean;
  links: string; // comma-separated, raw input
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  firmName?: string;
  location?: string;
}

export interface EventPromotionResponseData {
  serviceRequest: ServiceRequest;
  event: {
    id: string;
    title: string;
    status: string;
    coverUrl: string;
    startAt: string;
    endAt: string;
  };
}

export interface ServiceRequestListItem extends ServiceRequest {
  event?: EventPromotionResponseData["event"];
}

export interface ServiceRequestListResponse {
  items: ServiceRequestListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}