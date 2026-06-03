// hooks/useProfile.ts
import { profileService } from "@/services/profile.services";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function getCachedMe() {
  if (typeof window === "undefined") return undefined;

  try {
    const raw = localStorage.getItem("user");
    if (!raw) return undefined;

    return {
      error: false,
      message: "Cached profile",
      data: JSON.parse(raw),
    };
  } catch {
    return undefined;
  }
}

export const useMe = () =>
  useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => profileService.getMe().then((r) => r.data),
    initialData: getCachedMe,
    staleTime: 1000 * 60 * 5, // cache for 5 min
  });

export const useProfileArticles = (
  accountId: string,
  page = 1,
  limit = 5,
  enabled = true,
) =>
  useQuery({
    queryKey: ["profile", accountId, "articles", page, limit],
    queryFn: () =>
      profileService
        .getArticles(accountId, page, limit)
        .then((r) => r.data.data),
    enabled: !!accountId && enabled,
    staleTime: 1000 * 60 * 5,
  });

export const useUpdateMe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      profileService.updateMe(payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] }); // auto-refresh
    },
  });
};

export const useProfileReviews = (
  accountId: string,
  page = 1,
  limit = 20,
  enabled = true,
) =>
  useQuery({
    queryKey: ["profile", accountId, "reviews", page],
    queryFn: () =>
      profileService
        .getReviews(accountId, page, limit)
        .then((r) => r.data.data),
    enabled: !!accountId && enabled,
    staleTime: 1000 * 60 * 2,
  });
