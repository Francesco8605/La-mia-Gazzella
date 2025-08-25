import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, CreditCard, User, Loader2, AlertTriangle } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { queryClient } from "@/lib/queryClient";

export default function SubscriptionSuccess() {
  const [, setLocation] = useLocation();
  const { subscription, isLoading, hasActiveSubscription, isInTrial } = useSubscription();
  const [pollingCount, setPollingCount] = useState(0);
  const [showFullPage, setShowFullPage] = useState(false);
  const maxPollingAttempts = 12; // 12 tentativi x 3 secondi = 36 secondi massimo

  // Get session ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');

  // Polling system per aspettare che il webhook elabori la subscription
  useEffect(() => {
    console.log('🔄 Subscription check:', { hasActiveSubscription, isInTrial, pollingCount, isLoading });
    
    // Invalida la cache per forzare un refetch immediato
    queryClient.invalidateQueries({ queryKey: ["/api/user/subscription"] });
    
    // Se non abbiamo ancora una subscription attiva e siamo sotto il limite di tentativi
    if (!hasActiveSubscription && !isLoading && pollingCount < maxPollingAttempts) {
      console.log(`🔄 Polling attempt ${pollingCount + 1}/${maxPollingAttempts}`);
      
      const pollTimer = setTimeout(() => {
        setPollingCount(prev => prev + 1);
      }, 3000); // Polling ogni 3 secondi

      return () => clearTimeout(pollTimer);
    }
    
    // Se abbiamo la subscription o abbiamo superato i tentativi, mostra la pagina completa
    if (hasActiveSubscription || pollingCount >= maxPollingAttempts) {
      setShowFullPage(true);
    }
  }, [hasActiveSubscription, isLoading, pollingCount, maxPollingAttempts]);

  // Se stiamo ancora aspettando la subscription e non abbiamo superato i tentativi
  if (!showFullPage && pollingCount < maxPollingAttempts) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center px-4">
        <Card className="max-w-2xl w-full shadow-xl">
          <CardContent className="pt-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full">
                  <Loader2 className="h-16 w-16 text-emerald-600 dark:text-emerald-400 animate-spin" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  Attivazione in corso...
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Stiamo processando il tuo pagamento e attivando la prova gratuita di 3 giorni.
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Questo processo richiede solitamente 10-30 secondi. Rimani su questa pagina.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">
                    Tentativo {pollingCount + 1} di {maxPollingAttempts}
                  </span>
                </div>
                <p className="text-blue-600 dark:text-blue-400 text-sm">
                  Il nostro sistema sta comunicando con Stripe per confermare il pagamento...
                </p>
              </div>

              {sessionId && (
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded p-2">
                  Session ID: {sessionId}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se non abbiamo subscription dopo tutti i tentativi, mostra messaggio di errore
  if (!hasActiveSubscription && pollingCount >= maxPollingAttempts) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-yellow-900/20 dark:to-orange-900/20 flex items-center justify-center px-4">
        <Card className="max-w-2xl w-full shadow-xl border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-full">
                  <AlertTriangle className="h-16 w-16 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  Attivazione in ritardo
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Il pagamento è stato processato ma l'attivazione sta richiedendo più tempo del solito.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Cosa fare ora:
                </h4>
                <ul className="text-blue-700 dark:text-blue-300 text-left space-y-2">
                  <li>• Ricarica questa pagina tra 1-2 minuti</li>
                  <li>• Controlla la tua email per conferme di pagamento</li>
                  <li>• La tua prova gratuita si attiverà automaticamente</li>
                  <li>• Se il problema persiste, contatta il supporto</li>
                </ul>
              </div>

              <div className="flex flex-col gap-3 justify-center">
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-8 py-3"
                >
                  <Loader2 className="h-5 w-5 mr-2" />
                  Ricarica Pagina
                </Button>

                <Button 
                  onClick={() => setLocation("/dashboard")}
                  variant="outline"
                  className="font-semibold px-8 py-3"
                >
                  <Home className="h-5 w-5 mr-2" />
                  Vai alla Dashboard
                </Button>
              </div>

              {sessionId && (
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded p-2">
                  Session ID: {sessionId}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-green-600 dark:text-green-400">
            Benvenuta nella Famiglia Gazzella!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                🎉 La tua prova gratuita è iniziata!
              </h3>
              <p className="text-blue-700 dark:text-blue-300 mb-2">
                Hai 3 giorni completi per esplorare tutti i nostri strumenti premium gratuitamente.
              </p>
              <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded p-3 mt-3">
                <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
                  ⚡ <strong>Prossimo passo obbligatorio:</strong> Completa il tuo profilo personale per utilizzare tutti i servizi. È necessario per calcolare piani alimentari e ricette personalizzate.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Cosa puoi fare ora:
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Crea il tuo piano alimentare personalizzato</li>
                  <li>• Chatta con il consulente nutrizionale</li>
                  <li>• Genera ricette Gazzella illimitate</li>
                  <li>• Traccia i tuoi progressi di peso</li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Come funziona:
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• I primi 3 giorni sono completamente gratuiti</li>
                  <li>• Dopo la prova, l'abbonamento si rinnova automaticamente</li>
                  <li>• Puoi cancellare in qualsiasi momento</li>
                  <li>• Nessun costo nascosto</li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-amber-800 dark:text-amber-200">
                <strong>Promemoria:</strong> Ti invieremo una email 1 giorno prima della fine del periodo di prova 
                per ricordarti del rinnovo automatico.
              </p>
            </div>

            {sessionId && (
              <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded p-2">
                ID Sessione: {sessionId}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 justify-center">
            <Button 
              onClick={() => setLocation("/aggiorna-profilo")}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-8 py-3"
              data-testid="complete-profile-button"
            >
              <User className="h-5 w-5 mr-2" />
              Completa il Tuo Profilo
            </Button>
            
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Devi completare il profilo per accedere ai servizi premium
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}