import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Heart, Clock } from "lucide-react";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-emerald-800 mb-4">
              Benvenuto, {user?.username}!
            </h1>
            <p className="text-lg text-emerald-600">
              Pronto per il tuo percorso nutrizionale personalizzato con La Mia Gazzella?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-emerald-800">
                  <Sparkles className="h-6 w-6 mr-2" />
                  Piano Personalizzato
                </CardTitle>
                <CardDescription>
                  Crea un piano nutrizionale basato sui tuoi obiettivi e preferenze
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setLocation("/piani-abbonamento")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  data-testid="button-subscription-plans"
                >
                  Inizia Ora
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-emerald-800">
                  <Heart className="h-6 w-6 mr-2" />
                  Supporto Esperto
                </CardTitle>
                <CardDescription>
                  Ricevi consigli nutrizionali personalizzati dalla nostra IA specializzata
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setLocation("/piani-abbonamento")}
                  variant="outline"
                  className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  data-testid="button-ai-support"
                >
                  Scopri di Più
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              onClick={() => setLocation("/api/auth/logout")}
              variant="ghost"
              className="text-gray-600 hover:text-gray-800"
              data-testid="button-logout"
            >
              Esci
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-emerald-800 mb-6">
            La Mia Gazzella
          </h1>
          <p className="text-xl text-emerald-700 mb-8 max-w-3xl mx-auto">
            Il tuo assistente nutrizionale personalizzato basato sull'IA. 
            Piani alimentari su misura per il tuo benessere e i tuoi obiettivi di salute.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setLocation("/auth")}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3"
              data-testid="button-get-started"
            >
              Inizia Subito
            </Button>
            <Button 
              onClick={() => setLocation("/piani-abbonamento")}
              variant="outline"
              size="lg"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-3"
              data-testid="button-view-plans"
            >
              Vedi i Piani
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Sparkles className="h-12 w-12 text-emerald-600" />
              </div>
              <CardTitle className="text-emerald-800">Piani Personalizzati</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Ricevi piani alimentari creati specificamente per te, 
                basati sui tuoi obiettivi e preferenze alimentari.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Heart className="h-12 w-12 text-emerald-600" />
              </div>
              <CardTitle className="text-emerald-800">Supporto IA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Chat con la nostra IA nutrizionale per ricevere consigli, 
                modifiche ai piani e risposte alle tue domande.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Clock className="h-12 w-12 text-emerald-600" />
              </div>
              <CardTitle className="text-emerald-800">Risultati Rapidi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Inizia a vedere risultati in pochi giorni con i nostri 
                piani nutrizionali scientificamente validati.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-emerald-800 mb-4">
            Pronto a Trasformare la Tua Alimentazione?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Unisciti a migliaia di persone che hanno già migliorato la loro salute 
            con La Mia Gazzella. Inizia la tua prova gratuita oggi stesso.
          </p>
          <Button 
            onClick={() => setLocation("/auth")}
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-4"
            data-testid="button-start-trial"
          >
            Inizia la Prova Gratuita
          </Button>
        </div>
      </div>
    </div>
  );
}