import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, ShoppingCart, Star, Check, Zap, Heart, Crown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useSubscription } from "@/hooks/useSubscription";

export default function FormulaGazzella() {
  const { subscription, isLoading: subscriptionLoading, hasActiveSubscription, isInTrial } = useSubscription();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Controlla se l'utente ha accesso (abbonato non trial)
  const hasAccess = hasActiveSubscription && !isInTrial;

  const createShopifyOrderMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/shopify/create-order", {
        productId: "9890948055381"
      }, "POST");
    },
    onSuccess: (response) => {
      toast({
        title: "Ordine Creato! 🎉",
        description: "Il tuo ordine per Formula Gazzella è stato elaborato con successo. Riceverai una conferma via email.",
        duration: 5000,
      });
      setIsProcessingOrder(false);
      
      // Invalida eventuali query correlate
      queryClient.invalidateQueries({ queryKey: ["/api/user/orders"] });
    },
    onError: (error: any) => {
      toast({
        title: "Errore Ordine",
        description: error.message || "Si è verificato un errore durante la creazione dell'ordine.",
        variant: "destructive",
      });
      setIsProcessingOrder(false);
    },
  });

  const handleCreateOrder = () => {
    if (!hasAccess) {
      toast({
        title: "Accesso Richiesto",
        description: "Questa offerta è riservata esclusivamente agli abbonati Premium.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessingOrder(true);
    createShopifyOrderMutation.mutate();
  };

  if (subscriptionLoading) {
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
            <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-4 py-2 text-sm font-semibold">
              <Crown className="h-4 w-4 mr-2" />
              OFFERTA RISERVATA PREMIUM
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Formula Gazzella
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            L'integratore esclusivo che accelera i tuoi risultati nutrizionali con il potere della natura
          </p>
        </div>

        {/* Controllo accesso */}
        {!hasAccess && (
          <Card className="border-red-200 bg-red-50 mb-8">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Crown className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-red-800">Accesso Riservato</CardTitle>
                  <CardDescription className="text-red-600">
                    {!hasActiveSubscription 
                      ? "Questa offerta è riservata agli abbonati Premium. Attiva il tuo abbonamento per accedere."
                      : "Questa offerta è riservata agli abbonati Premium che hanno completato il periodo di prova."
                    }
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
                  <p className="text-amber-600">Integratore Premium</p>
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
              Abbonamento Formula Gazzella
            </CardTitle>
            <CardDescription className="text-lg text-slate-600 mt-4">
              Ricevi automaticamente la tua Formula Gazzella ogni mese insieme al tuo abbonamento Premium
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            {/* Pricing */}
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-6 rounded-lg">
              <div className="text-3xl font-bold text-amber-800 mb-2">Incluso nel tuo abbonamento</div>
              <p className="text-amber-700">
                <Zap className="h-5 w-5 inline mr-2" />
                Consegna automatica ogni mese
              </p>
            </div>

            {/* Garanzie */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold">Qualità Garantita</div>
                <div>Ingredienti premium certificati</div>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="font-semibold">Formulazione Esclusiva</div>
                <div>Solo per membri Premium</div>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <div className="font-semibold">Supporto Continuo</div>
                <div>Assistenza nutrizionale dedicata</div>
              </div>
            </div>

            {/* Bottone di ordinazione */}
            <div className="pt-6">
              <Button
                onClick={handleCreateOrder}
                disabled={!hasAccess || isProcessingOrder || createShopifyOrderMutation.isPending}
                size="lg"
                className={`w-full md:w-auto px-12 py-6 text-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  hasAccess 
                    ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700" 
                    : "bg-gray-400 cursor-not-allowed"
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                data-testid="button-order-formula"
              >
                {isProcessingOrder || createShopifyOrderMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Elaborazione Ordine...
                  </>
                ) : !hasAccess ? (
                  <>
                    <Crown className="h-5 w-5 mr-2" />
                    Riservato agli Abbonati Premium
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Ordina Formula Gazzella
                  </>
                )}
              </Button>
            </div>

            <div className="text-center text-sm text-slate-500 mt-6">
              <p>🔒 Pagamento sicuro gestito tramite Shopify</p>
              <p>📦 Spedizione gratuita per abbonati Premium</p>
              <p>💝 Consegna automatica ogni mese con il tuo abbonamento</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}