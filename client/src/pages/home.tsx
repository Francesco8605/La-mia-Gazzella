import { Sparkles, Play, User, Mail, MessageCircle, Settings } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

import logoGazzella from "@/immagini/Logo-gazzella.jpg";

export default function Home() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="pt-24 pb-12">
      {/* Hero Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="text-center max-w-4xl mx-auto animate-slide-up">
          {/* Logo Image */}
          <div className="mb-8 flex justify-center">
            <img 
              src={logoGazzella} 
              alt="Logo della Gazzella" 
              className="w-32 h-32 md:w-40 md:h-40 object-contain rounded-full shadow-2xl glass-morphism p-4 animate-float"
              data-testid="hero-logo"
            />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-red-600 via-green-600 to-emerald-600 bg-clip-text text-transparent mb-6 leading-tight">
            Il Tuo Assistente
            <br />
            Nutrizionale Personale
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            Pianificazione alimentare avanzata che si adatta al tuo stile di vita, alle tue preferenze alimentari e ai tuoi obiettivi di salute. Ottieni ricette personalizzate e piani nutrizionali in pochi secondi.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-center items-center max-w-4xl mx-auto">
            <Link href="/recipe-generator">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-red-500 to-green-500 hover:from-red-600 hover:to-green-600 text-white font-bold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-shadow-sm"
                data-testid="genera-ricette-button"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                <span className="text-white drop-shadow-lg">Genera Ricette</span>
              </Button>
            </Link>
            <Link href="/piani-personalizzati">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-red-500 to-green-500 hover:from-red-600 hover:to-green-600 text-white font-bold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                data-testid="i-miei-piani-button"
              >
                <User className="mr-2 h-4 w-4 text-white" />
                <span className="text-white drop-shadow-lg font-bold">I Miei Piani</span>
              </Button>
            </Link>
            <Link href="/assistente-nutrizionale">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                data-testid="ai-assistant-button"
              >
                <MessageCircle className="mr-2 h-5 w-5 text-white" />
                <span className="text-white drop-shadow-lg font-bold">🤖 Consulente Nutrizionale</span>
              </Button>
            </Link>
            <Link href="/aggiorna-profilo">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-red-500 to-green-500 hover:from-red-600 hover:to-green-600 text-white font-bold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                data-testid="il-mio-profilo-button"
              >
                <User className="mr-2 h-4 w-4 text-white" />
                <span className="text-white drop-shadow-lg font-bold">Il Mio Profilo</span>
              </Button>
            </Link>
            <Link href="/recipes">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-red-500 to-green-500 hover:from-red-600 hover:to-green-600 text-white font-bold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                data-testid="ricette-button"
              >
                <Sparkles className="mr-2 h-4 w-4 text-white" />
                <span className="text-white drop-shadow-lg font-bold">Ricette</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>





      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="text-secondary text-2xl" />
              <span className="font-bold text-2xl">La Mia Gazzella</span>
            </div>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Potenziamo stili di vita più sani attraverso la pianificazione nutrizionale avanzata. Piani alimentari e ricette personalizzati che si adattano alle tue esigenze e preferenze uniche.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => window.location.href = 'mailto:ilmanualedellagazzella@gmail.com?subject=Richiesta Supporto - La Mia Gazzella'}
                className="bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                data-testid="contact-support-button"
              >
                <Mail className="mr-2 h-4 w-4" />
                Contatta Supporto
              </Button>
              
              <Link href="/cancella-abbonamento">
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  data-testid="manage-subscription-button"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Gestisci Abbonamento
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center">
            <p className="text-slate-400">
              &copy; 2025 La Mia Gazzella. Tutti i diritti riservati.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}