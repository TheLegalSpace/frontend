// hooks/useProfile.ts
import { profileService } from "@/services/profile.services";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useMe = () =>
  useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => profileService.getMe().then((r) => r.data),
    staleTime: 1000 * 60 * 5, // cache for 5 min
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
