import { useQuery } from "@tanstack/react-query";

export interface UserSubscription {
  hasActiveSubscription: boolean;
  status: string | null;
  plan: string | null;
  startDate: string | null;
  endDate: string | null;
  trialEndDate: string | null;
  isInTrial: boolean;
}

export function useSubscription() {
  const { data: subscription, isLoading, error } = useQuery<UserSubscription>({
    queryKey: ["/api/user/subscription"],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
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