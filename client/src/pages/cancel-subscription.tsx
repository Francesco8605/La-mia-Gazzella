import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowLeft, Calendar, Shield, Heart, TrendingUp, Sparkles, ChefHat, Coffee, X, Check } from "lucide-react";

export default function CancelSubscription() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { subscription, isLoading } = useSubscription();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hasUnderstoodImmediateAccess, setHasUnderstoodImmediateAccess] = useState(false);

  // Fetch user's meal plans for personalization
  const { data: mealPlans } = useQuery<any[]>({
    queryKey: ["/api/meal-plans"],
    enabled: !!subscription?.hasActiveSubscription,
  });

  // Fetch user's recipes for personalization
  const { data: recipes } = useQuery<any[]>({
    queryKey: ["/api/recipes"],
    enabled: !!subscription?.hasActiveSubscription,
  });

  const mealPlansCount = Array.isArray(mealPlans) ? mealPlans.length : 0;
  const recipesCount = Array.isArray(recipes) ? recipes.length : 0;

  const cancelMutation = useMutation({
    mutationFn: () => apiRequest("/api/cancel-subscription", {}, "POST"),
    onSuccess: (data) => {
      toast({
        title: "Abbonamento Cancellato",
        description: "Il tuo abbonamento è stato cancellato con successo.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/subscription"] });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante la cancellazione dell'abbonamento",
        variant: "destructive",
      });
    },
  });

  const handleCancel = () => {
    cancelMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!subscription?.hasActiveSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6 text-center">
              <Shield className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Nessun Abbonamento Attivo
              </h2>
              <p className="text-slate-600 mb-6">
                Non hai un abbonamento attivo da cancellare.
              </p>
              <Button onClick={() => setLocation("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Torna alla Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna alla Homepage
            </Button>
          </div>

          {/* Hero Section - Value Proposition */}
          <Card className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-orange-200">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Coffee className="h-12 w-12 text-orange-600" />
                <Heart className="h-8 w-8 text-red-500" />
              </div>
              <h1 className="text-4xl font-bold text-slate-800 mb-3">
                Aspetta! Prima di andare via...
              </h1>
              <div className="max-w-2xl mx-auto">
                <p className="text-xl text-slate-700 mb-6">
                  Per <span className="font-bold text-orange-600">meno di 1€ al giorno</span> (il costo di un caffè al bar)
                </p>
                <div className="bg-white rounded-lg p-4 inline-block shadow-sm">
                  <p className="text-3xl font-bold text-emerald-600">
                    €29 <span className="text-lg text-slate-600">/mese</span>
                  </p>
                  <p className="text-sm text-slate-500 mt-1">= Un investimento nella tua salute</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!showConfirmation ? (
            <>
              {/* Loss Aversion Section - Cosa Perderai */}
              <Card className="mb-8 border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800 text-2xl flex items-center gap-2">
                    <X className="h-6 w-6" />
                    Ecco cosa perderai cancellando
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-red-200">
                      <div className="flex items-start gap-3">
                        <X className="h-5 w-5 text-red-500 mt-1" />
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-1">Piani Settimanali Personalizzati</h4>
                          <p className="text-sm text-slate-600">Nuovo piano ogni settimana, sempre calibrato sui tuoi obiettivi</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-red-200">
                      <div className="flex items-start gap-3">
                        <X className="h-5 w-5 text-red-500 mt-1" />
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-1">Ricette Sempre Nuove</h4>
                          <p className="text-sm text-slate-600">Infinite variazioni per non annoiarti mai a tavola</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-red-200">
                      <div className="flex items-start gap-3">
                        <X className="h-5 w-5 text-red-500 mt-1" />
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-1">Tracciamento Progressi</h4>
                          <p className="text-sm text-slate-600">Monitora i tuoi risultati e resta motivata</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-red-200">
                      <div className="flex items-start gap-3">
                        <X className="h-5 w-5 text-red-500 mt-1" />
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-1">Supporto Continuo</h4>
                          <p className="text-sm text-slate-600">Assistenza quando ne hai bisogno</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
                  Perché La Mia Gazzella è Diversa
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
                    <CardContent className="p-6">
                      <div className="flex justify-center mb-4">
                        <div className="bg-emerald-100 p-3 rounded-full">
                          <Sparkles className="h-8 w-8 text-emerald-600" />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-slate-800 mb-2 text-center">
                        Nuovo Piano Ogni Settimana
                      </h3>
                      <p className="text-slate-600 text-center text-sm">
                        Mai la stessa routine. Ogni settimana un piano fresco, calibrato sul tuo progresso
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
                    <CardContent className="p-6">
                      <div className="flex justify-center mb-4">
                        <div className="bg-orange-100 p-3 rounded-full">
                          <ChefHat className="h-8 w-8 text-orange-600" />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-slate-800 mb-2 text-center">
                        Ricette Infinite
                      </h3>
                      <p className="text-slate-600 text-center text-sm">
                        Varietà garantita, zero noia. Ogni giorno piatti diversi e deliziosi
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                    <CardContent className="p-6">
                      <div className="flex justify-center mb-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <TrendingUp className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-slate-800 mb-2 text-center">
                        Stile di Vita Sostenibile
                      </h3>
                      <p className="text-slate-600 text-center text-sm">
                        Non una dieta temporanea, ma un percorso di benessere a lungo termine
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Personal Stats */}
              {(mealPlansCount > 0 || recipesCount > 0) && (
                <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">
                      Il Tuo Percorso Finora
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {mealPlansCount > 0 && (
                        <div className="text-center">
                          <div className="text-4xl font-bold text-purple-600 mb-2">
                            {mealPlansCount}
                          </div>
                          <p className="text-slate-700">Piani Alimentari Generati</p>
                          <p className="text-sm text-slate-500 mt-1">Settimane di impegno e dedizione</p>
                        </div>
                      )}
                      {recipesCount > 0 && (
                        <div className="text-center">
                          <div className="text-4xl font-bold text-pink-600 mb-2">
                            {recipesCount}
                          </div>
                          <p className="text-slate-700">Ricette Personalizzate</p>
                          <p className="text-sm text-slate-500 mt-1">Tutto questo lavoro andrebbe perso</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Current Subscription Info */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Il Tuo Abbonamento Attuale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Piano:</span>
                      <span className="font-semibold capitalize">
                        {subscription?.plan === 'monthly' && 'Piano Mensile'}
                        {subscription?.plan === 'quarterly' && 'Piano Trimestrale'}
                        {subscription?.plan === 'annual' && 'Piano Annuale'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Stato:</span>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        subscription?.status === 'canceled' 
                          ? 'bg-orange-100 text-orange-800' 
                          : subscription?.isInTrial 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {subscription?.status === 'canceled' 
                          ? 'Cancellato' 
                          : subscription?.isInTrial 
                            ? 'In Prova' 
                            : 'Attivo'}
                      </span>
                    </div>
                    {subscription?.endDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">
                          {subscription?.status === 'canceled' 
                            ? 'Scadenza accesso:' 
                            : subscription?.isInTrial 
                              ? 'Fine periodo prova:' 
                              : 'Prossimo rinnovo:'}
                        </span>
                        <span className={`font-semibold ${
                          subscription?.status === 'canceled' ? 'text-orange-600' : ''
                        }`}>
                          {new Date(subscription.endDate).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* CTA Section - Hierarchical Design */}
              <div className="text-center space-y-6 py-8">
                {subscription?.status === 'canceled' ? (
                  <div className="space-y-4">
                    <Alert className="border-orange-200 bg-orange-50">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800">
                        <strong>Abbonamento già cancellato</strong>
                        <br />
                        Il tuo abbonamento rimane attivo fino al {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString('it-IT') : 'termine del periodo'}. Puoi riattivarlo in qualsiasi momento!
                      </AlertDescription>
                    </Alert>
                    <Button
                      size="lg"
                      onClick={() => setLocation("/piani-abbonamento")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-6 text-lg h-auto"
                    >
                      <Check className="mr-2 h-5 w-5" />
                      Riattiva il Mio Abbonamento
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Primary CTA - Keep Subscription */}
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-slate-800">
                        Resta con Noi e Continua il Tuo Percorso
                      </h3>
                      <Button
                        size="lg"
                        onClick={() => setLocation("/")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-6 text-lg h-auto shadow-lg hover:shadow-xl transition-shadow"
                        data-testid="keep-subscription-button"
                      >
                        <Check className="mr-2 h-5 w-5" />
                        Mantieni il Mio Abbonamento
                      </Button>
                    </div>

                    <Separator className="my-6" />

                    {/* Secondary CTA - Cancel (less prominent) */}
                    <div className="space-y-3">
                      <p className="text-sm text-slate-500">
                        Sei davvero sicura di voler cancellare?
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfirmation(true)}
                        className="text-slate-400 hover:text-red-600 text-sm underline"
                        data-testid="proceed-cancel-button"
                      >
                        Procedi comunque con la cancellazione
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            /* Confirmation Step */
            <Card className="border-red-300">
              <CardHeader className="bg-red-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-6 w-6" />
                  ⚠️ ATTENZIONE: Conferma Cancellazione
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Avviso Prominente - Perdita Immediata Accesso */}
                <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-red-800 mb-3">
                        🚨 IMPORTANTE: Perderai l'accesso IMMEDIATAMENTE
                      </h3>
                      <p className="text-red-800 font-medium mb-4">
                        Quando cancelli l'abbonamento, <strong>perderai l'accesso alla piattaforma SUBITO</strong>, 
                        anche se hai ancora giorni o settimane di abbonamento pagato.
                      </p>
                      <div className="bg-white/80 rounded-lg p-4 mb-4">
                        <p className="text-red-700 mb-2">
                          <strong>📅 Il tuo abbonamento scade il: </strong>
                          <span className="font-bold">{subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString('it-IT') : 'N/A'}</span>
                        </p>
                        <p className="text-red-700 text-sm">
                          Se cancelli oggi, perderai immediatamente l'accesso anche se hai ancora tempo pagato fino a questa data.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consigli Pratici */}
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-5 mb-6">
                  <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                    💡 Ti consigliamo di:
                  </h4>
                  <ul className="space-y-3 text-amber-900">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600">→</span>
                      <span><strong>Aspettare gli ultimi giorni</strong> prima di cancellare, così sfrutti tutto il periodo che hai già pagato</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600">→</span>
                      <span><strong>Salvare il tuo piano alimentare e le ricette</strong> se vuoi conservarli - puoi fare screenshot o copiarli prima di cancellare</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600">→</span>
                      <span>Ricorda che una volta cancellato, <strong>non potrai più accedere ai tuoi piani e ricette salvati</strong></span>
                    </li>
                  </ul>
                </div>

                {/* Checkbox di Conferma Obbligatorio */}
                <div className="bg-slate-100 border-2 border-slate-300 rounded-lg p-5 mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasUnderstoodImmediateAccess}
                      onChange={(e) => setHasUnderstoodImmediateAccess(e.target.checked)}
                      className="mt-1 h-5 w-5 rounded border-red-400 text-red-600 focus:ring-red-500"
                      data-testid="checkbox-understand-immediate-access"
                    />
                    <span className="text-slate-800 font-semibold text-base leading-relaxed">
                      HO CAPITO CHE PERDERÒ L'ACCESSO IMMEDIATAMENTE APPENA CANCELLO L'ABBONAMENTO
                    </span>
                  </label>
                </div>

                {/* Bottoni Azione */}
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowConfirmation(false);
                      setHasUnderstoodImmediateAccess(false);
                    }}
                    disabled={cancelMutation.isPending}
                    className="px-6"
                    data-testid="button-cancel-go-back"
                  >
                    ← Torna Indietro
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending || !hasUnderstoodImmediateAccess}
                    className={`px-6 ${!hasUnderstoodImmediateAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
                    data-testid="button-confirm-cancel-subscription"
                  >
                    {cancelMutation.isPending ? "Cancellando..." : "Conferma Cancellazione"}
                  </Button>
                </div>

                {!hasUnderstoodImmediateAccess && (
                  <p className="text-center text-sm text-slate-500 mt-4">
                    ⬆️ Devi spuntare la casella sopra per procedere con la cancellazione
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}