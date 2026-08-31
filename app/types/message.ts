export interface Conversation {
  id: string;
  otherParty?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    isAnonymous?: boolean;
    /** Role of the other party — USER, LAWYER, or FIRM.
     *  Only USER accounts can be anonymous; lawyers/firms are always visible. */
    role?: string;
    /** Lawyer's phone — passed to engagement modal for WhatsApp link */
    phone?: string | null;
    /** Lawyer's email — passed to engagement modal for mailto link */
    email?: string | null;
  };
  lastMessagePreview?: string;
  lastMessageAt?: string;
  status: "open" | "closed";
  unread?: number;
  matterName?: string;
  intakeSummary?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderAccountId: string;
  body: string;
  createdAt: string;
  readAt?: string | null;
}
