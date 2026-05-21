export interface Conversation {
  id: string;
  otherParty?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    isAnonymous?: boolean;
  };
  lastMessagePreview?: string;
  lastMessageAt?: string;
  status: "open" | "closed"; // normalized from API's "active" | "closed"
  unread?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderAccountId: string;
  body: string;
  createdAt: string;
  readAt?: string | null;
}