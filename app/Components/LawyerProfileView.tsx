// app/Components/LawyerProfileView.tsx
"use client";

import { ChevronRight } from "lucide-react";
import ProfileCard, { ProfileData } from "./ProfileCard";
import EventsPanel from "./EventPanel";
import { useProfileById } from "@/hooks/useProfile";

interface Props {
  accountId: string;
  /** Return to the (preserved) search results. */
  onBack: () => void;
}

export default function LawyerProfileView({ accountId, onBack }: Props) {
  const { data: profile, isLoading, error } = useProfileById(accountId);

  const account = profile?.data;
  const role = account?.role;
  const profileLabel =
    role === "FIRM" ? "Firm Profile" : role === "LAWYER" ? "Lawyer Profile" : "Profile";

  return (
    <div className="w-full bg-white min-h-screen">
      {/* Breadcrumb header — Search Results › Lawyer Profile */}
      <div className="h-[75px] flex items-center border-b border-[#E5E7EB] px-4">
        <nav className="flex items-center gap-1.5 text-[14px]">
          <button
            type="button"
            onClick={onBack}
            className="text-[#6B7280] hover:text-[#1F2937] hover:underline transition-colors"
          >
            Search Results
          </button>
          <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
          <span className="font-[Instrument_Serif] text-[18px] font-light text-[#1F2937]">
            {profileLabel}
          </span>
        </nav>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[70vh]">
          <div className="w-7 h-7 rounded-full border-2 border-gray-300 border-t-black animate-spin" />
        </div>
      ) : error || !account ? (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
          <p className="text-sm text-gray-400">Failed to load this profile.</p>
          <button
            type="button"
            onClick={onBack}
            className="text-[13px] font-medium text-[#2563EB] hover:underline"
          >
            Back to search results
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-5 items-start px-4 py-5">
          <div className="min-w-0">
            <ProfileCard
              profile={{
                ...(account as ProfileData),
                practiceAreas:
                  account.practiceAreas?.map((area: unknown) =>
                    typeof area === "string"
                      ? area
                      : (area as { name: string }).name,
                  ) ?? [],
              }}
              isOwnProfile={false}
            />
          </div>
          <div className="min-w-0">
            <EventsPanel />
          </div>
        </div>
      )}
    </div>
  );
}
