import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, ArrowRight, Shield, Clock, Sparkles } from "lucide-react";
import logoGazzella from "@/immagini/Logo-gazzella.jpg";

export default function Auth() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Verifica accesso...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent mb-2">
            Benvenuto
          </h1>
          <p className="text-slate-600">
            Accedi per iniziare il tuo percorso nutrizionale personalizzato
          </p>
        </div>

        {/* Features Preview */}
        <Card className="glass-morphism mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Sparkles className="mr-2 h-5 w-5 text-green-600" />
              Cosa puoi fare con La Mia Gazzella
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center text-sm">
              <Shield className="mr-3 h-4 w-4 text-green-500" />
              Piani nutrizionali personalizzati AI
            </div>
            <div className="flex items-center text-sm">
              <Clock className="mr-3 h-4 w-4 text-blue-500" />
              Generatore ricette intelligente
            </div>
            <div className="flex items-center text-sm">
              <Leaf className="mr-3 h-4 w-4 text-emerald-500" />
              Consulente nutrizionale 24/7
            </div>
          </CardContent>
        </Card>

        {/* Login Card */}
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle className="text-center">Accesso Sicuro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600 text-center">
              Utilizza il tuo account Replit per accedere in modo sicuro
            </p>
            
            <Button
              onClick={() => window.location.href = "/api/login"}
              className="w-full bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white font-semibold py-3"
              size="lg"
              data-testid="login-button"
            >
              <Shield className="mr-2 h-5 w-5" />
              Accedi con Replit
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <div className="text-center">
              <p className="text-xs text-slate-500">
                Continuando accetti i nostri{" "}
                <a href="/terms-of-service" className="text-green-600 hover:underline">
                  Termini di Servizio
                </a>{" "}
                e{" "}
                <a href="/privacy-policy" className="text-green-600 hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}