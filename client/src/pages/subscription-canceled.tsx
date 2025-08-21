import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, Home, CreditCard } from "lucide-react";

export default function SubscriptionCanceled() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900/20 dark:to-orange-900/20 flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
              <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-red-600 dark:text-red-400">
            Abbonamento Annullato
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <div className="space-y-4">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Hai annullato il processo di abbonamento. Nessun pagamento è stato effettuato.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                💡 Non perdere l'opportunità!
              </h3>
              <p className="text-blue-700 dark:text-blue-300">
                Ricorda che tutti i nostri piani includono 3 giorni di prova gratuita. 
                Puoi sempre provare senza impegno!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                  Cosa ti stai perdendo:
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Piani alimentari personalizzati</li>
                  <li>• Assistente IA nutrizionale 24/7</li>
                  <li>• Ricette Gazzella illimitate</li>
                  <li>• Tracking progressi avanzato</li>
                  <li>• Supporto prioritario</li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  Prova senza rischi:
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• 3 giorni completamente gratuiti</li>
                  <li>• Accesso completo a tutte le funzionalità</li>
                  <li>• Cancellazione facile in qualsiasi momento</li>
                  <li>• Nessun impegno a lungo termine</li>
                </ul>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-200">
                <strong>Offerta speciale:</strong> I nostri clienti perdono in media 3-5kg nel primo mese 
                seguendo il Metodo Gazzella. Inizia oggi la tua trasformazione!
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setLocation("/piani-abbonamento")}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-8 py-3"
              data-testid="try-again-button"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Prova Gratuitamente
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setLocation("/")}
              className="border-gray-300 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 px-8 py-3"
              data-testid="go-home-button"
            >
              <Home className="h-5 w-5 mr-2" />
              Torna alla Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}