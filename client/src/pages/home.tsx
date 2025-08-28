import { Mail, Settings, Star } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

import logoGazzella from "@/immagini/Logo-gazzella.jpg";
import healthyMealIcon from "@assets/generated_images/healthy_meal_plate_icon_6cac1eda.png";
import mealPlansIcon from "@assets/generated_images/meal_plans_documents_icon_b817cb31.png";
import nutritionConsultationIcon from "@assets/generated_images/nutrition_consultation_icon_41a7d43d.png";
import userProfileIcon from "@assets/generated_images/user_profile_settings_icon_5794fd86.png";
import recipesIcon from "@assets/generated_images/healthy_recipes_book_icon_8df496c1.png";

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
              alt="Logo La Mia Gazzella - Assistente Nutrizionale Personalizzato per la pianificazione alimentare" 
              className="w-32 h-32 md:w-40 md:h-40 object-contain rounded-full shadow-2xl glass-morphism p-4 animate-float"
              data-testid="hero-logo"
              role="img"
            />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-red-600 via-green-600 to-emerald-600 bg-clip-text text-transparent mb-6 leading-tight" role="banner">
            Il Tuo Assistente
            <br />
            Nutrizionale Personale
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            Pianificazione alimentare avanzata che si adatta al tuo stile di vita, alle tue preferenze alimentari e ai tuoi obiettivi di salute. Ottieni ricette personalizzate e piani nutrizionali in pochi secondi.
          </p>
          {/* Main Action Button - Featured */}
          <div className="mb-12">
            <Link href="/genera-piano" className="group block">
              <Button
                size="lg"
                className="mx-auto w-full max-w-sm bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 hover:from-emerald-600 hover:via-green-600 hover:to-teal-700 text-white font-bold px-8 py-8 rounded-3xl shadow-2xl hover:shadow-emerald-500/25 transform group-hover:scale-110 transition-all duration-500 backdrop-blur-sm border border-white/10 flex flex-col items-center gap-4 animate-pulse"
                data-testid="genera-piano-button"
                aria-label="Genera il tuo piano nutrizionale personalizzato"
              >
                <div className="relative">
                  <img src={healthyMealIcon} alt="Piano nutrizionale" className="h-16 w-16 rounded-2xl shadow-xl group-hover:rotate-3 transition-transform duration-300" />
                  <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full animate-bounce">NEW</div>
                </div>
                <span className="text-white drop-shadow-lg text-lg font-bold">🚀 Genera il Tuo Piano</span>
                <span className="text-emerald-100 text-sm font-medium opacity-90">Piano personalizzato in 30 secondi</span>
              </Button>
            </Link>
          </div>

          {/* Secondary Actions Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Link href="/piani-personalizzati" className="group">
              <div className="relative backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform group-hover:scale-105 group-hover:-translate-y-2">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl shadow-lg">
                    <img src={mealPlansIcon} alt="I miei piani" className="h-10 w-10 rounded-lg group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="text-slate-700 font-bold text-sm">I Miei Piani</span>
                  <span className="text-slate-500 text-xs">Visualizza piani salvati</span>
                </div>
              </div>
            </Link>

            <Link href="/assistente-nutrizionale" className="group">
              <div className="relative backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform group-hover:scale-105 group-hover:-translate-y-2">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-xl shadow-lg">
                    <img src={nutritionConsultationIcon} alt="Consulente nutrizionale" className="h-10 w-10 rounded-lg group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="text-slate-700 font-bold text-sm">Consulente AI</span>
                  <span className="text-slate-500 text-xs">Chat nutrizionale</span>
                </div>
              </div>
            </Link>

            <Link href="/aggiorna-profilo" className="group">
              <div className="relative backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform group-hover:scale-105 group-hover:-translate-y-2">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 p-4 rounded-xl shadow-lg">
                    <img src={userProfileIcon} alt="Il mio profilo" className="h-10 w-10 rounded-lg group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="text-slate-700 font-bold text-sm">Il Mio Profilo</span>
                  <span className="text-slate-500 text-xs">Aggiorna dati personali</span>
                </div>
              </div>
            </Link>

            <Link href="/recipe-generator" className="group">
              <div className="relative backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform group-hover:scale-105 group-hover:-translate-y-2">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-xl shadow-lg">
                    <img src={recipesIcon} alt="Genera ricette" className="h-10 w-10 rounded-lg group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="text-slate-700 font-bold text-sm">Ricette Gazzella</span>
                  <span className="text-slate-500 text-xs">Crea ricette personalizzate</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>





      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Star className="text-secondary text-2xl" />
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
          
          <div className="border-t border-slate-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0">
              <p className="text-slate-400">
                &copy; 2025 La Mia Gazzella. Tutti i diritti riservati.
              </p>
              <div className="flex space-x-6">
                <Link href="/privacy-policy" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
                <Link href="/terms-of-service" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Termini di Servizio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}