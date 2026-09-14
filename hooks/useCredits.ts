import { useQuery, useQueryClient } from "@tanstack/react-query";
import { creditsService, CreditsWallet } from "@/services/credits.services";

const CREDITS_KEY = ["credits", "wallet"];

export function useCredits() {
  return useQuery<CreditsWallet>({
    queryKey: CREDITS_KEY,
    queryFn: creditsService.getWallet,
    staleTime: 30_000,
  });
}

export function useCreditsCache() {
  const queryClient = useQueryClient();

  function setBalance(balance: number) {
    queryClient.setQueryData<CreditsWallet | undefined>(CREDITS_KEY, (prev) =>
      prev ? { ...prev, balance } : prev
    );
  }

  function invalidateCredits() {
    queryClient.invalidateQueries({ queryKey: CREDITS_KEY });
  }

  return { setBalance, invalidateCredits };
}