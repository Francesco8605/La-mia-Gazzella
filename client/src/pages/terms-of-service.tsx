import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-800">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla Home
            </Button>
          </Link>
        </div>

        <Card className="glass-morphism border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Termini di Servizio
            </CardTitle>
            <p className="text-center text-slate-600 mt-4">
              Ultimo aggiornamento: 23 Agosto 2025
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Accettazione dei Termini</h2>
              <p className="text-slate-600">
                Utilizzando La Mia Gazzella, accetti di essere vincolato da questi Termini di Servizio. 
                Se non accetti tutti i termini e le condizioni di questo accordo, non puoi utilizzare questo servizio.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Descrizione del Servizio</h2>
              <p className="text-slate-600">
                La Mia Gazzella è un'applicazione web che fornisce consulenza nutrizionale personalizzata, 
                piani alimentari e ricette basate sul protocollo Gazzella, utilizzando tecnologie di intelligenza artificiale.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Registrazione Account</h2>
              <p className="text-slate-600 mb-3">Per utilizzare certi servizi, devi:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-1">
                <li>Fornire informazioni accurate e veritiere</li>
                <li>Mantenere la sicurezza del tuo account</li>
                <li>Essere responsabile di tutte le attività sotto il tuo account</li>
                <li>Notificarci immediatamente di qualsiasi uso non autorizzato</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Pagamenti e Abbonamenti</h2>
              <p className="text-slate-600 mb-3">Riguardo agli abbonamenti:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-1">
                <li>I pagamenti sono elaborati tramite Stripe</li>
                <li>Gli abbonamenti si rinnovano automaticamente</li>
                <li>Offriamo un periodo di prova gratuito di 3 giorni</li>
                <li>Puoi cancellare in qualsiasi momento</li>
                <li>I rimborsi sono gestiti caso per caso</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Disclaimer Medico</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 font-medium">
                  ⚠️ IMPORTANTE: I consigli nutrizionali forniti sono solo a scopo informativo e non sostituiscono 
                  il parere medico professionale. Consulta sempre il tuo medico prima di apportare modifiche significative alla tua dieta.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Uso Accettabile</h2>
              <p className="text-slate-600 mb-3">È vietato:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-1">
                <li>Utilizzare il servizio per scopi illegali</li>
                <li>Interferire con il funzionamento del servizio</li>
                <li>Condividere le credenziali di accesso</li>
                <li>Copiare o distribuire contenuti senza autorizzazione</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Limitazione di Responsabilità</h2>
              <p className="text-slate-600">
                La Mia Gazzella non sarà responsabile per danni indiretti, incidentali, speciali o consequenziali 
                derivanti dall'uso del servizio. Il nostro servizio è fornito "così com'è" senza garanzie di alcun tipo.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">8. Modifiche ai Termini</h2>
              <p className="text-slate-600">
                Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. 
                Le modifiche saranno comunicate tramite email o notifica nell'applicazione.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">9. Contatti</h2>
              <p className="text-slate-600">
                Per domande sui Termini di Servizio, contattaci a:{" "}
                <a 
                  href="mailto:ilmanualedellagazzella@gmail.com"
                  className="text-primary hover:underline"
                >
                  ilmanualedellagazzella@gmail.com
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}