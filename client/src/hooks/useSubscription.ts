import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export interface UserSubscription {
  hasActiveSubscription: boolean;
  status: string | null;
  plan: string | null;
  startDate: string | null;
  endDate: string | null;
  trialEndDate: string | null;
  isInTrial: boolean;
  isTestUser?: boolean;
}

export function useSubscription() {
  const { user } = useAuth();
  const { data: subscription, isLoading, error } = useQuery<UserSubscription>({
    queryKey: ["/api/user/subscription"],
    retry: false,
    staleTime: 1000 * 60 * 1, // 1 minuto di cache per subscription status
  });



  return {
    subscription,
    isLoading,
    hasActiveSubscription: subscription?.hasActiveSubscription || false,
    isInTrial: subscription?.isInTrial || false,
    subscriptionStatus: subscription?.status,
    error,
  };
}