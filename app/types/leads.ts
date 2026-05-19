export type LeadStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "expired"
  | "closed";

export interface LeadIntakePayload {
  budget?: string;
  matter?: string; // UUID string
  freeText?: string;
  location?: string;
  preference?: string;
}

export interface LeadUserAccount {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  email?: string;
  phone?: string | null;
  role?: string;
  isAnonymous?: boolean;
  avgRating?: string;
  reviewCount?: number;
  connectionCount?: number;
  locationCity?: string | null;
  locationCountry?: string | null;
}

export interface Lead {
  id: string;
  userAccountId: string;
  lawyerAccountId: string;
  intakePayload: LeadIntakePayload;
  relevanceScore: number;
  status: LeadStatus;
  conversationId: string | null;
  createdAt: string;
  respondedAt: string | null;
  expiresAt: string;
  userAccount: LeadUserAccount;
}