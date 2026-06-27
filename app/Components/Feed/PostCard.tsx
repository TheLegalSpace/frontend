// PostCard.tsx
"use client";

import { ThumbsUp, ThumbsDown, BadgeCheck, FileText, Calendar, BookOpen } from "lucide-react";
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
}

interface Props {
  post: Post;
  onReact: (id: string, reaction: "like" | "dislike") => void;
}

export default function PostCard({ post, onReact }: Props) {
  return (
    <div className="border-b border-[#E6EAED] py-5 last:border-b-0 hover:bg-gray-50/30 transition w-full">
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

      {/* Article preview — matches screenshot style */}
      {post.pdfUrl && (
        <a
          href={post.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-4 flex items-center gap-3 mt-2 mb-3 p-3 rounded-xl border border-[#E5E7EB] hover:bg-gray-50 transition group"
        >
          {/* Dark "ARTICLE" thumbnail */}
          <div className="w-12 h-12 rounded-lg bg-gray-900 flex flex-col items-center justify-center shrink-0">
            <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">
              Article
            </span>
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-900 leading-snug truncate group-hover:text-blue-600 transition">
              {post.title ?? post.pdfName ?? "Attached Article"}
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400 flex-wrap">
              {post.pdfSizeBytes && (
                <span className="flex items-center gap-1">
                  <BookOpen size={10} />
                  {(post.pdfSizeBytes / (1024 * 1024)).toFixed(1)} MB
                </span>
              )}
              <span className="ml-auto text-blue-600 font-medium flex items-center gap-1">
                <FileText size={10} />
                Read Article
              </span>
            </div>
          </div>
        </a>
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