import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceEur: string;
  duration: string;
  trialDays: number;
  features: string[];
}

interface UserSubscription {
  hasActiveSubscription: boolean;
  status: string;
  plan: string;
  isInTrial: boolean;
  trialEndDate: string;
}

export default function SubscriptionPlans() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Fetch subscription plans
  const { data: plans = [], isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
  });

  // Fetch user subscription status
  const { data: userSubscription } = useQuery<UserSubscription>({
    queryKey: ["/api/user/subscription"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Create checkout session mutation
  const createCheckoutMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiRequest("/api/create-checkout-session", { planId }, "POST");
      return response;
    },
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Accesso richiesto",
          description: "Devi essere connesso per abbonarti. Reindirizzamento...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/accedi";
        }, 2000);
        return;
      }
      
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
      setTimeout(() => {
        window.location.href = "/accedi";
      }, 2000);
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
        return <Badge className="bg-blue-500 text-white">RISPARMIO</Badge>;
      default:
        return null;
    }
  };

  if (plansLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900/20 dark:to-teal-900/20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Scegli il Tuo Piano
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Inizia la tua trasformazione con il Metodo Gazzella
          </p>
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-green-800 dark:text-green-200 font-semibold">
              🎉 Prova gratuita di 3 giorni inclusa in tutti i piani!
            </p>
          </div>
        </div>

        {/* Current Subscription Status */}
        {userSubscription?.hasActiveSubscription && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <h3 className="text-xl font-semibold">Il Tuo Abbonamento Attivo</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Piano</p>
                <p className="font-semibold capitalize">{userSubscription.plan}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stato</p>
                <Badge variant={userSubscription.isInTrial ? "secondary" : "default"}>
                  {userSubscription.isInTrial ? "Prova Gratuita" : "Attivo"}
                </Badge>
              </div>
              {userSubscription.isInTrial && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Fine Prova</p>
                  <p className="font-semibold">
                    {new Date(userSubscription.trialEndDate).toLocaleDateString('it-IT')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-3 gap-8">
          {(plans as SubscriptionPlan[]).map((plan) => {
            const priceInfo = formatPrice(plan.priceEur, plan.duration);
            const isCurrentPlan = userSubscription?.plan === plan.id;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden transition-all hover:scale-105 ${
                  plan.duration === 'annual' 
                    ? 'ring-2 ring-yellow-500 shadow-xl' 
                    : 'shadow-lg hover:shadow-xl'
                } ${isCurrentPlan ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
                data-testid={`plan-card-${plan.id}`}
              >
                {/* Plan Badge */}
                {getPlanBadge(plan.duration) && (
                  <div className="absolute top-4 right-4">
                    {getPlanBadge(plan.duration)}
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    {getPlanIcon(plan.duration)}
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Pricing */}
                  <div className="text-center">
                    <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                      {priceInfo.main}
                    </div>
                    {priceInfo.monthly && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {priceInfo.monthly}
                      </div>
                    )}
                    <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      ogni {plan.duration === 'quarterly' ? 'trimestre' : plan.duration === 'annual' ? 'anno' : 'mese'}
                    </div>
                  </div>

                  {/* Trial Notice */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center">
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      <span className="font-semibold">{plan.trialDays} giorni di prova gratuita</span>
                      <br />poi {priceInfo.main}/{plan.duration === 'quarterly' ? 'trimestre' : plan.duration === 'annual' ? 'anno' : 'mese'}
                    </p>
                  </div>
                  
                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Subscribe Button */}
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={createCheckoutMutation.isPending || isCurrentPlan}
                    className={`w-full text-white font-semibold py-3 ${
                      plan.duration === 'annual'
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                        : plan.duration === 'quarterly'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                    } disabled:opacity-50`}
                    data-testid={`subscribe-button-${plan.id}`}
                  >
                    {createCheckoutMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Caricamento...
                      </div>
                    ) : isCurrentPlan ? (
                      "Piano Attuale"
                    ) : (
                      `Inizia Prova Gratuita`
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-12 space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Tutti i piani includono accesso completo a tutti i nostri strumenti e contenuti premium.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Pagamenti sicuri elaborati da Stripe. Puoi cancellare in qualsiasi momento.
          </p>
        </div>
      </div>
    </div>
  );
}