import { Link } from "wouter";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Crown, Calendar, CreditCard, AlertTriangle, Settings } from "lucide-react";

export function SubscriptionSettings() {
  const { subscription, hasActiveSubscription, isInTrial } = useSubscription();

  if (!hasActiveSubscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Abbonamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Nessun Abbonamento Attivo
            </h3>
            <p className="text-slate-600 mb-4">
              Sottoscrivi un piano per accedere a tutte le funzionalità premium.
            </p>
            <Link href="/piani-abbonamento">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Visualizza Piani
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-emerald-600" />
          Il Tuo Abbonamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Piano Attuale */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-slate-800">Piano Attuale</h4>
              <p className="text-sm text-slate-600">
                {subscription?.plan === 'monthly' && 'Piano Mensile'}
                {subscription?.plan === 'quarterly' && 'Piano Trimestrale'}
                {subscription?.plan === 'annual' && 'Piano Annuale'}
              </p>
            </div>
            <Badge variant={isInTrial ? "secondary" : "default"}>
              {isInTrial ? 'In Prova' : 'Attivo'}
            </Badge>
          </div>

          <Separator />

          {/* Stato Abbonamento */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Stato:</span>
              <span className="font-medium capitalize">{subscription?.status}</span>
            </div>
            
            {subscription?.startDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Data attivazione:</span>
                <span className="font-medium">
                  {new Date(subscription.startDate).toLocaleDateString('it-IT')}
                </span>
              </div>
            )}

            {subscription?.endDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  {isInTrial ? 'Fine periodo prova:' : 'Prossimo rinnovo:'}
                </span>
                <span className="font-medium">
                  {new Date(subscription.endDate).toLocaleDateString('it-IT')}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Azioni */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/piani-abbonamento" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Cambia Piano
                </Button>
              </Link>
              
              {/* Solo se non è Francesco (utente test) */}
              {!subscription?.isTestUser && (
                <Link href="/cancella-abbonamento" className="flex-1">
                  <Button variant="destructive" className="w-full">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Cancella Abbonamento
                  </Button>
                </Link>
              )}
            </div>

            {subscription?.isTestUser && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Account di Test</strong> - Hai accesso completo per testing e sviluppo.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}