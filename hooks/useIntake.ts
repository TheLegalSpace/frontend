// hooks/useIntake.ts
import { intakeService, SearchPayload } from "@/services/intake.services";
import { useMutation } from "@tanstack/react-query";
 
export const useSearchLawyers = () =>
  useMutation({
    mutationFn: (payload: SearchPayload) =>
      intakeService.search(payload).then((r) => r.data.data),
  });