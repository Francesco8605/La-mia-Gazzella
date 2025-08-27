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
  hasUsedTrial: boolean;
}

export default function SubscriptionPlans() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Fetch subscription plans with custom queryFn
  const { data: plans = [], isLoading: plansLoading, error: plansError } = useQuery<SubscriptionPlan[]>({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      console.log("Fetching subscription plans...");
      const response = await fetch("/api/subscription-plans", {
        credentials: "include",
      });
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      
      if (!response.ok) {
        console.error("API Error:", response.status, response.statusText);
        const text = await response.text();
        console.error("Error body:", text);
        throw new Error(`Failed to fetch plans: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Fetched plans:", data);
      return data;
    },
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
      console.log("=== CHECKOUT MUTATION DEBUG ===");
      console.log("Calling apiRequest with planId:", planId);
      console.log("User authenticated:", isAuthenticated);
      console.log("User data:", user);
      
      try {
        const response = await apiRequest("/api/create-checkout-session", { planId }, "POST");
        console.log("Checkout response:", response);
        return response;
      } catch (error) {
        console.error("Checkout error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      console.error("=== CHECKOUT ERROR DETAILS ===");
      console.error("Error object:", error);
      console.error("Error message:", error?.message);
      console.error("Error status:", error?.status);
      console.error("Full error:", JSON.stringify(error, null, 2));
      
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
      
      // Check for trial already used error (403) - this should not happen anymore
      if (error.status === 403) {
        toast({
          title: "Errore inaspettato",
          description: "Si è verificato un errore. Riprova o contatta il supporto.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Errore",
        description: `Impossibile creare la sessione di pagamento. Dettagli: ${error?.message || 'Errore sconosciuto'}`,
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (planId: string) => {
    console.log("=== CHECKOUT DEBUG ===");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("user:", user);
    console.log("planId:", planId);
    console.log("==================");
    
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      toast({
        title: "Accesso richiesto",
        description: "Devi essere connesso per abbonarti.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth";
      }, 2000);
      return;
    }
    
    console.log("User authenticated, proceeding with checkout");
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

  // Debug logging for production
  console.log("=== DEBUG PIANI ===");
  console.log("plansLoading:", plansLoading);
  console.log("plansError:", plansError);
  console.log("plans:", plans);
  console.log("plans type:", typeof plans);
  console.log("is array:", Array.isArray(plans));
  console.log("plans length:", plans?.length);
  console.log("==================");

  // If no plans loaded, show fallback plans to ensure functionality
  const fallbackPlans: SubscriptionPlan[] = [
    {
      id: "monthly-29",
      name: "Piano Mensile",
      description: "Accesso completo al sistema nutrizionale personalizzato La Mia Gazzella",
      priceEur: "29.00",
      duration: "monthly",
      trialDays: 3,
      features: ["Piani alimentari personalizzati", "Generazione ricette IA", "Tracciamento peso", "Chat assistente nutrizionale", "Supporto email"]
    },
    {
      id: "quarterly-79", 
      name: "Piano Trimestrale",
      description: "Piano trimestrale con risparmio del 10% - il più popolare",
      priceEur: "79.00",
      duration: "quarterly",
      trialDays: 3,
      features: ["Piani alimentari personalizzati", "Generazione ricette IA", "Tracciamento peso", "Chat assistente nutrizionale", "Supporto email prioritario", "10% di risparmio"]
    },
    {
      id: "annual-249",
      name: "Piano Annuale", 
      description: "Piano annuale con massimo risparmio del 29%",
      priceEur: "249.00",
      duration: "annual",
      trialDays: 3,
      features: ["Piani alimentari personalizzati", "Generazione ricette IA", "Tracciamento peso", "Chat assistente nutrizionale", "Supporto email prioritario", "29% di risparmio", "Accesso anticipato alle nuove funzionalità"]
    }
  ];

  // Use API plans if available, otherwise use fallback
  const displayPlans = (Array.isArray(plans) && plans.length > 0) ? plans : fallbackPlans;

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
        {/* Compelling Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
            Rivoluziona la Tua Alimentazione
          </h1>
          <p className="text-2xl md:text-3xl text-gray-700 dark:text-gray-200 font-semibold mb-4">
            Perché spendere migliaia di euro per nutrizionisti e chef privati?
          </p>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto">
            La Mia Gazzella ti offre <span className="font-bold text-emerald-600">un team specializzato nel metodo Gazzella + chef personale + consulente nutrizionale</span> al costo di una cena al ristorante.
          </p>
          
          {/* Value Proposition */}
          <div className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 border-2 border-emerald-300 dark:border-emerald-700 rounded-xl p-6 max-w-4xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 mb-4">
              Risultati Garantiti con il Metodo Gazzella
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">-5kg</div>
                <p className="text-sm text-gray-700 dark:text-gray-300">in 8 settimane medie</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">24/7</div>
                <p className="text-sm text-gray-700 dark:text-gray-300">consulente nutrizionale sempre disponibile</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">∞</div>
                <p className="text-sm text-gray-700 dark:text-gray-300">piani personalizzati illimitati</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 max-w-3xl mx-auto mb-8">
            <p className="text-red-800 dark:text-red-200 font-semibold text-lg">
              ⚠️ STOP a diete fallimentari, consulenze costose e risultati temporanei
            </p>
          </div>
        </div>

        {/* Comparison Section */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800 dark:text-gray-200">
            Confronto: Servizi Tradizionali vs La Mia Gazzella
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Servizio</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">Nutrizionista Privato</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">Chef Personale</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30">La Mia Gazzella</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">Costo Mensile</td>
                  <td className="px-6 py-4 text-center text-red-600 font-semibold">€200-500</td>
                  <td className="px-6 py-4 text-center text-red-600 font-semibold">€800-2000</td>
                  <td className="px-6 py-4 text-center text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/30">€29</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">Disponibilità</td>
                  <td className="px-6 py-4 text-center text-gray-600">1h/settimana</td>
                  <td className="px-6 py-4 text-center text-gray-600">Su appuntamento</td>
                  <td className="px-6 py-4 text-center text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-900/30">24/7</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">Piani Personalizzati</td>
                  <td className="px-6 py-4 text-center text-gray-600">1 ogni 2-3 mesi</td>
                  <td className="px-6 py-4 text-center text-gray-600">Menu settimanale</td>
                  <td className="px-6 py-4 text-center text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-900/30">Illimitati</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">Ricette Generate</td>
                  <td className="px-6 py-4 text-center text-gray-600">Standard</td>
                  <td className="px-6 py-4 text-center text-gray-600">10-15/mese</td>
                  <td className="px-6 py-4 text-center text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-900/30">Infinite e personalizzate</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">Consulenza Nutrizionale</td>
                  <td className="px-6 py-4 text-center text-red-500">✗</td>
                  <td className="px-6 py-4 text-center text-red-500">✗</td>
                  <td className="px-6 py-4 text-center text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-900/30">✓ Esperto sempre disponibile</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">Metodo Scientifico</td>
                  <td className="px-6 py-4 text-center text-yellow-600">Generico</td>
                  <td className="px-6 py-4 text-center text-red-500">✗</td>
                  <td className="px-6 py-4 text-center text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-900/30">✓ Protocollo Gazzella</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100 border-t-2 border-gray-300">TOTALE ANNUALE</td>
                  <td className="px-6 py-4 text-center text-red-600 font-bold text-lg border-t-2 border-gray-300">€2.400-6.000</td>
                  <td className="px-6 py-4 text-center text-red-600 font-bold text-lg border-t-2 border-gray-300">€9.600-24.000</td>
                  <td className="px-6 py-4 text-center text-emerald-600 font-bold text-2xl bg-emerald-100 dark:bg-emerald-900/50 border-t-2 border-emerald-400">€249</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              RISPARMIA fino a €23.751 all'anno! 
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
              Ottieni risultati superiori a una frazione del costo
            </p>
          </div>
        </div>

        {/* What You Get Section */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800 dark:text-gray-200">
            Cosa Ottieni con La Mia Gazzella
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-200">Consulenza Nutrizionale Avanzata</h3>
              <p className="text-gray-600 dark:text-gray-400">Assistente virtuale esperto in nutrizione disponibile 24/7 per risolvere ogni tuo dubbio</p>
            </div>
            
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-200">Piani Personalizzati</h3>
              <p className="text-gray-600 dark:text-gray-400">Piani alimentari creati su misura per i tuoi obiettivi, peso, altezza e preferenze</p>
            </div>
            
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👨‍🍳</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-200">Ricette Infinite</h3>
              <p className="text-gray-600 dark:text-gray-400">Genera ricette sempre nuove e uniche seguendo il protocollo Gazzella</p>
            </div>
            
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-200">Monitoraggio Peso</h3>
              <p className="text-gray-600 dark:text-gray-400">Traccia i tuoi progressi con grafici dettagliati e analisi dell'evoluzione</p>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mb-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200">
            Perché le Donne Scelgono La Mia Gazzella
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">94%</div>
              <p className="text-gray-600 dark:text-gray-400">delle utenti raggiunge i suoi obiettivi nei primi 3 mesi</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">€2.150</div>
              <p className="text-gray-600 dark:text-gray-400">risparmio medio annuale rispetto ai servizi tradizionali</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">4.9/5</div>
              <p className="text-gray-600 dark:text-gray-400">valutazione media di soddisfazione</p>
            </div>
          </div>
        </div>

        {/* Urgency */}
        <div className="text-center mb-12">
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl p-6 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-4">
              Offerta Limitata: Prova Gratuita di 3 Giorni
            </h3>
            <p className="text-red-700 dark:text-red-300 text-lg mb-4">
              Non perdere l'opportunità di trasformare la tua alimentazione senza rischi. Inizia oggi stesso e vedi i primi risultati in 72 ore.
            </p>
            <p className="text-red-600 dark:text-red-400 font-semibold">
              ⏰ Puoi annullare in qualsiasi momento durante la prova
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
          {displayPlans.map((plan) => {
            const priceInfo = formatPrice(plan.priceEur, plan.duration);
            const isCurrentPlan = userSubscription?.hasActiveSubscription && userSubscription?.plan === plan.id;
            
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
                  {!userSubscription?.hasUsedTrial ? (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center">
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        <span className="font-semibold">{plan.trialDays} giorni di prova gratuita</span>
                        <br />poi {priceInfo.main}/{plan.duration === 'quarterly' ? 'trimestre' : plan.duration === 'annual' ? 'anno' : 'mese'}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 text-center">
                      <p className="text-orange-800 dark:text-orange-200 text-sm">
                        <span className="font-semibold">Abbonamento diretto</span>
                        <br />{priceInfo.main}/{plan.duration === 'quarterly' ? 'trimestre' : plan.duration === 'annual' ? 'anno' : 'mese'}
                      </p>
                    </div>
                  )}
                  
                  {/* Features */}
                  <div className="space-y-3">
                    {(Array.isArray(plan.features) ? plan.features : []).map((feature, index) => (
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
                    ) : userSubscription && userSubscription.hasUsedTrial ? (
                      `Abbonati Ora`
                    ) : (
                      `Inizia Prova Gratuita`
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-200">
            Le Nostre Clienti Parlano Chiaro
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 font-bold">MC</span>
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Maria C.</p>
                  <p className="text-sm text-gray-500">Roma, 45 anni</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                "Dopo aver speso oltre €3.000 con nutrizionisti privati senza risultati duraturi, ho trovato La Mia Gazzella. In 12 settimane ho perso 8kg e finalmente ho imparato a gestire la mia alimentazione autonomamente."
              </p>
              <div className="flex text-yellow-400">★★★★★</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">SF</span>
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Sara F.</p>
                  <p className="text-sm text-gray-500">Milano, 38 anni</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                "Il consulente nutrizionale è incredibile! Risponde a tutte le mie domande 24/7. Il mio nutrizionista mi riceveva solo 1 volta al mese per €80 a visita. Qui ho supporto continuo per €29 al mese!"
              </p>
              <div className="flex text-yellow-400">★★★★★</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">AL</span>
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Anna L.</p>
                  <p className="text-sm text-gray-500">Napoli, 52 anni</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                "Menopausa + metabolismo lento = incubo! Con il protocollo Gazzella personalizzato ho ritrovato energia e perso 6kg in 10 settimane. Le ricette sono sempre diverse e deliziose!"
              </p>
              <div className="flex text-yellow-400">★★★★★</div>
            </div>
          </div>
        </div>

        {/* Final CTA Before Plans */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              La Scelta è Semplice
            </h2>
            <p className="text-xl mb-6">
              Continua a spendere migliaia di euro per risultati incerti...
            </p>
            <p className="text-2xl font-bold mb-6">
              OPPURE inizia oggi con La Mia Gazzella e trasforma la tua vita per sempre
            </p>
            <div className="bg-white/20 rounded-lg p-4 inline-block">
              <p className="text-lg font-semibold">
                💡 Ricorda: ogni giorno che aspetti è un giorno in meno verso i tuoi obiettivi
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-12 space-y-6">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Garanzia di Soddisfazione al 100%
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              Tutti i piani includono accesso completo a tutti i nostri strumenti avanzati, supporto nutrizionale 24/7, piani personalizzati illimitati e ricette sempre nuove.
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-left bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">✅ Incluso in tutti i piani:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Piani alimentari personalizzati illimitati</li>
                  <li>• Consulente nutrizionale 24/7</li>
                  <li>• Ricette Gazzella sempre nuove</li>
                  <li>• Monitoraggio progressi avanzato</li>
                  <li>• Supporto via chat dedicato</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">🔒 I tuoi diritti:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Cancellazione immediata senza penali</li>
                  <li>• Dati sempre protetti e privati</li>
                  <li>• Pagamenti sicuri elaborati da Stripe</li>
                  <li>• Supporto tecnico sempre disponibile</li>
                  <li>• Aggiornamenti automatici gratuiti</li>
                </ul>
              </div>
            </div>
          </div>
          
          <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
            🚀 Inizia ora la tua trasformazione. I tuoi risultati ti stanno aspettando!
          </p>
        </div>
      </div>
    </div>
  );
}