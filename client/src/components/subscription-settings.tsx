import { Link } from "wouter";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Crown, Calendar, CreditCard, AlertTriangle, Settings, Clock, XCircle } from "lucide-react";

export function SubscriptionSettings() {
  const { subscription, hasActiveSubscription, isInTrial } = useSubscription();
  
  // Determina se l'abbonamento è cancellato ma ancora attivo
  const isCanceled = subscription?.status === 'canceled';
  const isStillActive = hasActiveSubscription && isCanceled;

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
            <Badge variant={
              isInTrial ? "secondary" : 
              isCanceled ? "destructive" : 
              "default"
            }>
              {isInTrial ? 'In Prova' : 
               isCanceled ? 'Cancellato' : 
               'Attivo'}
            </Badge>
          </div>

          <Separator />

          {/* Alert per abbonamento cancellato */}
          {isStillActive && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-medium text-orange-800">Cancellazione Registrata</h4>
                  <p className="text-sm text-orange-700">
                    Il tuo abbonamento è stato cancellato ma rimane attivo fino alla data di scadenza.
                    Non verrai più addebitato automaticamente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stato Abbonamento */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Stato:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium capitalize">
                  {subscription?.status === 'canceled' ? 'Cancellato' : subscription?.status}
                </span>
                {isCanceled && (
                  <Clock className="h-4 w-4 text-orange-600" />
                )}
              </div>
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
                  {isInTrial ? 'Fine periodo prova:' : 
                   isCanceled ? 'Scadenza accesso:' : 
                   'Prossimo rinnovo:'}
                </span>
                <span className={`font-medium ${isCanceled ? 'text-orange-600' : ''}`}>
                  {new Date(subscription.endDate).toLocaleDateString('it-IT')}
                </span>
              </div>
            )}
            
            {/* Informazioni aggiuntive per abbonamenti cancellati */}
            {isStillActive && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-slate-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm space-y-1">
                    <p className="font-medium text-slate-800">Accesso fino al {new Date(subscription.endDate!).toLocaleDateString('it-IT')}</p>
                    <p className="text-slate-600">
                      Dopo questa data non avrai più accesso alle funzionalità premium. 
                      Puoi riattivare l'abbonamento in qualsiasi momento.
                    </p>
                  </div>
                </div>
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
              
              {!isCanceled ? (
                <Link href="/cancella-abbonamento" className="flex-1">
                  <Button variant="destructive" className="w-full">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Cancella Abbonamento
                  </Button>
                </Link>
              ) : (
                <Link href="/piani-abbonamento" className="flex-1">
                  <Button variant="default" className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <Crown className="h-4 w-4 mr-2" />
                    Riattiva Abbonamento
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}