import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceEur: string;
  duration: string;
  trialDays: number;
  features: string[];
}

export default function SubscriptionPlans() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch subscription plans
  const { data: plans = [], isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
    retry: false,
  });

  // Create checkout session mutation
  const createCheckoutMutation = useMutation({
    mutationFn: async (planId: string) => {
      if (!isAuthenticated) {
        throw new Error("Devi essere autenticato per procedere");
      }
      
      const response = await apiRequest("/api/create-checkout-session", { planId }, "POST");
      return response;
    },
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      console.error("Checkout error:", error);
      toast({
        title: "Errore",
        description: "Impossibile creare la sessione di pagamento. Riprova.",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (planId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere connesso per abbonarti.",
        variant: "destructive",
      });
      setTimeout(() => setLocation("/auth"), 1500);
      return;
    }
    
    createCheckoutMutation.mutate(planId);
  };

  const formatPrice = (price: string, duration: string) => {
    const monthlyPrice = duration === 'quarterly' ? (parseFloat(price) / 3).toFixed(0) : 
                        duration === 'annual' ? (parseFloat(price) / 12).toFixed(0) : price;
    
    return {
      main: `€${price}`,
      monthly: duration !== 'monthly' ? `€${monthlyPrice}/mese` : null
    };
  };

  const getPlanIcon = (duration: string) => {
    switch (duration) {
      case 'annual':
        return <Crown className="h-8 w-8 text-yellow-500" />;
      case 'quarterly':
        return <Star className="h-8 w-8 text-blue-500" />;
      default:
        return <CheckCircle className="h-8 w-8 text-green-500" />;
    }
  };

  const getPlanBadge = (duration: string) => {
    switch (duration) {
      case 'annual':
        return <Badge className="bg-yellow-500 text-white">PIÙ CONVENIENTE</Badge>;
      case 'quarterly':
        return <Badge className="bg-blue-500 text-white">RISPARMI</Badge>;
      default:
        return null;
    }
  };

  if (plansLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-emerald-800 mb-4">
            Scegli il Tuo Piano
          </h1>
          <p className="text-lg text-emerald-600 max-w-2xl mx-auto">
            Inizia il tuo percorso nutrizionale personalizzato con La Mia Gazzella.
            Tutti i piani includono 3 giorni di prova gratuita.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const pricing = formatPrice(plan.priceEur, plan.duration);
            const isPopular = plan.duration === 'quarterly';
            
            return (
              <Card 
                key={plan.id} 
                className={`relative transition-all duration-300 hover:shadow-lg ${
                  isPopular ? 'ring-2 ring-emerald-500 scale-105' : ''
                }`}
                data-testid={`card-plan-${plan.id}`}
              >
                {getPlanBadge(plan.duration) && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    {getPlanBadge(plan.duration)}
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    {getPlanIcon(plan.duration)}
                  </div>
                  <CardTitle className="text-xl font-bold text-emerald-800">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mt-4">
                    <div className="text-3xl font-bold text-emerald-800">
                      {pricing.main}
                    </div>
                    {pricing.monthly && (
                      <div className="text-sm text-emerald-600">
                        {pricing.monthly}
                      </div>
                    )}
                    <div className="text-sm text-gray-500 mt-1">
                      Ogni {plan.duration === 'monthly' ? 'Mese' : 
                           plan.duration === 'quarterly' ? 'Trimestre' : 'Anno'}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {plan.trialDays > 0 && (
                    <div className="bg-emerald-50 rounded-lg p-3 mb-4 text-center">
                      <p className="text-sm font-medium text-emerald-800">
                        {plan.trialDays} giorni di prova gratuita
                      </p>
                      <p className="text-xs text-emerald-600">
                        poi €{plan.priceEur}/{plan.duration === 'monthly' ? 'mese' : 
                                                plan.duration === 'quarterly' ? 'trimestre' : 'anno'}
                      </p>
                    </div>
                  )}

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={createCheckoutMutation.isPending}
                    className={`w-full ${
                      isPopular 
                        ? 'bg-emerald-600 hover:bg-emerald-700' 
                        : 'bg-emerald-500 hover:bg-emerald-600'
                    }`}
                    data-testid={`button-subscribe-${plan.id}`}
                  >
                    {createCheckoutMutation.isPending ? "Attendere..." : "Inizia Prova Gratuita"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Tutti i piani includono accesso completo alle funzionalità di La Mia Gazzella.
            Puoi cancellare in qualsiasi momento durante il periodo di prova senza addebiti.
          </p>
        </div>
      </div>
    </div>
  );
}