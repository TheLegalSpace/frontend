// app/actions/notification-actions.ts — DEPRECATED
//
// This file was part of the old push notification flow that stored subscriptions
// in a server-action in-memory Map. Push subscriptions are now persisted to
// the backend database via notificationsService.savePushSubscription() and
// dispatched by the backend (services/webPush.ts).
//
// This file is kept to avoid breaking any unknown imports but should be
// removed after verifying nothing references it.
//
// Related files:
//   - hooks/usePushNotifications.ts     (new hook — use this instead)
//   - services/notifications.services.ts (backend API calls)
//   - app/context/AuthContext.tsx        (auto-subscribe on login)
"use server";

import webpush from "web-push";
import type { PushSubscription } from "web-push";

webpush.setVapidDetails(
  "mailto:notifications@thelegalspace.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

const subscriptions: Map<string, PushSubscription> = new Map();

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: {
    url?: string;
    [key: string]: any;
  };
}

export async function subscribeUser(subscription: PushSubscription) {
  const subscriptionId = subscription.endpoint;
  subscriptions.set(subscriptionId, subscription);
  return { success: true };
}

export async function unsubscribeUser() {
  return { success: true };
}

export async function sendNotificationToUser(
  userId: string,
  payload: NotificationPayload,
) {
  const results = [];
  for (const [, subscription] of subscriptions) {
    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: payload.icon || "/icons/icon-192.png",
          data: payload.data || {},
          vibrate: [100, 50, 100],
        }),
      );
      results.push({ success: true });
    } catch (error) {
      console.error("Error sending notification:", error);
      results.push({ success: false, error: String(error) });
    }
  }

  return { success: true, results };
}

export async function sendBulkNotification(payload: NotificationPayload) {
  const results = [];
  for (const [, subscription] of subscriptions) {
    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: payload.icon || "/icons/icon-192.png",
          data: payload.data || {},
        }),
      );
      results.push({ success: true });
    } catch (error) {
      console.error("Error sending notification:", error);
      results.push({ success: false, error: String(error) });
    }
  }

  return { success: true, results };
}
