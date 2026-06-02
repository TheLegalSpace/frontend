"use client";

import { useState } from "react";
import PostCard from "./PostCard";
import { api } from "@/services/api";
import { useFeed, useFeedCache, type FeedTab, setCachedReaction } from "@/hooks/useFeed";

const TABS: FeedTab[] = ["All", "Top Firms", "Top Lawyers", "Articles"];

export default function Feed() {
  const [activeTab, setActiveTab] = useState<FeedTab>("All");
  const { data: posts = [], isLoading } = useFeed(activeTab);
  const { updatePostReaction, invalidateFeed } = useFeedCache();

  async function handleReact(id: string, reaction: "like" | "dislike") {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    const isSameReaction = post.userReaction === reaction;
    const newReaction = isSameReaction ? null : reaction;

    // Save to localStorage immediately so it survives refresh
    setCachedReaction(id, newReaction);

    // Optimistic cache update
    updatePostReaction(activeTab, id, (p) => {
      if (isSameReaction) {
        return {
          ...p,
          userReaction: null,
          likes: reaction === "like" ? p.likes - 1 : p.likes,
          dislikes: reaction === "dislike" ? p.dislikes - 1 : p.dislikes,
        };
      }

      return {
        ...p,
        userReaction: reaction,
        likes:
          reaction === "like"
            ? p.likes + 1
            : p.userReaction === "like"
              ? p.likes - 1
              : p.likes,
        dislikes:
          reaction === "dislike"
            ? p.dislikes + 1
            : p.userReaction === "dislike"
              ? p.dislikes - 1
              : p.dislikes,
      };
    });

    try {
      if (isSameReaction) {
        await api.delete(`/posts/${id}/reactions`);
      } else {
        await api.post(`/posts/${id}/reactions`, { type: reaction });
      }
    } catch (err) {
      console.error("React failed:", err);
      // Revert local reaction cache and refetch on failure
      setCachedReaction(id, post.userReaction);
      invalidateFeed(activeTab);
    }
  }

  return (
    <div className="w-full bg-white">
      {/* Tabs */}
      <div className="flex gap-2 px-4 pt-4 pb-3">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
              activeTab === tab
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Divider between tabs and feed */}
      <div className="border-t border-[#E6EAED]" />

      {/* Feed */}
      {isLoading ? (
        <div className="text-center py-10 text-gray-400">Loading feed...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10 text-gray-400">Nothing here yet.</div>
      ) : (
        <div className="flex flex-col">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onReact={handleReact} />
          ))}
        </div>
      )}
    </div>
  );
}
