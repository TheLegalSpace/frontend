// services/intake.service.ts
import { api } from "./api";
import { PracticeArea } from "./practice-areas.services";

export interface LawyerProfile {
  id: string;
  accountId: string;
  scn: string;
  callToBarYear: number;
  nbaBranch: string;
  // Fees are no longer returned to clients (only the account itself and admins
  // see them). These are now absent from every client-facing payload — never
  // render them for a viewer that isn't the profile owner.
  feeRangeMin?: number;
  feeRangeMax?: number;
  verificationStatus: "verified" | "pending" | "rejected";
  verificationFlags: Record<string, unknown>;
  practicingCertExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}
// services/intake.services.ts - add to existing file

export interface TextSearchPayload {
  text: string;
}

export interface ExtractedIntake {
  matter: { id: string; name: string } | null;
  budget: string | null;
  location: string | null;
  preference: string | null;
}

export interface TextSearchPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * The offer block that now accompanies every matchmaking search response.
 *
 * The platform matches rather than lists: `items` holds at most two entries
 * (one lawyer, one firm) and `offer` describes the state of that match — how
 * long it stays actionable, when they can be matched again, whether it was
 * replayed from an earlier search (pinned), and whether the budget had to be
 * relaxed because nobody was inside it.
 */
export interface MatchOffer {
  batchId: string;
  practiceAreaId: string;
  /** When this match stops being actionable (7 days) — POST /requests rejects after. */
  expiresAt: string;
  /** When they may be matched again for this practice area (48h). */
  cooldownUntil: string | null;
  /** True = the offer they already had, replayed rather than redrawn. */
  pinned: boolean;
  /** True = nobody was inside their budget; ceiling was lifted. */
  budgetRelaxed: boolean;
  offersUsed: number;
  offersAllowed: number;
  windowDays: number;
}

// Returned when the backend has enough info to actually search.
export interface TextSearchSuccessData {
  items: MatchResult[];
  pagination: TextSearchPagination;
  extracted: ExtractedIntake;
  offer: MatchOffer | null;
}

// Returned when the backend couldn't confidently extract matter +
// (budget or location) from the free text — `items`/`pagination` are
// absent, and the frontend should prompt for the missing fields instead.
export interface TextSearchClarifyData {
  text: string;
  extracted: ExtractedIntake;
}

// Discriminated on `error` so TS narrows `data` correctly at each call site.
export type TextSearchBody =
  | { error: true; message: string; data: TextSearchClarifyData }
  | { error: false; message: string; data: TextSearchSuccessData };

// add to intakeService object
// export const intakeService = {
//   search: (payload: SearchPayload) =>
//     api.post<SearchResponse>("/matchmaking/search", payload),

//   searchByText: (payload: TextSearchPayload) =>
//     api.post<TextSearchResponse>("/matchmaking/search-by-text", payload),
// };
export interface PracticeAreaLink {
  id: string;
  accountId: string;
  practiceAreaId: string;
  createdAt: string;
}

export interface LawyerAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  locationCity: string | null;
  locationCountry: string | null;
  isAnonymous: boolean;
  avgRating: string;
  reviewCount: number;
  connectionCount: number;
  followerCount: number;
  followingCount: number;
  lastActiveAt: string;
  createdAt: string;
  lawyerProfile: LawyerProfile | null;
  firmProfile: Record<string, unknown> | null;
  practiceAreaLinks: PracticeAreaLink[];
}

export interface MatchResult {
  account: LawyerAccount;
  score: number;
  matchedFactors: string[];
}

export interface SearchResponse {
  error: boolean;
  message: string;
  data: {
    items: MatchResult[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    offer: MatchOffer | null;
  };
}

/**
 * GET /matchmaking/availability?practiceAreaId=
 *
 * Call before walking the user through the intake so they aren't asked every
 * question and then hit with an error. `available` is the single boolean to
 * gate on; `onCooldown` and `quotaExhausted` say which message to show.
 */
export interface MatchAvailability {
  practiceAreaId: string;
  available: boolean;
  onCooldown: boolean;
  cooldownUntil: string | null;
  cooldownHours: number;
  hoursRemaining: number;
  offersUsed: number;
  offersAllowed: number;
  windowDays: number;
  quotaExhausted: boolean;
}

export interface AvailabilityResponse {
  error: boolean;
  message: string;
  data: MatchAvailability;
}

// ✅ Exact shape the API expects
export interface SearchPayload {
  matter: string; // practiceArea UUID
  budget: string;
  location: string;
  preference: "lawyer" | "firm" | "either";
  freeText: string;
}

export const BUDGET_OPTIONS = [
  { label: "Under ₦100k", value: "under_100k" },
  { label: "₦100k–₦500k", value: "100k_to_500k" },
  { label: "₦500k–₦2M", value: "500k_to_2m" },
  { label: "Above ₦2M", value: "above_2m" },
];

export const LOCATION_OPTIONS = [
  { label: "Lagos", value: "Lagos" },
  { label: "Abuja", value: "Abuja" },
  { label: "Port Harcourt", value: "Port Harcourt" },
  { label: "Kano", value: "Kano" },
  { label: "Ibadan", value: "Ibadan" },
  { label: "Anywhere", value: "Anywhere" },
];

export const PREFERENCE_OPTIONS = [
  { label: "Lawyer", value: "lawyer" },
  { label: "Law Firm", value: "firm" },
  { label: "Either", value: "either" },
];

export function buildIntakeSteps(practiceAreas: PracticeArea[]) {
  return [
    {
      question: "What is your legal matter about?",
      key: "matter" as const,
      options: practiceAreas
        .filter((a) => a.isActive)
        .map((a) => ({ label: a.name, value: a.id })),
    },
    {
      question: "What is your budget?",
      key: "budget" as const,
      options: BUDGET_OPTIONS,
    },
    {
      question: "Where do you need legal help?",
      key: "location" as const,
      options: LOCATION_OPTIONS,
    },
    {
      question: "Who would you prefer?",
      key: "preference" as const,
      options: PREFERENCE_OPTIONS,
    },
  ];
}

export const intakeService = {
  search: (payload: SearchPayload) =>
    api.post<SearchResponse>("/matchmaking/search", payload),

  searchByText: (payload: TextSearchPayload) =>
    api.post<TextSearchBody>("/matchmaking/search-by-text", payload),

  availability: (practiceAreaId: string) =>
    api.get<AvailabilityResponse>("/matchmaking/availability", {
      params: { practiceAreaId },
    }),
};
