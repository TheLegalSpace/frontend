"use client";

import PostCard from "./PostCard";
import { api } from "@/services/api";
import {
  useFeed,
  useFeedCache,
  type FeedTab,
  setCachedReaction,
} from "@/hooks/useFeed";

interface FeedProps {
  activeTab: FeedTab;
}

export default function Feed({ activeTab }: FeedProps) {
  const { data: posts = [], isLoading } = useFeed(activeTab);
  const { updatePostReaction, invalidateFeed } = useFeedCache();

  async function handleReact(id: string, reaction: "like" | "dislike") {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    const isSameReaction = post.userReaction === reaction;
    const newReaction = isSameReaction ? null : reaction;

    setCachedReaction(id, newReaction);

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
      setCachedReaction(id, post.userReaction);
      invalidateFeed(activeTab);
    }
  }

  return (
    <div className="w-full bg-white mt-[72px]">
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