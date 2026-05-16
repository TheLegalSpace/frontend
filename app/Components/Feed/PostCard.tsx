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
    <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-3">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar initials={post.authorInitials} avatarUrl={post.avatarUrl} size={44} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[15px] text-gray-900">
              {post.author}
            </span>
            {post.isVerified && (
              <BadgeCheck size={15} className="text-blue-500 shrink-0" />
            )}
          </div>
          <span className="text-xs text-gray-400">
            {post.timeAgo}
          </span>
        </div>
      </div>

      {/* Body */}
      <p className="text-sm text-gray-700 leading-6 whitespace-pre-line mb-3">
        {post.body}
      </p>

      {/* Article */}
      {post.article && <ArticleCard article={post.article} />}

      {/* Reactions */}
      <div className="flex items-center gap-5 mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={() => onReact(post.id, "like")}
          className={`flex items-center gap-1.5 text-sm transition ${
            post.userReaction === "like"
              ? "text-blue-600"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <ThumbsUp size={18} className={post.userReaction === "like" ? "fill-blue-600" : ""} />
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
          <ThumbsDown size={18} className={post.userReaction === "dislike" ? "fill-red-600" : ""} />
          {post.dislikes > 0 && <span className="font-medium">{post.dislikes}</span>}
        </button>
      </div>
    </div>
  );
}