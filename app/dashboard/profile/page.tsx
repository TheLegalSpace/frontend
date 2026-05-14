// app/(dashboard)/profile/page.tsx
"use client";

import ProfileCard from "@/app/Components/ProfileCard";
import EventsPanel from "@/app/Components/EventPanel";
import { useMe } from "@/hooks/useProfile";

export default function ProfilePage() {
  const { data: profile, isLoading, error } = useMe();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="w-7 h-7 rounded-full border-2 border-gray-300 border-t-black animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-sm text-gray-400">
          Failed to load profile.
        </p>
      </div>
    );
  }

  return (
    <div className=" w-full bg-[#F5F5F5] min-h-screen px-4 lg:px-6 py-6">
      <div className="max-w-362.5 mx-auto">
        {/* Page title */}
        <div className="mb-5">
          <h1 className="font-[Instrument_Serif] text-[38px] leading-none font-light text-[#1F2937]">
            Profile
          </h1>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_0.72fr] gap-5 items-start">
          {/* Left */}
          <div className="min-w-0">
            <ProfileCard
              profile={profile.data}
              isOwnProfile={true}
            />
          </div>

          {/* Right */}
          <div className="min-w-0">
            <EventsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}