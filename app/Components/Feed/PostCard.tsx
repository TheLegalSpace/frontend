// PostCard.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  BadgeCheck,
  FileText,
  Calendar,
  BookOpen,
  Clock,
  Flag,
  X,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import Avatar from "./Avatar";
import { postsService } from "@/services/posts.services";
import { useToast } from "@/app/context/ToastContext";
import type { ReportReason } from "@/app/types/posts";

export interface Post {
  id: string;
  authorAccountId: string;
  author: string;
  authorInitials: string;
  avatarUrl?: string;
  isVerified: boolean;
  timeAgo: string;
  body: string;
  pdfUrl?: string | null;
  title?: string | null;
  pdfName?: string | null;
  pdfSizeBytes?: number | null;
  likes: number;
  dislikes: number;
  userReaction: "like" | "dislike" | null;
  createdAt?: string;
  moderationStatus?: "under_review" | null;
}

function formatArticleDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

interface Props {
  post: Post;
  onReact: (id: string, reaction: "like" | "dislike") => void;
  onReported?: (id: string) => void;
}

export default function PostCard({ post, onReact, onReported }: Props) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  // ── Report modal state ──
  const [showReportModal, setShowReportModal] = useState(false);
  const [reasons, setReasons] = useState<ReportReason[]>([]);
  const [loadingReasons, setLoadingReasons] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reported, setReported] = useState(false);

  const handleOpenProfile = () => {
    if (!post.authorAccountId) return;
    router.push(
      `/dashboard/feeds?accountId=${encodeURIComponent(post.authorAccountId)}`,
    );
  };

  // ── Fetch reasons when modal opens ──
  const openReportModal = async () => {
    setShowReportModal(true);
    if (reasons.length > 0) return; // already loaded
    setLoadingReasons(true);
    try {
      const res = await postsService.getReportReasons();
      setReasons(res.data.items);
    } catch {
      showError("Couldn't load report reasons. Try again.");
      setShowReportModal(false);
    } finally {
      setLoadingReasons(false);
    }
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setSelectedReason("");
    setDetails("");
  };

  // ── Submit report ──
  const handleSubmitReport = async () => {
    if (!selectedReason) return;
    const reason = reasons.find((r) => r.value === selectedReason);
    if (reason?.requiresDetails && !details.trim()) {
      showError("Please tell us what's wrong with this post");
      return;
    }

    setSubmitting(true);
    try {
      const res = await postsService.reportPost(
        post.id,
        selectedReason,
        details.trim() || undefined,
      );
      const { alreadyReported, postHidden } = res.data;

      if (alreadyReported) {
        showSuccess(res.message);
      } else {
        showSuccess(res.message);
      }

      setReported(true);
      closeReportModal();

      // Optimistic removal from feed (postHidden is always true on success)
      if (postHidden && onReported) {
        onReported(post.id);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Something went wrong. Try again.";
      // Rate limit friendly
      if (
        msg.toLowerCase().includes("rate") ||
        msg.toLowerCase().includes("limit")
      ) {
        showError("You've reported a lot of posts recently, try again later");
      } else {
        showError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Reset if post changes
  useEffect(() => {
    setReported(false);
  }, [post.id]);

  // ── Render ──

  return (
    <>
      <div className="border-b border-[#E6EAED] py-5 last:border-b-0 hover:bg-white/30 transition w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3 px-4">
          <button
            type="button"
            onClick={handleOpenProfile}
            className="flex items-center gap-3 flex-1 min-w-0 text-left"
          >
            <Avatar
              initials={post.authorInitials}
              avatarUrl={post.avatarUrl}
              size={40}
            />

            <div className="flex-1 min-w-0 flex gap-1 flex-col">
              <span className="font-medium text-[14px] text-gray-900 font-['Geist'] hover:text-[#1D4ED8] transition-colors">
                {post.author}
              </span>
              <span className="text-xs text-gray-400 shrink-0 flex gap-1 items-center">
                <Clock size={16} /> {post.timeAgo}
              </span>
            </div>
          </button>

          {!reported && (
            <button
              type="button"
              onClick={openReportModal}
              title="Report this post"
              aria-label="Report this post"
            >
              <Flag
                size={16}
                className="text-[#CA0808] shrink-0 cursor-pointer hover:text-red-600 transition-colors"
              />
            </button>
          )}
          {reported && (
            <span className="text-[11px] text-gray-400 shrink-0 flex items-center gap-1">
              <Flag size={12} className="text-gray-300" />
              Reported
            </span>
          )}
        </div>

        {/* Moderation badge — author only, when auto-hidden */}
        {post.moderationStatus === "under_review" && (
          <div className="mx-4 mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
            <ShieldAlert size={14} className="text-amber-600 shrink-0" />
            <span className="text-[12px] text-amber-700 font-medium">
              Under review — temporarily hidden from others
            </span>
          </div>
        )}

        {/* Body */}
        <p className="px-4 text-[15px] text-gray-800 leading-6 whitespace-pre-line mb-3 font-['Geist']">
          {post.body}
        </p>

        {/* Article preview — matches profile style */}
        {post.pdfUrl && (
          <div className="mx-4 border border-[#E5E7EB] rounded-xl overflow-hidden mb-3">
            <div className="flex items-center gap-3 p-3">
              <div className="w-12 h-12 bg-[#1F2937] rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white text-[9px] font-bold tracking-wide">
                  ARTICLE
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-[#1F2937] leading-tight line-clamp-2">
                  {post.title ?? post.pdfName ?? "Attached Article"}
                </p>
                {post.createdAt && (
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-[#9CA3AF]" />
                    <span className="text-[11px] text-[#9CA3AF]">
                      {formatArticleDate(post.createdAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between px-3 py-2 border-t border-[#F3F4F6]">
              <a
                href={post.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-[#6B7280] hover:text-[#1F2937] transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Read Article
              </a>
            </div>
          </div>
        )}

        {/* Reactions */}
        <div className="px-4 flex items-center gap-5">
          <button
            onClick={() => onReact(post.id, "like")}
            className={`flex items-center gap-1.5 text-sm transition ${
              post.userReaction === "like"
                ? "text-blue-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <ThumbsUp
              size={16}
              className={post.userReaction === "like" ? "border-blue-600" : ""}
            />
            {post.likes > 0 && (
              <span className="font-medium">{post.likes}</span>
            )}
          </button>

          <button
            onClick={() => onReact(post.id, "dislike")}
            className={`flex items-center gap-1.5 text-sm transition ${
              post.userReaction === "dislike"
                ? "text-red-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <ThumbsDown
              size={16}
              className={
                post.userReaction === "dislike" ? "border-red-600" : ""
              }
            />
            {post.dislikes > 0 && (
              <span className="font-medium">{post.dislikes}</span>
            )}
          </button>
        </div>
      </div>

      {/* ── Report Modal ── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeReportModal}
          />

          {/* Sheet */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-[16px] font-semibold text-gray-900 font-['Geist']">
                Report Post
              </h2>
              <button
                onClick={closeReportModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {loadingReasons ? (
                <div className="flex items-center justify-center py-10 gap-2 text-gray-400 text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Loading...
                </div>
              ) : (
                reasons.map((reason) => (
                  <label
                    key={reason.value}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      selectedReason === reason.value
                        ? "border-[#1D4ED8] bg-blue-50/50"
                        : "border-[#E5E7EB] hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={() => {
                        setSelectedReason(reason.value);
                        if (!reason.requiresDetails) setDetails("");
                      }}
                      className="mt-0.5 shrink-0 accent-[#1D4ED8]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-900">
                        {reason.label}
                      </p>
                      <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">
                        {reason.description}
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>

            {/* Details textarea — shown when reason requires it or user wants to add context */}
            {selectedReason && (
              <div className="px-5 pb-3">
                <textarea
                  placeholder={
                    reasons.find((r) => r.value === selectedReason)
                      ?.requiresDetails
                      ? "Tell us what's wrong with this post..."
                      : "Add more context (optional)"
                  }
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  className="w-full text-[13px] border border-[#E5E7EB] rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
                />
                <p className="text-[11px] text-gray-400 text-right mt-1">
                  {details.length}/1000
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="px-5 py-4 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
              <button
                onClick={closeReportModal}
                className="px-4 py-2 text-[13px] font-medium text-gray-600 hover:text-gray-900 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={!selectedReason || submitting}
                className="px-5 py-2 text-[13px] font-semibold text-white bg-[#CA0808] hover:bg-red-700 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
