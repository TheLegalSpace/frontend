// app/actions/notification-actions.ts
"use server";

import webpush from "web-push";
import type { PushSubscription } from "web-push";

// Configure VAPID
webpush.setVapidDetails(
  "mailto:notifications@thelegalspace.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

// In production, store this in your database
// This is a simple in-memory store for demo
let subscriptions: Map<string, PushSubscription> = new Map();

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
  try {
    // Generate a unique ID for this subscription
    const subscriptionId = subscription.endpoint;
    subscriptions.set(subscriptionId, subscription);

    // In production, save to database:
    // await db.notificationSubscriptions.create({
    //   data: {
    //     endpoint: subscription.endpoint,
    //     keys: subscription.keys,
    //     userId: currentUserId, // Associate with user
    //   }
    // });

    return { success: true };
  } catch (error) {
    console.error("Error saving subscription:", error);
    return { success: false, error: "Failed to save subscription" };
  }
}

export async function unsubscribeUser() {
  try {
    // You'd typically pass the subscription ID or user ID
    // This is a simplified version
    return { success: true };
  } catch (error) {
    console.error("Error unsubscribing:", error);
    return { success: false, error: "Failed to unsubscribe" };
  }
}

// Send notification to specific user
export async function sendNotificationToUser(
  userId: string,
  payload: NotificationPayload,
) {
  try {
    // In production, get subscription from database by userId
    // const subscriptions = await db.notificationSubscriptions.findMany({
    //   where: { userId }
    // });

    // For demo, we'll send to all subscriptions
    const results = [];
    for (const [, subscription] of subscriptions) {
      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: payload.icon || "/pwa-192x192.png",
            badge: payload.badge || "/pwa-64x64.png",
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
  } catch (error) {
    console.error("Error sending notifications:", error);
    return { success: false, error: "Failed to send notifications" };
  }
}

// Send notification to multiple users (e.g., all lawyers)
export async function sendBulkNotification(payload: NotificationPayload) {
  try {
    // In production, get all active subscriptions from database
    // const subscriptions = await db.notificationSubscriptions.findMany({
    //   where: { active: true }
    // });

    const results = [];
    for (const [, subscription] of subscriptions) {
      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: payload.icon || "/pwa-192x192.png",
            badge: payload.badge || "/pwa-64x64.png",
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
  } catch (error) {
    console.error("Error sending bulk notifications:", error);
    return { success: false, error: "Failed to send notifications" };
  }
}
