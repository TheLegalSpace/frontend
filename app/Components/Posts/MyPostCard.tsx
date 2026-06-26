"use client";

import { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Clock,
  Loader2,
  FileText,
  X,
  BookOpen
} from "lucide-react";
import { MyPost } from "@/app/types/posts";
import { postsService } from "@/services/posts.services";
import Image from "next/image";

function getInitials(name: string) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function avatarColor(name: string) {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-green-100 text-green-700",
    "bg-amber-100 text-amber-700",
    "bg-pink-100 text-pink-700",
  ];
  if (!name) return colors[0];
  return colors[name.charCodeAt(0) % colors.length];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

interface Props {
  post: MyPost;
  currentAccountId: string;
  onDelete: (id: string) => void;
  cachedReaction: "like" | "dislike" | null;
  onReactionChange: (id: string, reaction: "like" | "dislike" | null) => void;
}

export default function MyPostCard({
  post,
  currentAccountId,
  onDelete,
  cachedReaction,
  onReactionChange,
}: Props) {
  const [likes, setLikes] = useState(post.likeCount);
  const [dislikes, setDislikes] = useState(post.dislikeCount);
  const [reaction, setReaction] = useState<"like" | "dislike" | null>(
    cachedReaction,
  );
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [viewingPdf, setViewingPdf] = useState(false);

  const isOwn = post.authorAccountId === currentAccountId;
  const displayName = post.author?.fullName ?? "Unknown";

  async function handleReact(type: "like" | "dislike") {
    const isSame = reaction === type;
    const newReaction = isSame ? null : type;

    setReaction(newReaction);
    setLikes((prev) =>
      type === "like"
        ? isSame
          ? prev - 1
          : prev + 1
        : reaction === "like"
          ? prev - 1
          : prev,
    );
    setDislikes((prev) =>
      type === "dislike"
        ? isSame
          ? prev - 1
          : prev + 1
        : reaction === "dislike"
          ? prev - 1
          : prev,
    );
    onReactionChange(post.id, newReaction);

    try {
      if (isSame) {
        await postsService.unreactToPost(post.id);
      } else {
        await postsService.reactToPost(post.id, type);
      }
    } catch {
      setReaction(reaction);
      setLikes(post.likeCount);
      setDislikes(post.dislikeCount);
      onReactionChange(post.id, reaction);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    try {
      await postsService.deletePost(post.id);
      onDelete(post.id);
    } catch (err) {
      console.error("Failed to delete:", err);
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <>
      <div className="border-b border-[#E5E7EB] px-5 py-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`relative w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 overflow-hidden ${avatarColor(
                post.author?.fullName ?? "",
              )}`}
            >
              {post.author?.avatarUrl ? (
                <Image
                  src={post.author.avatarUrl}
                  alt={displayName}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              ) : (
                getInitials(post.author?.fullName ?? "")
              )}
            </div>
            <span className="text-[24px] font-semibold text-gray-900 font-[Instrument_Serif]">
              {displayName}
            </span>
          </div>

          <span className="flex items-center gap-1 text-[11px] text-gray-400">
            <Clock size={11} />
            {timeAgo(post.createdAt)}
          </span>
        </div>

        {/* Body */}
        <p className="text-[14px] text-gray-700 leading-relaxed mb-3 font-[Geist]">
          {post.body}
        </p>

        {/* Article pill */}
        {post.pdfUrl && (
          <button
            onClick={() => setViewingPdf(true)}
            className="w-full flex items-center gap-3 mt-2 mb-3 p-3 rounded-xl border border-[#E5E7EB] hover:bg-gray-50 transition group text-left"
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
                {post.pdfName ?? "Attached Article"}
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
          </button>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={() => handleReact("like")}
            className={`flex items-center gap-1.5 text-[13px] transition ${
              reaction === "like"
                ? "text-blue-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <ThumbsUp size={15} />
            {likes > 0 && <span>{likes}</span>}
          </button>

          <button
            onClick={() => handleReact("dislike")}
            className={`flex items-center gap-1.5 text-[13px] transition ${
              reaction === "dislike"
                ? "text-red-500"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <ThumbsDown size={15} />
            {dislikes > 0 && <span>{dislikes}</span>}
          </button>

          {isOwn && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`flex items-center gap-1.5 text-[13px] transition ml-1 ${
                confirmDelete
                  ? "text-red-500"
                  : "text-gray-400 hover:text-red-400"
              }`}
              title={confirmDelete ? "Click again to confirm" : "Delete post"}
            >
              {deleting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Trash2 size={15} />
              )}
              {confirmDelete && <span className="text-[12px]">Confirm?</span>}
            </button>
          )}
        </div>
      </div>

      {/* PDF viewer overlay */}
      {/* PDF viewer overlay */}
      {viewingPdf && post.pdfUrl && (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-950">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-900 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <FileText size={15} className="text-gray-400 shrink-0" />
              <span className="text-[13px] text-gray-200 font-medium truncate">
                {post.pdfName ?? "Article PDF"}
              </span>
            </div>
            <button
              onClick={() => setViewingPdf(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-[12px] hover:bg-gray-700 transition shrink-0 ml-4"
            >
              <X size={13} />
              Close
            </button>
          </div>

          <iframe
            src={post.pdfUrl}
            className="flex-1 w-full border-0 bg-white"
            title={post.pdfName ?? "Article PDF"}
          />
        </div>
      )}
    </>
  );
}
