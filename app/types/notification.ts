export type NotificationType = | "new_article"
  | "new_message"
  | "chat_expiry_warning"
  | "daily_chat_limit"
  | "request_accepted"
  | "request_declined"
  | "new_follower"
  | "new_review"
  | "chat_expiring"
  | "request_expiring"
  | "reply_reminder"
  | "unread_client_message"
  | string;

export interface NotificationArticle {
title: string;
slug: string;
readCount: number;
publishedAt: string;
}

export interface Notification {
    id: string;
    type: NotificationType;
    readAt: string | null;
    createdAt: string;
    payload: {
        actorName?: string;
        actorId?: string;
        message?: string;
        article?: NotificationArticle;
        conversationId?: string;
        // ── New notification types ──
        expiresAt?: string;   // chat_expiring, request_expiring
        requestId?: string;   // request_expiring
        messageId?: string;   // reply_reminder, unread_client_message
        [key: string]: unknown
    }
}

export interface NotificationsResponse {
  data: {
    items: Notification[];
    pagination: {        // ← was flat fields, now nested
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface UnreadCountResponse {
    data: { count: number}
}