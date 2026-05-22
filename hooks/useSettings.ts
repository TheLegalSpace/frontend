// hooks/useSettings.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
 import { authService } from "@/services/auth.services";
import { settingsService, UpdatePersonalInfoPayload, UpdatePracticeAreasPayload, UpdateProfilePayload, UpdateServicesPayload } from "@/services/settings.services";
 
export const useUpdatePersonalInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePersonalInfoPayload) =>
      settingsService.updatePersonalInfo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
  });
};

export const useUpdatePracticeAreas = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePracticeAreasPayload) =>
      settingsService.updatePracticeAreas(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
  });
};

export const useUpdateServices = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateServicesPayload) =>
      settingsService.updateServices(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
  });
};

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