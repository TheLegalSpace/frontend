export type NotificationType = | "new_article"
  | "new_message"
  | "chat_expiry_warning"
  | "daily_chat_limit"
  | "request_accepted"
  | "request_declined"
  | "new_follower"
  | "new_review"
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
        [key: string]: unknown
    }
}

export interface NotificationsResponse {
    data: {
        items: Notification[];
        total: number;
        page: number;
        limit: number;
    }
}

export interface UnreadCountResponse {
    data: { count: number}
}