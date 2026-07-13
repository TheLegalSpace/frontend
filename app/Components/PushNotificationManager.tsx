"use client";
import { useState, useEffect } from "react";
import { urlBase64ToUint8Array } from "../utils/web-push";
import { notificationsService } from "@/services/notifications.services";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/services/api";

export function PushNotificationManager() {
  const { user } = useAuth(); // ✅ only user needed
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      if (user) {
        checkSubscription();
      }
    }
  }, [user]);

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  }

  function getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return "mobile";
    if (/tablet/i.test(ua)) return "tablet";
    return "desktop";
  }

  async function subscribeToPush() {
    if (!user) {
      alert("Please sign in to enable notifications.");
      return;
    }

    setIsLoading(true);
    try {
      let permission = Notification.permission;
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }
      if (permission !== "granted") {
        alert(
          "Permission denied. Please allow notifications in your browser settings.",
        );
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ),
      });

      const serializedSub = JSON.parse(JSON.stringify(sub));
      await notificationsService.savePushSubscription(
        serializedSub,
        getDeviceType(),
      );

      setIsSubscribed(true);
      alert("✅ Notifications enabled!");
    } catch (error) {
      console.error("Subscription error:", error);
      alert("❌ Failed to enable notifications. See console for details.");
    } finally {
      setIsLoading(false);
    }
  }

  async function unsubscribeFromPush() {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await notificationsService.deletePushSubscription(
          subscription.endpoint,
        );
        setIsSubscribed(false);
        alert("✅ Notifications disabled.");
      }
    } catch (error) {
      console.error("Unsubscribe error:", error);
      alert("❌ Failed to disable notifications.");
    } finally {
      setIsLoading(false);
    }
  }

  async function sendTestNotification() {
    if (!message.trim()) return;
    try {
      const response = await api.post("/notifications/push/test", {
        message: message.trim(),
      });
      if (response.data.success) {
        alert("✅ Test notification sent!");
        setMessage("");
      } else {
        alert("❌ Test failed: " + response.data.error);
      }
    } catch (error) {
      console.error("Test error:", error);
      alert("❌ Failed to send test notification.");
    }
  }

  if (!isSupported) {
    return (
      <p className="text-sm text-gray-500">
        Push notifications are not supported in this browser.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
      {isSubscribed ? (
        <div className="space-y-3">
          <p className="text-sm text-green-600">✅ You are subscribed.</p>
          <button
            onClick={unsubscribeFromPush}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
          >
            {isLoading ? "Processing..." : "Unsubscribe"}
          </button>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Test message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md text-sm"
            />
            <button
              onClick={sendTestNotification}
              disabled={!message || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              Send Test
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-600">You are not subscribed.</p>
          <button
            onClick={subscribeToPush}
            disabled={isLoading}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm"
          >
            {isLoading ? "Subscribing..." : "Enable Notifications"}
          </button>
        </div>
      )}
    </div>
  );
}
