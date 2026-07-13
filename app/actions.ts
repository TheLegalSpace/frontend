// app/actions.ts — DEPRECATED
//
// This file was part of the old push notification flow that stored subscriptions
// in a server-action in-memory variable. Push subscriptions are now persisted
// to the backend database via notificationsService.savePushSubscription().
//
// The PushNotificationManager component no longer imports from this file.
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
  "mailto:your-email@thelegalspace.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

let subscription: PushSubscription | null = null;

export async function subscribeUser(sub: PushSubscription) {
  subscription = sub;
  return { success: true };
}

export async function unsubscribeUser() {
  subscription = null;
  return { success: true };
}

export async function sendNotification(message: string) {
  if (!subscription) {
    throw new Error("No subscription available");
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "Test Notification",
        body: message,
        icon: "/icon.png",
      }),
    );
    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { success: false, error: "Failed to send notification" };
  }
}
