// PostCard.tsx
"use client";

import { ThumbsUp, ThumbsDown, BadgeCheck } from "lucide-react";
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
  article?: {
    title: string;
    date: string;
    reads: number;
    slug: string;
  };
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

      {/* Article: Same width as body */}
      {post.article && (
        <div className="mb-3">
          <ArticleCard article={post.article} />
        </div>
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