import { useQuery } from "@tanstack/react-query";

interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  subscriptionStatus?: string;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 1000 * 60 * 1,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}