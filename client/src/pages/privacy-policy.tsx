import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
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
              Privacy Policy
            </CardTitle>
            <p className="text-center text-slate-600 mt-4">
              Ultimo aggiornamento: 23 Agosto 2025
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Introduzione</h2>
              <p className="text-slate-600">
                La Mia Gazzella ("noi", "ci", "nostro") rispetta la tua privacy e si impegna a proteggerla attraverso la conformità con questa privacy policy. 
                Questa policy descrive i tipi di informazioni che possiamo raccogliere da te o che potresti fornire quando visiti il nostro sito web e le nostre pratiche per raccogliere, utilizzare, mantenere, proteggere e divulgare tali informazioni.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Informazioni che Raccogliamo</h2>
              <p className="text-slate-600 mb-3">Raccogliamo diversi tipi di informazioni da e sui nostri utenti:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-1">
                <li>Informazioni personali (nome, email, età, peso, obiettivi di salute)</li>
                <li>Dati nutrizionali e preferenze alimentari</li>
                <li>Informazioni sui pagamenti (tramite Stripe)</li>
                <li>Dati di utilizzo dell'applicazione</li>
                <li>Cookie e tecnologie di tracciamento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Come Utilizziamo le Tue Informazioni</h2>
              <p className="text-slate-600 mb-3">Utilizziamo le informazioni che raccogliamo per:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-1">
                <li>Fornire piani nutrizionali personalizzati</li>
                <li>Generare ricette adatte alle tue esigenze</li>
                <li>Fornire assistenza nutrizionale personalizzata</li>
                <li>Elaborare pagamenti e gestire abbonamenti</li>
                <li>Migliorare i nostri servizi</li>
                <li>Comunicare con te riguardo al servizio</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Condivisione delle Informazioni</h2>
              <p className="text-slate-600">
                Non vendiamo, scambiamo o trasmettiamo le tue informazioni personali a terze parti senza il tuo consenso, 
                eccetto nei seguenti casi: elaborazione pagamenti (Stripe), obblighi legali, protezione dei nostri diritti.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Sicurezza dei Dati</h2>
              <p className="text-slate-600">
                Implementiamo misure di sicurezza appropriate per proteggere le tue informazioni personali contro 
                accesso non autorizzato, alterazione, divulgazione o distruzione.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">6. I Tuoi Diritti</h2>
              <p className="text-slate-600 mb-3">Hai il diritto di:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-1">
                <li>Accedere alle tue informazioni personali</li>
                <li>Correggere dati inesatti</li>
                <li>Richiedere la cancellazione dei tuoi dati</li>
                <li>Limitare il trattamento</li>
                <li>Portabilità dei dati</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Contatti</h2>
              <p className="text-slate-600">
                Per domande su questa Privacy Policy, contattaci a:{" "}
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