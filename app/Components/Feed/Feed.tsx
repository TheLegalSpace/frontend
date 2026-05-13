"use client";

import { useCallback, useEffect, useState } from "react";
import PostCard, { Post } from "./PostCard";
import { useAuth } from "@/app/context/AuthContext";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://legalspace.onrender.com";

type Tab = "All" | "Top Firms" | "Top Lawyers" | "Articles";

interface RawPost {
  id: number;
  content: string;
  createdAt: string;
  author: {
    name: string;
    avatarUrl?: string;
    isVerified?: boolean;
  };
  article?: {
    title: string;
    slug: string;
    publishedAt: string;
    readCount: number;
  };
  _count?: {
    likes: number;
    dislikes: number;
  };
  userReaction?: "like" | "dislike" | null;
}

const TABS: Tab[] = ["All", "Top Firms", "Top Lawyers", "Articles"];

function getInitials(name: string) {
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

function normalizePost(raw: RawPost): Post {
  return {
    id: raw.id,
    author: raw.author.name,
    authorInitials: getInitials(raw.author.name),
    avatarUrl: raw.author.avatarUrl,
    isVerified: raw.author.isVerified ?? false,
    timeAgo: timeAgo(raw.createdAt),
    body: raw.content,
    article: raw.article
      ? {
          title: raw.article.title,
          slug: raw.article.slug,
          reads: raw.article.readCount,
          date: new Date(raw.article.publishedAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
        }
      : undefined,
    likes: raw._count?.likes ?? 0,
    dislikes: raw._count?.dislikes ?? 0,
    userReaction: raw.userReaction ?? null,
  };
}


async function fetchFeed(token: string, tab: Tab) {
  try {
    const params = new URLSearchParams({
      page: "1",
      limit: "20",
      filter: tab === "All" ? "all" : tab.toLowerCase().replace(" ", "_"),
    });

    const url = `${BASE_URL}/api/v1/feed/?${params}`;
    console.log("Fetching:", url);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    console.log("STATUS:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend Error:", errorText);
      throw new Error(`HTTP Error: ${res.status}`);
    }

    const data = await res.json();
    console.log("Feed response:", data);

    const raw: RawPost[] = data?.data?.items ?? [];
    return raw.map(normalizePost);
  } catch (error) {
    console.error("Feed fetch failed:", error);
    return [];
  }
}

export default function Feed() {
  const [token, setToken] = useState<string | null>(null); // ← null = not ready yet
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setToken(localStorage.getItem("accessToken")); // ← read token on mount
  }, []);

  const loadFeed = useCallback(
    async (tab: Tab) => {
      if (!token) return; // ← wait until token is ready
      setLoading(true);
      try {
        const data = await fetchFeed(token, tab);
        setPosts(data);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    loadFeed(activeTab);
  }, [activeTab, loadFeed]);

  function handleReact(id: number, reaction: "like" | "dislike") {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, userReaction: reaction } : p))
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 rounded-full mb-5">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-2xl text-sm transition ${
              activeTab === tab
                ? "bg-gray-900 text-white font-bold"
                : "text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading feed...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10 text-gray-400">Nothing here yet.</div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} onReact={handleReact} />
        ))
      )}
    </div>
  );
}