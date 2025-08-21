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
  const { data: subscription, isLoading } = useQuery<UserSubscription>({
    queryKey: ["/api/user/subscription"],
    retry: false,
  });

  return {
    subscription,
    isLoading,
    hasActiveSubscription: subscription?.hasActiveSubscription || false,
    isInTrial: subscription?.isInTrial || false,
  };
}