import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, ArrowLeft, Calendar, Shield } from "lucide-react";

export default function CancelSubscription() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { subscription, isLoading } = useSubscription();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const cancelMutation = useMutation({
    mutationFn: () => apiRequest("/api/cancel-subscription", {}, "POST"),
    onSuccess: (data) => {
      toast({
        title: "Abbonamento Cancellato",
        description: "Il tuo abbonamento è stato cancellato con successo.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/subscription"] });
      setLocation("/dashboard");
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
              <Button onClick={() => setLocation("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Torna alla Dashboard
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
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => setLocation("/dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna alla Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-slate-800">
              Cancella Abbonamento
            </h1>
            <p className="text-slate-600 mt-2">
              Gestisci la cancellazione del tuo abbonamento La Mia Gazzella
            </p>
          </div>

          {!showConfirmation ? (
            <>
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
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                        {subscription?.isInTrial ? 'In Prova' : 'Attivo'}
                      </span>
                    </div>
                    {subscription?.endDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Prossimo rinnovo:</span>
                        <span className="font-semibold">
                          {new Date(subscription.endDate).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* What Happens Warning */}
              <Alert className="mb-6 border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Cosa succede quando cancelli:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Il tuo abbonamento rimarrà attivo fino alla fine del periodo di fatturazione corrente</li>
                    <li>Non verrai più addebitato per i rinnovi futuri</li>
                    <li>Manterrai l'accesso a tutte le funzionalità premium fino alla scadenza</li>
                    <li>I tuoi dati e piani personalizzati saranno conservati</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Alternative Options */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Prima di Cancellare...</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    Hai considerato queste alternative alla cancellazione?
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="text-2xl">💬</div>
                      <div>
                        <h4 className="font-semibold">Contatta il Supporto</h4>
                        <p className="text-sm text-slate-600">
                          Il nostro team può aiutarti a risolvere eventuali problemi
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="text-2xl">📅</div>
                      <div>
                        <h4 className="font-semibold">Pausa Temporanea</h4>
                        <p className="text-sm text-slate-600">
                          Considera di cambiare piano invece di cancellare completamente
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Separator className="my-6" />

              {/* Cancel Button */}
              <div className="text-center">
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={() => setShowConfirmation(true)}
                  className="min-w-[200px]"
                >
                  Procedi con la Cancellazione
                </Button>
              </div>
            </>
          ) : (
            /* Confirmation Step */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Conferma Cancellazione
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    <strong>Sei sicuro di voler cancellare il tuo abbonamento?</strong>
                    <br />
                    Questa azione non può essere annullata. Il tuo abbonamento rimarrà attivo fino al {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString('it-IT') : 'termine del periodo corrente'}.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmation(false)}
                    disabled={cancelMutation.isPending}
                  >
                    Annulla
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending}
                  >
                    {cancelMutation.isPending ? "Cancellando..." : "Conferma Cancellazione"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}