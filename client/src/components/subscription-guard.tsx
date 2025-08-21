import { useSubscription } from "@/hooks/useSubscription";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface SubscriptionGuardProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export function SubscriptionGuard({ children, fallbackPath = "/piani-abbonamento" }: SubscriptionGuardProps) {
  const { subscription, isLoading, hasActiveSubscription } = useSubscription();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Se non stiamo caricando e non abbiamo un abbonamento attivo
    if (!isLoading && !hasActiveSubscription && location !== fallbackPath) {
      console.log("🚫 Abbonamento non attivo - reindirizzo a:", fallbackPath);
      setLocation(fallbackPath);
    }
  }, [isLoading, hasActiveSubscription, location, fallbackPath, setLocation]);

  // Mostra loading mentre controlliamo lo stato dell'abbonamento
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Controllo abbonamento...</p>
        </div>
      </div>
    );
  }

  // Se non ha abbonamento attivo e non siamo sulla pagina degli abbonamenti, mostra un messaggio
  if (!hasActiveSubscription && location !== fallbackPath) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Abbonamento Richiesto</h2>
          <p className="text-slate-600 mb-6">
            Per accedere a questa funzionalità premium, è necessario un abbonamento attivo.
          </p>
          <p className="text-sm text-slate-500">
            Reindirizzamento in corso...
          </p>
        </div>
      </div>
    );
  }

  // Mostra i contenuti se ha abbonamento attivo o è sulla pagina degli abbonamenti
  return <>{children}</>;
}