"use client";

import { useCallback, useEffect, useState } from "react";
import PostCard, { Post } from "./PostCard";
import { api } from "@/services/api";

type Tab = "All" | "Top Firms" | "Top Lawyers" | "Articles";

// Matches the actual API response
interface RawPost {
  id: string;
  authorAccountId: string;
  body: string;
  attachedArticleId: string | null;
  likeCount: number;
  dislikeCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  author: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    isAnonymous?: boolean;
    avgRating?: string;
    role?: string;
  };
  attachedArticle: {
    title: string;
    slug: string;
    publishedAt: string;
    readCount: number;
  } | null;
}

const TABS: Tab[] = ["All", "Top Firms", "Top Lawyers", "Articles"];

// ── Reaction cache helpers ────────────────────────────────────────────────────
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
    if (reaction === null) {
      delete current[id];
    } else {
      current[id] = reaction;
    }
    localStorage.setItem("post_reactions", JSON.stringify(current));
  } catch {}
}
// ─────────────────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

function normalizePost(raw: RawPost, cachedReactions: Record<string, "like" | "dislike">): Post {
  return {
    id: raw.id,
    author: raw.author?.fullName ?? "Unknown",
    authorInitials: getInitials(raw.author?.fullName ?? ""),
    avatarUrl: raw.author?.avatarUrl,
    isVerified: false, // not in API response
    timeAgo: timeAgo(raw.createdAt),
    body: raw.body,
    article: raw.attachedArticle
      ? {
          title: raw.attachedArticle.title,
          slug: raw.attachedArticle.slug,
          reads: raw.attachedArticle.readCount,
          date: new Date(raw.attachedArticle.publishedAt).toLocaleDateString(
            "en-US",
            { month: "long", day: "numeric", year: "numeric" }
          ),
        }
      : undefined,
    likes: raw.likeCount,
    dislikes: raw.dislikeCount,
    userReaction: cachedReactions[raw.id] ?? null, // ← from localStorage
  };
}

async function fetchFeed(tab: Tab) {
  const { data } = await api.get("/feed/", {
    params: {
      page: 1,
      limit: 20,
      filter: tab === "All" ? "all" : tab.toLowerCase().replace(" ", "_"),
    },
  });
  return (data?.data?.items ?? []) as RawPost[];
}

export default function Feed() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = useCallback(async (tab: Tab) => {
    setLoading(true);
    try {
      const items = await fetchFeed(tab);
      const cachedReactions = getCachedReactions();
      setPosts(items.map((raw) => normalizePost(raw, cachedReactions)));
    } catch (err) {
      console.error("Feed fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed(activeTab);
  }, [activeTab, loadFeed]);

  async function handleReact(id: string, reaction: "like" | "dislike") {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    const isSameReaction = post.userReaction === reaction;
    const newReaction = isSameReaction ? null : reaction;

    // Save to localStorage immediately so it survives refresh
    setCachedReaction(id, newReaction);

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
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
      })
    );

    try {
      if (isSameReaction) {
        await api.delete(`/posts/${id}/reactions`);
      } else {
        await api.post(`/posts/${id}/reactions`, { type: reaction });
      }
    } catch (err) {
      console.error("React failed:", err);
      // Revert cache and reload on failure
      setCachedReaction(id, post.userReaction);
      loadFeed(activeTab);
    }
  }

  
 // Feed.tsx — updated return
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
      {loading ? (
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