import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "wouter";
import CreateProfileForm from "@/components/create-profile-form";

interface ProfileGuardProps {
  children: React.ReactNode;
}

export function ProfileGuard({ children }: ProfileGuardProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/user-profiles/current"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Show loading state
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-slate-600">Caricamento profilo...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - shouldn't happen if used with SubscriptionGuard
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="glass-morphism max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-800">
              Accesso Richiesto
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-slate-600">
              Devi effettuare l'accesso per utilizzare questa funzionalità
            </p>
            <Button
              onClick={() => window.location.href = "/api/login"}
              className="w-full bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white"
            >
              Accedi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No profile - show profile creation form
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-emerald-50 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <User className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent mb-4">
              Completa il Tuo Profilo
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Per creare piani nutrizionali personalizzati, abbiamo bisogno di alcune informazioni su di te
            </p>
          </div>
          
          <CreateProfileForm />
        </div>
      </div>
    );
  }

  // Has profile - show content
  return <>{children}</>;
}