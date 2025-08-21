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
    staleTime: 0, // No cache per Francesco
  });

  // 🎯 ACCESSO COMPLETO PER FRANCESCO (per testing)
  const isFrancesco = user && (
    (user as any).username?.toLowerCase() === 'francesco' ||
    (user as any).email?.toLowerCase().includes('fresco8605') ||
    (user as any).id === '458ce208-3e1b-4316-b28b-b0547ccd785c'
  );

  // Se è Francesco, forza l'accesso completo
  if (isFrancesco && !isLoading) {
    console.log("🔓 Frontend: Accesso completo per Francesco");
    return {
      subscription: {
        hasActiveSubscription: true,
        status: 'active',
        plan: 'annual',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        trialEndDate: null,
        isInTrial: false,
        isTestUser: true
      },
      isLoading: false,
      hasActiveSubscription: true,
      isInTrial: false,
      subscriptionStatus: 'active',
      error: null,
    };
  }

  return {
    subscription,
    isLoading,
    hasActiveSubscription: subscription?.hasActiveSubscription || false,
    isInTrial: subscription?.isInTrial || false,
    subscriptionStatus: subscription?.status,
    error,
  };
}