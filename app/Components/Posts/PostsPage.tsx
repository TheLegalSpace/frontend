"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, PenSquare } from "lucide-react";
import { MyPost } from "@/app/types/posts";
import { api } from "@/services/api";
import { useAuth } from "@/app/context/AuthContext";
import MyPostCard from "./MyPostCard";
import CreatePostModal from "./CreatePostCardModal";

// ── Reaction cache ────────────────────────────────────────────────────────────
function getCachedReactions(): Record<string, "like" | "dislike"> {
  try {
    const raw = localStorage.getItem("post_reactions");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setCachedReaction(id: string, reaction: "like" | "dislike" | null) {
  try {
    const current = getCachedReactions();
    if (reaction === null) delete current[id];
    else current[id] = reaction;
    localStorage.setItem("post_reactions", JSON.stringify(current));
  } catch {}
}
// ─────────────────────────────────────────────────────────────────────────────

type Tab = "posts" | "articles";

export default function PostsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState<Record<string, "like" | "dislike">>({});
  const [showCreate, setShowCreate] = useState(false);

  const loadPosts = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/profile/${user.id}/posts`, {
        params: { page: 1, limit: 50 },
      });
      const items: MyPost[] = data?.data?.items ?? data?.data ?? [];
      setPosts(items);
      setReactions(getCachedReactions());
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  function handleDelete(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  function handleReactionChange(id: string, reaction: "like" | "dislike" | null) {
    setCachedReaction(id, reaction);
    setReactions(getCachedReactions());
  }

  const filteredPosts = posts.filter((p) =>
    activeTab === "articles"
      ? p.attachedArticleId !== null
      : p.attachedArticleId === null
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Top tab bar */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 sticky top-0 bg-white z-10">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition ${
              activeTab === "posts"
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab("articles")}
            className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition ${
              activeTab === "articles"
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Article Posts
          </button>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition"
        >
          <PenSquare size={14} />
          Create Post
        </button>
      </div>

      {/* Posts list */}
      <div className="max-w-3xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
            <Loader2 size={16} className="animate-spin" />
            Loading posts...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
            <p className="text-sm">No {activeTab} yet.</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <MyPostCard
              key={post.id}
              post={post}
              currentAccountId={user?.id ?? ""}
              onDelete={handleDelete}
              cachedReaction={reactions[post.id] ?? null}
              onReactionChange={handleReactionChange}
            />
          ))
        )}
      </div>

      {/* Create post modal */}
      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onCreated={loadPosts}
        />
      )}
    </div>
  );
}