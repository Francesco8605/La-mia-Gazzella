import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Star, Check, Zap, Heart, Crown, ShoppingCart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function FormulaGazzella() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Tutti gli utenti autenticati possono acquistare Formula Gazzella
  const hasAccess = isAuthenticated;

  // Mutation per creare un ordine Formula Gazzella (acquisto singolo)
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/shopify/create-order", {}, "POST");
    },
    onSuccess: (data) => {
      console.log("🎉 Ordine creato con successo:", data);
      toast({
        title: "Ordine Confermato! 🎉",
        description: `Formula Gazzella ordinata con successo a €29.99. Verrai reindirizzato al checkout per completare il pagamento.`,
        duration: 5000,
      });
      
      // Redirect to Shopify checkout URL for payment completion
      if (data.checkoutUrl) {
        console.log("🛒 Redirecting to checkout:", data.checkoutUrl);
        setTimeout(() => {
          window.location.href = data.checkoutUrl;
        }, 2000); // Brief delay to show toast
      } else {
        console.warn("⚠️ No checkout URL received from server");
      }
    },
    onError: (error: any) => {
      console.error("❌ Errore creazione ordine:", error);
      toast({
        title: "Errore Ordine",
        description: error.message || "Si è verificato un errore durante la creazione dell'ordine. Riprova tra qualche minuto.",
        variant: "destructive",
        duration: 8000,
      });
    }
  });

  const handleOrderNow = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Richiesto",
        description: "Devi essere autenticato per acquistare Formula Gazzella.",
        variant: "destructive",
      });
      return;
    }
    
    createOrderMutation.mutate();
  };

  // Removed - no longer needed for single purchase model

  if (authLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="max-w-4xl mx-auto">
        {/* Header con badge esclusivo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 text-sm font-semibold">
              <ShoppingCart className="h-4 w-4 mr-2" />
              ACQUISTO SINGOLO - €29.99
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Formula Gazzella
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            L'integratore esclusivo che accelera i tuoi risultati nutrizionali con il potere della natura
          </p>
        </div>

        {/* Single Purchase Available - No Access Restrictions */}
        {!isAuthenticated && (
          <Card className="border-blue-200 bg-blue-50 mb-8">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-blue-800">Login Richiesto</CardTitle>
                  <CardDescription className="text-blue-600">
                    Accedi per acquistare Formula Gazzella a soli €29.99 (€20 prodotto + €9.99 spedizione).
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Contenuto principale */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Immagine prodotto e descrizione */}
          <Card className="glass-morphism shadow-2xl">
            <CardHeader>
              <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-200 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <Sparkles className="h-16 w-16 text-amber-600 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-xl font-semibold text-amber-800">Formula Gazzella</h3>
                  <p className="text-amber-600">Integratore di Alta Qualità</p>
                </div>
              </div>
              <CardTitle className="text-2xl text-amber-800">
                Il Segreto del Metodo Gazzella
              </CardTitle>
              <CardDescription className="text-slate-600">
                Formulazione esclusiva studiata per ottimizzare l'efficacia del tuo piano nutrizionale personalizzato.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Benefici e caratteristiche */}
          <Card className="glass-morphism shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-800 mb-4">
                <Star className="h-6 w-6 inline mr-2 text-amber-500" />
                Benefici Esclusivi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-800">Accelerazione Metabolica</h4>
                  <p className="text-slate-600 text-sm">Aumenta naturalmente il metabolismo per risultati più rapidi</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-800">Controllo dell'Appetito</h4>
                  <p className="text-slate-600 text-sm">Riduce le voglie e stabilizza la fame durante il giorno</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-800">Energia Sostenibile</h4>
                  <p className="text-slate-600 text-sm">Mantiene livelli energetici costanti tutto il giorno</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-800">Ottimizzazione Nutrizionale</h4>
                  <p className="text-slate-600 text-sm">Potenzia l'assorbimento dei nutrienti del tuo piano Gazzella</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sezione di ordinazione */}
        <Card className="glass-morphism shadow-2xl border-0">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Heart className="h-12 w-12 text-red-500 animate-pulse" />
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-slate-800">
              Formula Gazzella - Acquisto Singolo
            </CardTitle>
            <CardDescription className="text-lg text-slate-600 mt-4">
              Acquista Formula Gazzella con un semplice ordine - nessun abbonamento richiesto
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            {/* Pricing */}
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-6 rounded-lg mb-6">
              <div className="text-2xl font-bold text-amber-800 mb-4">Prezzo Speciale</div>
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="text-center">
                  <div className="text-sm text-slate-600 line-through">€58.99</div>
                  <div className="text-3xl font-bold text-amber-800">€29.99</div>
                  <div className="text-sm text-amber-700">Sconto €29</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-2 text-amber-700">
                <Zap className="h-5 w-5" />
                <span>Include spedizione (€9.99 già incluso nel prezzo)</span>
              </div>
            </div>

            {/* Garanzie */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold">Qualità Garantita</div>
                <div>Ingredienti di alta qualità certificati</div>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="font-semibold">Formulazione Esclusiva</div>
                <div>Disponibile per tutti gli utenti registrati</div>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <div className="font-semibold">Supporto Continuo</div>
                <div>Assistenza nutrizionale dedicata</div>
              </div>
            </div>

            {/* Bottoni per ordine */}
            <div className="pt-6 space-y-4">
              {hasAccess ? (
                <>
                  {/* Bottone Ordina Ora */}
                  <Button
                    onClick={handleOrderNow}
                    disabled={createOrderMutation.isPending}
                    size="lg"
                    className="w-full md:w-auto px-8 py-6 text-xl font-semibold transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    data-testid="button-order-now"
                  >
                    {createOrderMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Creando Ordine...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Ordina Ora - €29.99
                      </>
                    )}
                  </Button>
                  
                </>
              ) : (
                <Button
                  onClick={handleOrderNow}
                  size="lg"
                  className="w-full md:w-auto px-12 py-6 text-xl font-semibold bg-blue-600 hover:bg-blue-700"
                  data-testid="button-login-required"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Accedi per Acquistare - €29.99
                </Button>
              )}
            </div>

            <div className="text-center text-sm text-slate-500 mt-6">
              <p>🔒 Pagamento sicuro gestito tramite Shopify</p>
              <p>📦 Costo spedizione: €9.99 (già incluso nel prezzo)</p>
              <p>💝 Prodotto di alta qualità - acquisto una tantum</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}