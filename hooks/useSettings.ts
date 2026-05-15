// hooks/useSettings.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
 import { authService } from "@/services/auth.services";
import { settingsService, UpdateProfilePayload } from "@/services/settings.servicess";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      settingsService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
  });
};

export const useToggleAnonymous = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isAnonymous: boolean) =>
      settingsService.toggleAnonymous(isAnonymous),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
  });
};

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: () => settingsService.deleteAccount(),
  });
};