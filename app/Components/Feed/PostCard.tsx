// PostCard.tsx
"use client";

import { ThumbsUp, ThumbsDown, BadgeCheck, FileText, Calendar, BookOpen, Clock } from "lucide-react";
import Avatar from "./Avatar";

export interface Post {
  id: string;
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
}

export default function PostCard({ post, onReact }: Props) {
  return (
    <div className="border-b border-[#E6EAED] py-5 last:border-b-0 hover:bg-white/30 transition w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3 px-4">
        <Avatar
          initials={post.authorInitials}
          avatarUrl={post.avatarUrl}
          size={40}
        />

        <div className="flex-1 min-w-0 flex items-center gap-1.5">
          <span className="font-medium text-[24px] text-gray-900 font-['Instrument_Serif']">
            {post.author}
          </span>
          {post.isVerified && (
            <BadgeCheck size={16} className="text-blue-500 shrink-0" />
          )}
        </div>

        <span className="text-xs text-gray-400 shrink-0">{post.timeAgo}</span>
      </div>

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
            className={post.userReaction === "like" ? "fill-blue-600" : ""}
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
            className={post.userReaction === "dislike" ? "fill-red-600" : ""}
          />
          {post.dislikes > 0 && (
            <span className="font-medium">{post.dislikes}</span>
          )}
        </button>
      </div>
    </div>
  );
}