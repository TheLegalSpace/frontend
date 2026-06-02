import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { Post } from "@/app/Components/Feed/PostCard";

export type FeedTab = "All" | "Top Firms" | "Top Lawyers" | "Articles";

interface RawPost {
  id: string;
  authorAccountId: string;
  body: string;
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
  pdfUrl?: string | null;
  pdfName?: string | null;
  pdfSizeBytes?: number | null;
}

export const feedKeys = {
  all: ["feed"] as const,
  tab: (tab: FeedTab) => [...feedKeys.all, tab] as const,
};

function getCachedReactions(): Record<string, "like" | "dislike"> {
  try {
    const raw = localStorage.getItem("post_reactions");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setCachedReaction(
  id: string,
  reaction: "like" | "dislike" | null,
) {
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

function normalizePost(
  raw: RawPost,
  cachedReactions: Record<string, "like" | "dislike">,
): Post {
  return {
    id: raw.id,
    author: raw.author?.fullName ?? "Unknown",
    authorInitials: getInitials(raw.author?.fullName ?? ""),
    avatarUrl: raw.author?.avatarUrl,
    isVerified: false,
    timeAgo: timeAgo(raw.createdAt),
    body: raw.body,
    pdfUrl: raw.pdfUrl ?? null,
    pdfName: raw.pdfName ?? null,
    pdfSizeBytes: raw.pdfSizeBytes ?? null,
    likes: raw.likeCount,
    dislikes: raw.dislikeCount,
    userReaction: cachedReactions[raw.id] ?? null,
  };
}

async function fetchFeed(tab: FeedTab): Promise<Post[]> {
  const { data } = await api.get("/feed/", {
    params: {
      page: 1,
      limit: 20,
      filter: tab === "All" ? "all" : tab.toLowerCase().replace(" ", "_"),
    },
  });
  const items = (data?.data?.items ?? []) as RawPost[];
  const cachedReactions = getCachedReactions();
  return items.map((raw) => normalizePost(raw, cachedReactions));
}

export function useFeed(tab: FeedTab) {
  return useQuery({
    queryKey: feedKeys.tab(tab),
    queryFn: () => fetchFeed(tab),
    staleTime: 1000 * 60 * 2,
  });
}

export function useFeedCache() {
  const queryClient = useQueryClient();

  const updatePostReaction = (
    tab: FeedTab,
    id: string,
    updater: (post: Post) => Post,
  ) => {
    queryClient.setQueryData<Post[]>(feedKeys.tab(tab), (prev = []) =>
      prev.map((post) => (post.id === id ? updater(post) : post)),
    );
  };

  const invalidateFeed = (tab: FeedTab) => {
    queryClient.invalidateQueries({ queryKey: feedKeys.tab(tab) });
  };

  return { updatePostReaction, invalidateFeed };
}
