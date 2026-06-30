// hooks/useFollows.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followsService } from "@/services/follows.services";

/** Follow or unfollow an account, then refresh that account's profile. */
export const useToggleFollow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      accountId,
      isFollowing,
    }: {
      accountId: string;
      isFollowing: boolean;
    }) =>
      isFollowing
        ? followsService.unfollow(accountId)
        : followsService.follow(accountId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["profile", vars.accountId] });
    },
  });
};
