// components/profile/ProfileCard.tsx
"use client";

import { EyeOff, Eye, Star } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/profile.services";

interface ProfileData {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: "USER" | "LAWYER" | "FIRM" | "ADMIN";
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  locationCity: string | null;
  locationCountry: string | null;
  isAnonymous: boolean;
  avgRating: string;
  reviewCount: number;
  connectionCount: number;
  followerCount: number;
  followingCount: number;
  status: string;
  lastActiveAt: string;
  createdAt: string;
  isFollowing: boolean;
  practiceAreas: string[];
}

interface ProfileCardProps {
  profile: ProfileData;
  isOwnProfile?: boolean;
}

// ✅ Helper functions defined before component
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  const masked =
    local[0] + "*".repeat(local.length - 2) + local[local.length - 1];
  return `${masked}@${domain}`;
}

export default function ProfileCard({
  profile,
  isOwnProfile = false,
}: ProfileCardProps) {
  const rating = parseFloat(profile.avgRating || "0");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(profile.isAnonymous);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const queryClient = useQueryClient();

  // ✅ Sync with server state if profile refreshes
  useEffect(() => {
    setIsAnonymous(profile.isAnonymous);
  }, [profile.isAnonymous]);

  const handleToggleAnonymous = async (): Promise<void> => {
    if (!isOwnProfile) return;
    setIsToggling(true);
    try {
      await profileService.toggleAnonymous(!isAnonymous);
      setIsAnonymous((prev: boolean) => !prev); // ✅ typed prev
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    } catch (err: unknown) {
      console.error("Failed to toggle anonymous:", err);
    } finally {
      setIsToggling(false);
    }
  };

  const displayName = isAnonymous ? "Anonymous User" : profile.fullName;
  const displayEmail = isAnonymous ? maskEmail(profile.email) : profile.email;

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F7F7F7]">
        {/* Cover */}
        <div className="relative h-45 w-full overflow-hidden bg-[#E5E7EB]">
          {profile.coverUrl ? (
            <img
              src={profile.coverUrl}
              alt="cover"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[#ECECEC]">
              <span className="text-sm text-gray-400">No cover image</span>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="bg-[#F7F7F7] px-5 pb-6 pt-4">
          <div className="relative flex gap-3">
            {/* Avatar */}
            <div className="mb-3 px-1">
              <div
                className={`h-24 w-24 overflow-hidden rounded-full border-[3px] border-[#2A2A2A] transition-all duration-300 ${
                  isAnonymous ? "blur-sm" : ""
                }`}
              >
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#D1D5DB] text-sm font-medium text-[#374151]">
                    {isAnonymous ? "??" : getInitials(profile.fullName)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-[Instrument_Serif] text-[24px] leading-tight font-medium tracking-[-0.5px] text-[#1F2937]">
                    {displayName}
                  </h1>
                  <p className="font-[Geist] mt-1 text-[13px] text-[#6B7280]">
                    {displayEmail}
                  </p>
                </div>

                {/* Anonymous toggle */}
                {isOwnProfile && (
                  <div className="relative">
                    <button
                      onClick={handleToggleAnonymous}
                      disabled={isToggling}
                      aria-label="Toggle anonymous"
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition-all disabled:opacity-50 ${
                        isAnonymous
                          ? "bg-[#111827] text-white"
                          : "hover:bg-[#EAEAEA] text-[#111827]"
                      }`}
                    >
                      {isAnonymous ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>

                    {/* Tooltip */}
                    {showTooltip && (
                      <div className="absolute right-0 top-10 z-10 w-48 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5">
                        <div className="absolute -top-1.5 right-2.5 h-3 w-3 rotate-45 border-l border-t border-[#E5E7EB] bg-white" />
                        <p className="text-[12px] text-[#374151] text-center leading-relaxed">
                          You are now{" "}
                          <span className="font-medium">
                            {isAnonymous ? "anonymous" : "visible"}
                          </span>{" "}
                          on <br />
                          The Legal Space
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {!isOwnProfile && (
                  <Link
                    href="/find-lawyer"
                    className="flex h-9 items-center justify-center bg-[#E5F5EA] px-4 text-[12px] font-medium text-[#16A34A] transition hover:opacity-90"
                  >
                    Get a lawyer ⚖️
                  </Link>
                )}
                <div className="flex h-9 items-center justify-center  bg-[#F5C4511A] px-4 text-[12px] font-medium text-[#D89A17]">
                  {rating.toFixed(1)} ⭐
                </div>
                <div className="flex h-9 items-center justify-center r bg-[#0084FF1A] px-4 text-[12px] font-medium text-[#2563EB]">
                  {profile.connectionCount}+ Connections
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-5 h-px w-full bg-[#E5E7EB]" />

          {/* Ratings & Reviews */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[16px] font-medium text-[#111827]">
                Ratings & Reviews
              </h2>
              <button className="text-[12px] font-medium text-[#2563EB] hover:underline">
                View all
              </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[160px_1fr]">
              <div>
                <div className="text-[40px] leading-none font-medium text-black">
                  {rating.toFixed(1)}
                </div>
                <div className="mt-3 flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(rating)
                          ? "fill-[#E4B04A] text-[#E4B04A]"
                          : "text-[#CFCFCF]"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-[12px] text-[#6B7280]">
                  ({profile.reviewCount} Reviews)
                </p>
              </div>

              {/* Breakdown */}
              <div className="flex flex-col justify-center gap-2.5 pt-1">
                {[
                  { star: 5, value: 88, count: 488 },
                  { star: 4, value: 32, count: 74 },
                  { star: 3, value: 6, count: 14 },
                  { star: 2, value: 0, count: 0 },
                  { star: 1, value: 0, count: 0 },
                ].map((item) => (
                  <div
                    key={item.star}
                    className="grid grid-cols-[52px_1fr_32px] items-center gap-2"
                  >
                    <span className="text-[12px] text-[#111827]">
                      {item.star} stars
                    </span>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]">
                      <div
                        className="h-full rounded-full bg-[#D6A041]"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                    <span className="text-right text-[12px] text-[#111827]">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews list */}
            <div className="mt-6 border-t border-[#E5E7EB] pt-6">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="border-b border-[#E5E7EB] pb-5 mb-5 last:border-0 last:mb-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4DDE7] text-sm font-medium text-[#8B3A5A]">
                        TI
                      </div>
                      <div>
                        <h4 className="font-[Instrument_Serif] text-[14px] font-medium text-[#1F2937]">
                          Olaniwun Ajayi LP
                        </h4>
                        <div className="mt-1.5 flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="h-4 w-4 fill-[#E4B04A] text-[#E4B04A]"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-[12px] text-[#6B7280] whitespace-nowrap">
                      Jan 20, 2024
                    </p>
                  </div>
                  <p className="mt-3 text-[13px] leading-relaxed text-[#4B5563]">
                    Working with Oluwaseun was smooth. He communicated his needs
                    clearly, enhancing our workflow. His openness to feedback
                    and quick decisions made the project efficient and
                    enjoyable. I look forward to future collaborations.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}