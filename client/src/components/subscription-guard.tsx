import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "wouter";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasActiveSubscription, isLoading: subLoading } = useSubscription();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Accesso Richiesto",
        description: "Effettua il login per accedere a questa funzionalità",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, authLoading, toast]);

  // Show loading state
  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-slate-600">Verifica abbonamento...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
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

  // Authenticated but no subscription - show upgrade prompt
  if (!hasActiveSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="glass-morphism max-w-lg w-full">
          <CardHeader className="text-center">
            <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-slate-800 mb-2">
              Premium Richiesto
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-slate-600">
              Questa funzionalità è riservata agli utenti Premium. 
              Sblocca l'accesso completo a tutti gli strumenti di nutrizione personalizzata.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-sm text-yellow-800 space-y-1">
                <div>✓ Piani nutrizionali illimitati</div>
                <div>✓ Generatore ricette AI</div>
                <div>✓ Consulente nutrizionale 24/7</div>
                <div>✓ Tracciamento progressi avanzato</div>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/subscription-plans" className="block">
                <Button
                  className="w-full bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white font-semibold"
                  size="lg"
                >
                  <Crown className="mr-2 h-5 w-5" />
                  Diventa Premium
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link href="/" className="block">
                <Button
                  variant="outline"
                  className="w-full border-slate-200 hover:bg-slate-50"
                >
                  Torna alla Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authenticated and has subscription - show content
  return <>{children}</>;
}