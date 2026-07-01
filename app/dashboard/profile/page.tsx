// app/(dashboard)/profile/page.tsx
"use client";

import ProfileCard, { ProfileData } from "@/app/Components/ProfileCard";
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
        <p className="text-sm text-gray-400">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className=" w-full bg-white min-h-screen  ">
      <div className=" ">
        {/* Page title */}
        <div className=" h-[75px] flex items-center border-b border-[#E5E7EB] px-4 fixed w-full bg-white z-99999">
          <h1 className="font-[Instrument_Serif] text-[20px] leading-none font-light text-[#1F2937]">
            Profile
          </h1>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-5 items-start">
          {/* Left */}
          <div className="min-w-0 mt-[95px]">
            <ProfileCard
              profile={{
                ...(profile?.data as ProfileData),
                // ✅ Map objects to name strings before passing
                practiceAreas:
                  profile.data.practiceAreas?.map((area: any) =>
                    typeof area === "string" ? area : area.name,
                  ) ?? [],
              }}
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
