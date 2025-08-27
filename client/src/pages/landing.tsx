import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Leaf, Star, Users, Clock, User } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <Leaf className="text-primary text-6xl mr-4" />
            <h1 className="text-5xl md:text-6xl font-bold text-slate-800">
              La Mia Gazzella
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Il tuo assistente nutrizionale AI per piani alimentari personalizzati 
            secondo il Protocollo Gazzella
          </p>
          
          <Button
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg"
            data-testid="login-button"
          >
            <User className="mr-2" size={20} />
            Inizia Ora - Accedi Gratis
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Leaf className="text-primary text-4xl mx-auto mb-4" />
              <CardTitle>Protocollo Gazzella</CardTitle>
              <CardDescription>
                Piani alimentari basati sul protocollo scientifico per la menopausa
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Star className="text-primary text-4xl mx-auto mb-4" />
              <CardTitle>AI Personalizzata</CardTitle>
              <CardDescription>
                Ricette e piani generati dall'intelligenza artificiale su misura per te
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Clock className="text-primary text-4xl mx-auto mb-4" />
              <CardTitle>Risultati Veloci</CardTitle>
              <CardDescription>
                Ottieni il tuo piano nutrizionale personalizzato in pochi minuti
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">
            Perché Scegliere La Mia Gazzella
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-slate-700 mb-4">
                🎯 Personalizzazione Totale
              </h3>
              <p className="text-slate-600 mb-6">
                Ogni piano è creato considerando la tua età, peso, altezza, attività fisica, 
                problemi di salute e preferenze alimentari specifiche.
              </p>

              <h3 className="text-xl font-semibold text-slate-700 mb-4">
                🧠 Intelligenza Artificiale Avanzata
              </h3>
              <p className="text-slate-600">
                Utilizziamo GPT-4 per creare ricette innovative e piani alimentari 
                che rispettano rigorosamente il Protocollo Gazzella.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-slate-700 mb-4">
                📊 Monitoraggio Progressi
              </h3>
              <p className="text-slate-600 mb-6">
                Tieni traccia del tuo peso, monitora i progressi e ricevi 
                consigli personalizzati dal tuo assistente nutrizionale.
              </p>

              <h3 className="text-xl font-semibold text-slate-700 mb-4">
                💚 Approccio Naturale
              </h3>
              <p className="text-slate-600">
                Basato su principi scientifici per il benessere femminile, 
                con focus particolare sulla salute in menopausa.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Inizia il Tuo Percorso di Benessere
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Unisciti a migliaia di donne che hanno trasformato la loro salute
          </p>
          
          <Button
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg"
            data-testid="cta-login-button"
          >
            <User className="mr-2" size={20} />
            Accedi e Inizia Gratis
          </Button>
          
          <p className="text-sm text-slate-500 mt-4">
            * Registrazione gratuita con Replit • Nessuna carta di credito richiesta
          </p>
        </div>
      </div>
    </div>
  );
}