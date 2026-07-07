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
    connectionCount?: number;
    connectionsCount?: number;
    connection_count?: number;
    followerCount?: number;
    followersCount?: number;
    follower_count?: number;
  };
  pdfUrl?: string | null;
  pdfName?: string | null;
  title?: string | null;
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
    authorAccountId: raw.authorAccountId,
    author: raw.author?.fullName ?? "Unknown",
    authorInitials: getInitials(raw.author?.fullName ?? ""),
    avatarUrl: raw.author?.avatarUrl,
    isVerified: false,
    timeAgo: timeAgo(raw.createdAt),
    body: raw.body,
    pdfUrl: raw.pdfUrl ?? null,
    pdfName: raw.pdfName ?? null,
    title: raw.title ?? null,
    pdfSizeBytes: raw.pdfSizeBytes ?? null,
    likes: raw.likeCount,
    dislikes: raw.dislikeCount,
    userReaction: cachedReactions[raw.id] ?? null,
    createdAt: raw.createdAt,
  };
}

function getConnectionCount(author: RawPost["author"] | undefined): number {
  if (!author) return 0;

  const numericValue =
    (author as RawPost["author"] & Record<string, unknown>).connectionCount ??
    (author as RawPost["author"] & Record<string, unknown>).connectionsCount ??
    (author as RawPost["author"] & Record<string, unknown>).connection_count ??
    (author as RawPost["author"] & Record<string, unknown>).followerCount ??
    (author as RawPost["author"] & Record<string, unknown>).followersCount ??
    (author as RawPost["author"] & Record<string, unknown>).follower_count ??
    0;

  return typeof numericValue === "number" ? numericValue : Number(numericValue) || 0;
}

function shapeFeedItems(items: RawPost[], tab: FeedTab): RawPost[] {
  const normalized = [...items];

  if (tab === "Articles") {
    return normalized.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  if (tab === "Top Lawyers") {
    const latestByAuthor = new Map<string, RawPost>();

    for (const item of normalized) {
      const existing = latestByAuthor.get(item.authorAccountId);
      if (!existing) {
        latestByAuthor.set(item.authorAccountId, item);
        continue;
      }

      const existingTime = new Date(existing.createdAt).getTime();
      const currentTime = new Date(item.createdAt).getTime();
      if (currentTime > existingTime) {
        latestByAuthor.set(item.authorAccountId, item);
      }
    }

    return Array.from(latestByAuthor.values()).sort(
      (a, b) => getConnectionCount(b.author) - getConnectionCount(a.author),
    );
  }

  return normalized;
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
  return shapeFeedItems(items, tab).map((raw) => normalizePost(raw, cachedReactions));
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
