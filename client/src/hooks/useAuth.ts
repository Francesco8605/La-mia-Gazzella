import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 1000 * 60 * 1, // 1 minuto di cache per auth status
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}