// hooks/useIntake.ts
import {
  intakeService,
  SearchPayload,
  TextSearchPayload,
} from "@/services/intake.services";
import { useMutation } from "@tanstack/react-query";

export const useSearchLawyers = () =>
  useMutation({
    mutationFn: (payload: SearchPayload) =>
      intakeService.search(payload).then((r) => r.data.data),
  });

// export const useSearchLawyers = () =>
//   useMutation({
//     mutationFn: (payload: SearchPayload) =>
//       intakeService.search(payload).then((r) => r.data.data),
//   });

export const useSearchByText = () =>
  useMutation({
    mutationFn: (payload: TextSearchPayload) =>
      intakeService.searchByText(payload).then((r) => r.data),
  });
