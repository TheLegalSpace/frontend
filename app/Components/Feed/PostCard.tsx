// PostCard.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ThumbsUp,
  ThumbsDown,
  BadgeCheck,
  BookOpen,
  Clock,
  AlertCircle,
} from "lucide-react";
import Avatar from "./Avatar";
import ReportPostModal from "./ReportPostModal";

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
  onReported: (id: string, alreadyReported: boolean, message: string) => void;
}

export default function PostCard({ post, onReact, onReported }: Props) {
  const router = useRouter();
  const [showReportModal, setShowReportModal] = useState(false);

  const handleOpenProfile = () => {
    if (!post.authorAccountId) return;
    router.push(`/dashboard/feeds?accountId=${encodeURIComponent(post.authorAccountId)}`);
  };

  return (
    <div className="border-b border-[#E6EAED] py-5 last:border-b-0 hover:bg-white/30 transition w-full relative">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3 px-4">
        <button
          type="button"
          onClick={handleOpenProfile}
          className="flex items-start gap-3 flex-1 min-w-0 text-left"
        >
          <Avatar
            initials={post.authorInitials}
            avatarUrl={post.avatarUrl}
            size={40}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-[24px] text-gray-900 font-['Instrument_Serif'] hover:text-[#1D4ED8] transition-colors">
                {post.author}
              </span>
              {post.isVerified && (
                <BadgeCheck size={16} className="text-blue-500 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Clock size={12} className="text-gray-400" />
              <span className="text-xs text-gray-400">{post.timeAgo}</span>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setShowReportModal(true)}
          className="text-red-500 hover:text-red-600 transition shrink-0"
          aria-label="Report post"
          title="Report post"
        >
          <AlertCircle size={18} />
        </button>
      </div>

      {/* Under-review badge — only ever present for the author's own auto-hidden post */}
      {post.moderationStatus === "under_review" && (
        <div className="mx-4 mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs text-amber-700">
          Under review, temporarily hidden from others
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
          {post.likes > 0 && <span className="font-medium">{post.likes}</span>}
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
            className={post.userReaction === "dislike" ? "border-red-600" : ""}
          />
          {post.dislikes > 0 && (
            <span className="font-medium">{post.dislikes}</span>
          )}
        </button>
      </div>

      {showReportModal && (
        <ReportPostModal
          postId={post.id}
          onClose={() => setShowReportModal(false)}
          onReported={(alreadyReported, message) => {
            setShowReportModal(false);
            onReported(post.id, alreadyReported, message);
          }}
        />
      )}
    </div>
  );
}