// PostCard.tsx
"use client";

import { ThumbsUp, ThumbsDown, BadgeCheck, FileText } from "lucide-react";
import Avatar from "./Avatar";
import ArticleCard from "./ArticleCard";

export interface Post {
  id: string;
  author: string;
  authorInitials: string;
  avatarUrl?: string;
  isVerified: boolean;
  timeAgo: string;
  body: string;
  // ✅ replace article object with flat fields
  pdfUrl?: string | null;
  pdfName?: string | null;
  pdfSizeBytes?: number | null;
  likes: number;
  dislikes: number;
  userReaction: "like" | "dislike" | null;
}

interface Props {
  post: Post;
  onReact: (id: string, reaction: "like" | "dislike") => void;
}

export default function PostCard({ post, onReact }: Props) {
  return (
    <div className="border-b border-[#E6EAED] p-4 last:border-b-0 hover:bg-gray-50/30 transition">
      {/* Header: Avatar + Name + Time — all in one row, vertically centered */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar initials={post.authorInitials} avatarUrl={post.avatarUrl} size={40} />

        <div className="flex-1 min-w-0 flex items-center gap-1.5">
          <span className="font-medium text-[24px] text-gray-900 font-['Instrument_Serif']">
            {post.author}
          </span>
          {post.isVerified && (
            <BadgeCheck size={16} className="text-blue-500 shrink-0" />
          )}
        </div>

        <span className="text-xs text-gray-400 shrink-0">
          {post.timeAgo}
        </span>
      </div>

      {/* Body: Starts from avatar left edge, ends at timestamp right edge */}
      <p className="text-[15px] text-gray-800 leading-6 whitespace-pre-line mb-3 font-['Geist']">
        {post.body}
      </p>

      {post.pdfUrl && (
      <a
        href={post.pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center gap-2.5 mt-2 mb-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition group text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
          <FileText size={15} className="text-red-500" />
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-gray-800 truncate group-hover:text-blue-600 transition">
            {post.pdfName ?? "Attached Article"}
          </p>
          <p className="text-[11px] text-gray-400">
            {post.pdfSizeBytes
              ? `${(post.pdfSizeBytes / (1024 * 1024)).toFixed(1)} MB · PDF`
              : "PDF · tap to read"}
          </p>
        </div>
      </a>
    )}
      {/* Reactions: No top border, just icons */}
      <div className="flex items-center gap-5">
        <button
          onClick={() => onReact(post.id, "like")}
          className={`flex items-center gap-1.5 text-sm transition ${
            post.userReaction === "like"
              ? "text-blue-600"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <ThumbsUp size={16} className={post.userReaction === "like" ? "fill-blue-600" : ""} />
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
          <ThumbsDown size={16} className={post.userReaction === "dislike" ? "fill-red-600" : ""} />
          {post.dislikes > 0 && <span className="font-medium">{post.dislikes}</span>}
        </button>
      </div>
    </div>
  );
}