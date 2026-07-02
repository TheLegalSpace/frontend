// components/profile/ProfileCard.tsx
"use client";

import {
  EyeOff,
  Eye,
  Star,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  //  Trash2,
  Clock,
  BookOpen,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  profileService,
  type ProfileArticle,
} from "@/services/profile.services";
import { useProfileArticles, useProfileReviews } from "@/hooks/useProfile";
import { useToggleFollow } from "@/hooks/useFollows";

import type { Review } from "@/services/profile.services";
import { useAuth } from "../context/AuthContext";
import { USER_ROLES } from "../types/types";
import ProfileManagementModal from "./ProfileManagementModal";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LawyerProfile {
  id: string;
  accountId: string;
  scn: string;
  callToBarYear: number;
  nbaBranch: string;
  feeRangeMin: number;
  feeRangeMax: number;
  verificationStatus: "verified" | "pending" | "rejected";
}

export interface ProfileData {
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
  lawyerProfile: LawyerProfile | null;
  firmProfile: Record<string, unknown> | null;
  practiceAreas:
    | string[]
    | {
        id: string;
        name: string;
        slug: string;
        isActive: boolean;
        createdAt: string;
      }[];
}

interface ProfileCardProps {
  profile: ProfileData;
  isOwnProfile?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string): string {
  if (!name) return "?";
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
  return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

function normalizePracticeAreas(areas: ProfileData["practiceAreas"]): string[] {
  return areas.map((a) => (typeof a === "string" ? a : a.name));
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) !== 1 ? "s" : ""} ago`;
}

function formatArticleDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getArticlePreview(article: ProfileArticle): string | null {
  const text = article.excerpt ?? article.body;
  if (!text) return null;
  if (text.length <= 220) return text;
  return `${text.slice(0, 220).trim()}…`;
}

// ─── Article Card ─────────────────────────────────────────────────────────────
function ProfileArticleCard({
  article,
  profile,
  isOwnProfile,
}: {
  article: ProfileArticle;
  profile: ProfileData;
  isOwnProfile: boolean;
}) {
  const initials = getInitials(profile.fullName);
  const preview = getArticlePreview(article);
  const publishedAt = article.publishedAt ?? article.createdAt ?? "";

  return (
    <div className="border-b border-[#E5E7EB] pb-5 mb-5 last:border-0 last:mb-0">
      {/* Author row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#374151] flex items-center justify-center text-[11px] font-medium text-white shrink-0 overflow-hidden">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <span className="text-[13px] font-medium text-[#1F2937]">
            {profile.fullName}
          </span>
        </div>
        {publishedAt && (
          <div className="flex items-center gap-1 text-[12px] text-[#6B7280]">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeAgo(publishedAt)}</span>
          </div>
        )}
      </div>

      {/* Preview text */}
      {preview && (
        <p className="text-[13px] text-[#4B5563] leading-relaxed mb-3">
          {preview}
        </p>
      )}

      {/* Article card */}
      <div className="border border-[#E5E7EB] rounded-xl overflow-hidden mb-3">
        <div className="flex items-center gap-3 p-3">
          <div className="w-12 h-12 bg-[#1F2937] rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white text-[9px] font-bold tracking-wide">
              ARTICLE
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-[#1F2937] leading-tight line-clamp-2">
              {article.title}
            </p>
            {publishedAt && (
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3 text-[#9CA3AF]" />
                <span className="text-[11px] text-[#9CA3AF]">
                  {formatArticleDate(publishedAt)}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between px-3 py-2 border-t border-[#F3F4F6]">
          {/* <div className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span className="text-[11px] text-[#9CA3AF]">
              {article.readCount ?? 0} Reads
            </span>
          </div> */}
          <Link
            href={article.pdfUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-[#6B7280] hover:text-[#1F2937] transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Read Article
          </Link>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="p-1.5 text-[#9CA3AF]  transition-colors flex items-center gap-1.5"
        >
          <ThumbsUp className="w-4 h-4" />
          {article.likeCount}
        </button>
        <button
          type="button"
          className="p-1.5 text-[#9CA3AF]  transition-colors flex items-center gap-1.5"
        >
          <ThumbsDown className="w-4 h-4" />
          {article.dislikeCount}
        </button>
        {/* {isOwnProfile && (
          <button
            type="button"
            className="p-1.5 text-[#9CA3AF] hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )} */}
      </div>
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-3 ps-2">
          <div
            className={`h-9 w-9 overflow-hidden rounded-full border-[3px] border-white transition-all duration-300 ${
              review.reviewer.isAnonymous ? "blur-sm" : ""
            }`}
          >
            {review.reviewer.avatarUrl ? (
              <img
                src={review.reviewer.avatarUrl}
                alt={review.reviewer.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#D1D5DB] text-4xl font-bold tracking-wider text-[#374151]">
                {review.reviewer.isAnonymous
                  ? "??"
                  : getInitials(review.reviewer.fullName)}
              </div>
            )}
          </div>
          <div>
            <h4 className="text-[13px] font-medium text-[#1F2937]">
              {review.reviewer.fullName}
            </h4>
            <div className="flex gap-0.5 mt-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3.5 w-3.5 ${
                    star <= review.rating
                      ? "fill-amber-400 text-amber-400"
                      : "fill-[#D1D5DB] text-[#D1D5DB]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <p className="text-[12px] text-[#9CA3AF] whitespace-nowrap shrink-0">
          {new Date(review.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
      {review.body && (
        <p className="text-[13px] leading-relaxed text-[#4B5563]">
          {review.body}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProfileCard({
  profile,
  isOwnProfile = false,
}: ProfileCardProps) {
  const rating = parseFloat(profile.avgRating || "0");
  const [isAnonymous, setIsAnonymous] = useState(profile.isAnonymous);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(!!profile.isFollowing);
  const [showFollowTip, setShowFollowTip] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const toggleFollow = useToggleFollow();

  const isLawyer = profile.role === USER_ROLES.LAWYER;
  const isFirm = profile.role === USER_ROLES.FIRM;
  const isUser = profile.role === USER_ROLES.USER;
  const showArticles = isLawyer || isFirm;
  const practiceAreaNames = normalizePracticeAreas(profile.practiceAreas);

  // ─── Data fetching ──────────────────────────────────────────────────────────
  const {
    data: articlesData,
    isLoading: articlesLoading,
    error: articlesError,
  } = useProfileArticles(profile.id, 1, 5, showArticles);

  const { data: reviewsData, isLoading: reviewsLoading } = useProfileReviews(
    profile.id,
  );

  const articles = articlesData?.items ?? [];
  const reviews = reviewsData?.items ?? [];

  // ✅ Compute real rating breakdown from fetched reviews
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    const value =
      reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    return { star, value, count };
  });

  useEffect(() => {
    setIsAnonymous(profile.isAnonymous);
  }, [profile.isAnonymous]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsFollowing(!!profile.isFollowing);
  }, [profile.isFollowing]);

  const handleToggleFollow = async () => {
    if (isOwnProfile || toggleFollow.isPending) return;
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing); // optimistic
    if (!wasFollowing) {
      setShowFollowTip(true);
      setTimeout(() => setShowFollowTip(false), 3000);
    }
    try {
      await toggleFollow.mutateAsync({
        accountId: profile.id,
        isFollowing: wasFollowing,
      });
    } catch {
      setIsFollowing(wasFollowing); // revert on failure
    }
  };

  const handleToggleAnonymous = async () => {
    if (!isOwnProfile) return;
    setIsToggling(true);
    try {
      await profileService.toggleAnonymous(!isAnonymous);
      setIsAnonymous((prev) => !prev);
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    } catch (err) {
      console.error("Failed to toggle anonymous:", err);
    } finally {
      setIsToggling(false);
    }
  };

  const displayName = isAnonymous ? "Anonymous User" : profile.fullName;
  const displayEmail = isAnonymous ? maskEmail(profile.email) : profile.email;

  const handleProfileModal = () => setShowProfileModal(true);
  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-2xl  bg-white">
        {/* Cover */}
        {isFirm && (
          <div className="relative h-44 w-full overflow-hidden bg-[#E5E7EB]">
            {profile.coverUrl ? (
              <img
                src={profile.coverUrl}
                alt="cover"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span>No Cover Photo</span>
              </div>
            )}
          </div>
        )}

        {/* Profile header */}
        <div className="px-4 pt-4 pb-5">
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="mt-1 shrink-0">
              <div
                className={`h-20 w-20 overflow-hidden rounded-full border-[3px] border-white  transition-all duration-300 ${
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
                  <div className="flex h-full w-full items-center justify-center text-4xl font-bold tracking-wider text-[#374151]">
                    {isAnonymous ? "??" : getInitials(profile.fullName)}
                  </div>
                )}
              </div>
            </div>

            {/* Name + actions */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h1 className="text-[20px] font-semibold text-[#1F2937] leading-tight truncate">
                    {displayName}
                  </h1>
                  {profile.bio && (
                    <p className="text-[13px] text-[#6B7280] mt-0.5 line-clamp-2">
                      {profile.bio}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isOwnProfile ? (
                    <>
                      <div
                        // href="/dashboard/settings"
                        onClick={() => handleProfileModal()}
                        className="text-[12px] font-medium text-[#2563EB] hover:underline whitespace-nowrap"
                      >
                        Profile Management
                      </div>

                      {/* Anonymous toggle — users only */}
                      {isUser && (
                        <div className="relative">
                          <button
                            onClick={handleToggleAnonymous}
                            disabled={isToggling}
                            aria-label="Toggle anonymous"
                            className={`flex h-7 w-7 items-center justify-center rounded-full transition-all disabled:opacity-50 ${
                              isAnonymous
                                ? "bg-[#111827] text-white"
                                : "bg-gray-100 hover:bg-gray-200 text-[#374151]"
                            }`}
                          >
                            {isAnonymous ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>

                          {showTooltip && (
                            <div className="absolute right-0 top-9 z-10 w-44 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 shadow-sm">
                              <div className="absolute -top-1.5 right-2.5 h-3 w-3 rotate-45 border-l border-t border-[#E5E7EB] bg-white" />
                              <p className="text-[12px] text-[#374151] text-center leading-relaxed">
                                You are now{" "}
                                <span className="font-medium">
                                  {isAnonymous ? "anonymous" : "visible"}
                                </span>{" "}
                                on The Legal Space
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    (isLawyer || isFirm) && (
                      <Link
                        href="/dashboard/find-lawyer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E5F5EA] text-[#16A34A] text-[12px] font-medium rounded-full hover:opacity-90 transition-opacity"
                      >
                        Get a Lawyer
                      </Link>
                    )
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {profile.locationCity && (
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-[#E5F5EA] rounded-full">
                    <MapPin className="w-3 h-3 text-[#16A34A]" />
                    <span className="text-[12px] font-medium text-[#16A34A]">
                      {profile.locationCity}
                      {profile.locationCountry
                        ? `, ${profile.locationCountry}`
                        : ""}
                    </span>
                    {(isLawyer || isFirm) && (
                      <span className="text-[12px] text-[#16A34A]"></span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-1 px-2.5 py-1 bg-[#FEF9C3] rounded-full">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="text-[12px] font-medium text-amber-700">
                    {rating.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center px-2.5 py-1 bg-[#EFF6FF] rounded-full">
                  <span className="text-[12px] font-medium text-[#2563EB]">
                    {profile.connectionCount}+ Connections
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to bar — lawyers only */}
        {isLawyer && profile.lawyerProfile && (
          <div className="px-4 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#1F2937]">
                Call to bar
              </span>
              <span className="text-[13px] text-[#6B7280]">
                {profile.lawyerProfile.callToBarYear}
              </span>
            </div>
          </div>
        )}
        {isFirm && profile.firmProfile && (
          <div className="px-4 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-semibold text-[#000000]">
                Firm Establishment
              </span>
              <span className="text-[11px] text-[#000000] font-['Geist']">
                {String(profile.firmProfile.firmEstablishmentYear ?? "")}
              </span>
            </div>
          </div>
        )}

        {/* Practice Areas */}
        {practiceAreaNames.length > 0 && (
          <div className="px-4 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-medium text-[#1F2937]">
                Practice Areas
              </span>
              {isOwnProfile && (
                <Link
                  href="/dashboard/settings"
                  className="text-[12px] font-medium text-[#2563EB] hover:underline flex items-center gap-1"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </Link>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {practiceAreaNames.map((area, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] text-[12px] font-medium rounded-full"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent Articles — lawyers & firms only */}
        {showArticles && (
          <div className="px-4 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-medium text-[#1F2937]">
                Recent Articles
              </span>
              {articles.length > 0 && (
                <Link
                  href="/dashboard/posts"
                  // type="button"
                  className="text-[12px] font-medium text-[#2563EB] hover:underline"
                >
                  View All Articles
                </Link>
              )}
            </div>

            {articlesLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-black animate-spin" />
              </div>
            ) : articlesError ? (
              <p className="text-center text-[13px] text-[#9CA3AF] py-4">
                Failed to load articles.
              </p>
            ) : articles.length === 0 ? (
              <p className="text-center text-[13px] text-[#9CA3AF] py-4">
                No articles yet
              </p>
            ) : (
              // pick only two articles
              articles
                .slice(0, 2)
                .map((article) => (
                  <ProfileArticleCard
                    key={article.id}
                    article={article}
                    profile={profile}
                    isOwnProfile={isOwnProfile}
                  />
                ))
            )}
            {/* articles.map((article) => (
                <ProfileArticleCard
                  key={article.id}
                  article={article}
                  profile={profile}
                  isOwnProfile={isOwnProfile}
                />
              ))
            )} */}
          </div>
        )}

        {/* Ratings & Reviews */}
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-medium text-[#1F2937]">
              Ratings & Reviews
            </span>
            {/* <button className="text-[12px] font-medium text-[#2563EB] hover:underline">
              View all
            </button> */}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-[auto_1fr] gap-6 mb-6">
            <div>
              <div className="text-[40px] font-bold text-[#1F2937] leading-none">
                {rating.toFixed(1)}
              </div>
              <div className="mt-2 flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-[#D1D5DB] fill-[#D1D5DB]"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-[12px] text-[#6B7280]">
                ({profile.reviewCount} Reviews)
              </p>
            </div>

            {/* ✅ Real breakdown from fetched reviews */}
            <div className="flex flex-col justify-center gap-1.5">
              {ratingBreakdown.map((item) => (
                <div
                  key={item.star}
                  className="grid grid-cols-[48px_1fr_28px] items-center gap-2"
                >
                  <span className="text-[11px] text-[#6B7280]">
                    {item.star} stars
                  </span>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                  <span className="text-right text-[11px] text-[#374151]">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ✅ Real review list */}
          {reviewsLoading ? (
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-black animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-center text-[13px] text-[#9CA3AF] py-6">
              No reviews yet
            </p>
          ) : (
            <div className="border-t border-[#E5E7EB] pt-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profile Management modal */}
      {isOwnProfile && showProfileModal && (
        <ProfileManagementModal
          profile={profile}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}
