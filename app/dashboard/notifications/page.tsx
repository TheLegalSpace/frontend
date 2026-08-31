"use client";

import { useAuth } from "@/app/context/AuthContext";
import EventsPanel from "@/app/Components/EventPanel";
import NotificationsPage from "@/app/Components/Notifications/NotificationsPage";

export default function Page() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Fixed header */}
      <div className="fixed w-full top-0 z-10 bg-white border-b border-[#E6EAED]">
        <h1 className="text-[22px] font-regular text-gray-900 font-[Instrument_Serif] ps-4 pt-6 pb-4.25">
          Notifications
        </h1>
      </div>

      {/* Content */}
      <div className="mt-18.75 grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-0 items-start px-0 pt-4">
        <div className="min-w-0">
          <NotificationsPage />
        </div>
        {/* Right column spacer — keeps grid space on xl, renders EventsPanel on mobile */}
        <div className="min-w-0 xl:invisible">
          <EventsPanel />
        </div>
      </div>

      {/* Fixed EventsPanel on desktop — immune to ancestor overflow changes */}
      <div
        className="hidden xl:block fixed top-18.75 bg-white"
        style={{
          right: 0,
          width: "calc((100vw - 220px) * 0.4)",
          height: "calc(100vh - 75px)",
          overflowY: "auto",
        }}
      >
        <EventsPanel />
      </div>
    </div>
  );
}
