// components/settings/NotificationsSection.tsx
"use client";

import { useState } from "react";

export default function NotificationsSection() {
  const [whatsappAlert, setWhatsappAlert] = useState(false);

  return (
    <div className="py-6 border-b border-gray-100">
      <h2 className="text-[15px] font-semibold text-gray-900 mb-4">
        Notifications
      </h2>
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-gray-600 flex-1 pr-4">
          Get a WhatsApp message if you don't respond to a client in 1 hour.
        </p>
        <button
          onClick={() => setWhatsappAlert(!whatsappAlert)}
          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
            whatsappAlert ? "bg-[#2563EB] " : "bg-gray-200 "
          }`}
          aria-label="Toggle WhatsApp alerts"
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
              whatsappAlert ? "right-0" : "left-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
