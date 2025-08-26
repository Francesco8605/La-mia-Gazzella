import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import logoGazzella from "@/immagini/Logo-gazzella.jpg";

export default function SubscriptionSuccess() {
  useEffect(() => {
    // Redirect to home after 10 seconds
    const timeout = setTimeout(() => {
      window.location.href = "/";
    }, 10000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <img 
              src={logoGazzella} 
              alt="Logo La Mia Gazzella" 
              className="w-24 h-24 object-contain rounded-full shadow-2xl glass-morphism p-3"
            />
          </div>
        </div>

        {/* Success Card */}
        <Card className="glass-morphism">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600 mb-2">
              Abbonamento Attivato!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-slate-600">
              Il tuo abbonamento a La Mia Gazzella Premium è stato attivato con successo.
              Ora hai accesso completo a tutte le funzionalità premium!
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <Sparkles className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-semibold text-green-800">Cosa puoi fare ora:</span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <div>✓ Crea piani nutrizionali illimitati</div>
                <div>✓ Genera ricette personalizzate</div>
                <div>✓ Consulta il tuo assistente AI</div>
                <div>✓ Traccia i tuoi progressi</div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = "/"}
                className="w-full bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white font-semibold"
                size="lg"
              >
                Inizia Subito
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                onClick={() => window.location.href = "/genera-piano"}
                variant="outline"
                className="w-full border-green-200 hover:bg-green-50"
              >
                Crea il Primo Piano Nutrizionale
              </Button>
            </div>

            <p className="text-xs text-slate-500">
              Riceverai una email di conferma con i dettagli del tuo abbonamento.
            </p>

            <div className="text-xs text-slate-400">
              Reindirizzamento automatico alla dashboard in 10 secondi...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}