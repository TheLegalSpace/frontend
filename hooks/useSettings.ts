// hooks/useSettings.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
 import { authService } from "@/services/auth.services";
import { ServiceRow, settingsService, UpdatePersonalInfoPayload, UpdatePracticeAreasPayload, UpdateProfilePayload, UpdateServicesPayload } from "@/services/settings.services";
 
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
    mutationFn: (services: ServiceRow[]) =>
      settingsService.updateServices(services),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
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

export const useServices = (enabled = true) =>
  useQuery({
    queryKey: ["services"],
    queryFn: () => settingsService.getServices().then((r) => r.data.data),
    enabled,
    staleTime: 1000 * 60 * 2,
  });


