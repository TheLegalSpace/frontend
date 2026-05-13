"use client";

import Avatar from "./Avatar";
import ArticleCard from "./ArticleCard";

export interface Post {
  id: number;
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
  onReact: (id: number, reaction: "like" | "dislike") => void;
}

export default function PostCard({ post, onReact }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar
            initials={post.authorInitials}
            avatarUrl={post.avatarUrl}
          />

          <div className="flex items-center gap-1">
            <span className="font-bold text-[15px] text-gray-900">
              {post.author}
            </span>

            {post.isVerified && <span>✓</span>}
          </div>
        </div>

        <span className="text-xs text-gray-400">
          🕐 {post.timeAgo}
        </span>
      </div>

      {/* Body */}
      <p className="text-sm text-gray-700 leading-7 whitespace-pre-line">
        {post.body}
      </p>

      {/* Article */}
      {post.article && <ArticleCard article={post.article} />}

      {/* Reactions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onReact(post.id, "like")}
          className={`px-3 py-1.5 rounded-full border text-sm transition ${
            post.userReaction === "like"
              ? "bg-blue-100 border-blue-300 text-blue-700"
              : "border-gray-200 text-gray-500"
          }`}
        >
          👍 {post.likes > 0 ? post.likes : ""}
        </button>

        <button
          onClick={() => onReact(post.id, "dislike")}
          className={`px-3 py-1.5 rounded-full border text-sm transition ${
            post.userReaction === "dislike"
              ? "bg-red-100 border-red-300 text-red-700"
              : "border-gray-200 text-gray-500"
          }`}
        >
          👎 {post.dislikes > 0 ? post.dislikes : ""}
        </button>
      </div>
    </div>
  );
}