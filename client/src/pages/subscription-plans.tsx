import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Crown, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import logoGazzella from "@/immagini/Logo-gazzella.jpg";

export default function SubscriptionPlans() {
  const { isAuthenticated, user } = useAuth();
  const { hasActiveSubscription, hasUsedTrial, isLoading: subscriptionLoading } = useSubscription();
  const { toast } = useToast();
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/create-checkout-session", {}, "POST");
      return response;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore nella creazione della sessione di pagamento",
        variant: "destructive",
      });
      setIsCreatingCheckout(false);
    },
  });

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }

    setIsCreatingCheckout(true);
    checkoutMutation.mutate();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-emerald-50 pt-24 pb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Accesso Richiesto
          </h1>
          <p className="text-slate-600 mb-8">
            Devi effettuare l'accesso per visualizzare i piani di abbonamento
          </p>
          <Button
            onClick={() => window.location.href = "/api/login"}
            className="bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white"
          >
            Accedi
          </Button>
        </div>
      </div>
    );
  }

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (hasActiveSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-emerald-50 pt-24 pb-12">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="mb-8 flex justify-center">
            <img 
              src={logoGazzella} 
              alt="Logo La Mia Gazzella" 
              className="w-20 h-20 object-contain rounded-full shadow-2xl glass-morphism p-3"
            />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent mb-4">
            Sei già abbonato!
          </h1>
          <p className="text-slate-600 mb-8">
            Hai accesso completo a tutte le funzionalità premium di La Mia Gazzella
          </p>
          <Button
            onClick={() => window.location.href = "/"}
            className="bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white"
          >
            Vai alla Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-emerald-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center">
            <img 
              src={logoGazzella} 
              alt="Logo La Mia Gazzella" 
              className="w-20 h-20 object-contain rounded-full shadow-2xl glass-morphism p-3"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent mb-4">
            Diventa Premium
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Sblocca il potenziale completo della nutrizione personalizzata con AI
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-lg mx-auto">
          <Card className="glass-morphism border-2 border-green-200 relative overflow-hidden">
            {/* Premium Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-bl-lg">
              <Crown className="inline h-4 w-4 mr-1" />
              <span className="text-sm font-bold">PREMIUM</span>
            </div>

            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl font-bold text-slate-800 mb-2">
                La Mia Gazzella Premium
              </CardTitle>
              <div className="flex items-center justify-center mb-4">
                <span className="text-5xl font-bold text-green-600">€29</span>
                <span className="text-slate-500 ml-2">/mese</span>
              </div>
              
              {/* Trial Badge */}
              {!hasUsedTrial && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 mx-auto">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Prima 3 giorni GRATIS
                </Badge>
              )}
            </CardHeader>

            <CardContent>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Piani alimentari illimitati personalizzati</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Generatore ricette AI avanzato</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Consulente nutrizionale 24/7</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Tracciamento peso e progressi</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Protocollo Gazzella completo</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Supporto prioritario</span>
                </div>
              </div>

              <Separator className="my-6" />

              <Button
                onClick={handleSubscribe}
                disabled={isCreatingCheckout}
                className="w-full bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white font-semibold py-4 text-lg"
                size="lg"
              >
                {isCreatingCheckout ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Reindirizzamento...
                  </>
                ) : (
                  <>
                    {!hasUsedTrial ? "Inizia Prova Gratuita" : "Abbonati Ora"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <p className="text-xs text-slate-500 text-center mt-4">
                {!hasUsedTrial 
                  ? "Nessun addebito per i primi 3 giorni. Cancella in qualsiasi momento." 
                  : "Cancella in qualsiasi momento dal tuo account."
                }
              </p>

              <div className="mt-6 text-center">
                <p className="text-xs text-slate-500">
                  Continua hai confermato i{" "}
                  <a href="/terms-of-service" className="text-green-600 hover:underline">
                    Termini di Servizio
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Value Proposition */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold text-slate-800 mb-6">
            Perché scegliere La Mia Gazzella?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">AI Personalizzata</h4>
              <p className="text-slate-600 text-sm">
                Algoritmi avanzati che si adattano alle tue esigenze specifiche
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">Protocollo Gazzella</h4>
              <p className="text-slate-600 text-sm">
                Metodologia scientifica testata per risultati duraturi
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">Risultati Rapidi</h4>
              <p className="text-slate-600 text-sm">
                Piani e ricette generate in secondi, risultati in giorni
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}