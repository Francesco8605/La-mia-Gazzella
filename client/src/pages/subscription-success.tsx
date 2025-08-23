import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, CreditCard, User } from "lucide-react";

export default function SubscriptionSuccess() {
  const [, setLocation] = useLocation();

  // Get session ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');

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