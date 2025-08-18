import { Sparkles, Play, User } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

import RecipeCards from "@/components/recipe-cards";
import LoadingStates from "@/components/loading-states";
import logoGazzella from "@/immagini/Logo-gazzella.jpg";

export default function Home() {
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
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6 leading-tight">
            Il Tuo Assistente
            <br />
            Nutrizionale Personale
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            Pianificazione alimentare alimentata dall'IA che si adatta al tuo stile di vita, alle tue preferenze alimentari e ai tuoi obiettivi di salute. Ottieni ricette personalizzate e piani nutrizionali in pochi secondi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/personalization">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                data-testid="personalization-button"
              >
                <User className="mr-2 h-5 w-5" />
                Inizia Personalizzazione
              </Button>
            </Link>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              data-testid="create-meal-plan-button"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Crea Piano Alimentare
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="glass-morphism hover:bg-white/20 text-slate-700 font-semibold px-8 py-4 rounded-xl border border-white/30 hover:border-white/50 transition-all duration-300"
              data-testid="how-it-works-button"
            >
              <Play className="mr-2 h-5 w-5" />
              Scopri Come Funziona
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="container mx-auto px-4 mb-16">
        <RecipeCards />
      </section>

      {/* Loading States Demo */}
      <section className="container mx-auto px-4 mb-16">
        <LoadingStates />
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="text-secondary text-2xl" />
                <span className="font-bold text-2xl">La Mia Gazzella</span>
              </div>
              <p className="text-slate-300 mb-6 max-w-md">
                Potenziamo stili di vita più sani attraverso la pianificazione nutrizionale alimentata dall'IA. Piani alimentari e ricette personalizzati che si adattano alle tue esigenze e preferenze uniche.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Prodotto</h4>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors duration-300">Pianificazione Alimentare</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Generatore di Ricette</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Monitoraggio Nutrizionale</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Funzionalità Premium</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Supporto</h4>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors duration-300">Centro Assistenza</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Contattaci</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Community</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-12 pt-8 text-center">
            <p className="text-slate-400">
              © 2024 La Mia Gazzella. Tutti i diritti riservati. Alimentato dall'intelligenza artificiale per nutrire il tuo futuro.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}