import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

interface SubscriptionData {
  hasActiveSubscription: boolean;
  isInTrial: boolean;
  subscriptionStatus: string | null;
  trialEndsAt: string | null;
  hasUsedTrial: boolean;
  subscription: any;
}

export function useSubscription() {
  const { isAuthenticated, user } = useAuth();

  const { data: subscriptionData, isLoading } = useQuery<SubscriptionData>({
    queryKey: ["/api/subscription/status"],
    enabled: isAuthenticated && !!user,
    refetchInterval: 30000, // Check every 30 seconds
  });

  return {
    hasActiveSubscription: subscriptionData?.hasActiveSubscription || false,
    isInTrial: subscriptionData?.isInTrial || false,
    subscriptionStatus: subscriptionData?.subscriptionStatus,
    trialEndsAt: subscriptionData?.trialEndsAt ? new Date(subscriptionData.trialEndsAt) : null,
    hasUsedTrial: subscriptionData?.hasUsedTrial || false,
    subscription: subscriptionData?.subscription,
    isLoading,
  };
}