// components/settings/NotificationsSection.tsx
"use client";

import { useState } from "react";
import { PushNotificationManager } from "@/app/Components/PushNotificationManager";

export default function NotificationsSection() {
  const [whatsappAlert, setWhatsappAlert] = useState(false);

  return (
    <div className="py-6 border-b border-[#E5E7EB] space-y-6">
      <h2 className="text-[15px] font-semibold text-gray-900">Notifications</h2>

      {/* Push Notifications */}
      <div className="flex items-center justify-between">
        <div className="flex-1 pr-4">
          <p className="text-[13px] text-gray-600">
            Get push notifications on your device even when the app is closed.
          </p>
        </div>
      </div>
      <PushNotificationManager />

      {/* WhatsApp alert toggle */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-[13px] text-gray-600 flex-1 pr-4">
          Get a WhatsApp message if you don't respond to a client in 1 hour.
        </p>
        <button
          onClick={() => setWhatsappAlert(!whatsappAlert)}
          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
            whatsappAlert ? "bg-[#2563EB]" : "bg-gray-200"
          }`}
          aria-label="Toggle WhatsApp alerts"
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
              whatsappAlert ? "right-0.5" : "left-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
