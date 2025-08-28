import { Mail, Settings, Star } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

import logoGazzella from "@/immagini/Logo-gazzella.jpg";
import healthyMealIcon from "@assets/generated_images/healthy_meal_plate_icon_6cac1eda.png";
import mealPlansIcon from "@assets/generated_images/meal_plans_documents_icon_b817cb31.png";
import nutritionConsultationIcon from "@assets/generated_images/nutrition_consultation_icon_41a7d43d.png";
import userProfileIcon from "@assets/generated_images/user_profile_settings_icon_5794fd86.png";
import recipesIcon from "@assets/generated_images/healthy_recipes_book_icon_8df496c1.png";
import womanBackgroundImage from "@assets/generated_images/Woman_holding_smartphone_background_9710f43b.png";
import confidentWomanImage from "@assets/generated_images/Confident_woman_mirror_reflection_6e752c1d.png";
import cookingHealthyImage from "@assets/generated_images/Woman_cooking_healthy_meal_4c2042a7.png";
import yogaWomanImage from "@assets/generated_images/Woman_doing_yoga_outdoors_47c6ca99.png";
import successMeasurementImage from "@assets/generated_images/Woman_measuring_waist_success_dccecbfe.png";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  
  // Fetch user profile for weight calculation
  const { data: userProfile } = useQuery({
    queryKey: ["/api/user-profiles/current"],
    enabled: !!user,
    retry: false
  });
  
  // Calculate ideal weight if user profile exists
  const calculateIdealWeight = (height: number, age: number): number => {
    let idealWeight = 49 + (1.7 * (height - 152.4) / 2.54);
    if (age > 30) {
      const ageCorrection = (age - 30) * 0.1;
      idealWeight = idealWeight - ageCorrection;
    }
    idealWeight = Math.max(45, Math.min(idealWeight, 70));
    return Math.round(idealWeight * 10) / 10;
  };
  
  // Calculate ideal weight for current user
  const getIdealWeight = () => {
    if (userProfile && (userProfile as any).age && (userProfile as any).height) {
      return calculateIdealWeight((userProfile as any).height, (userProfile as any).age);
    }
    return 65.0; // Default fallback
  };
  
  return (
    <div className="pt-24 pb-12">
      {/* Hero Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="text-center max-w-4xl mx-auto animate-slide-up">
          {/* Logo Image with Background */}
          <div className="mb-8 flex justify-center relative">
            <div 
              className="absolute inset-0 w-80 h-80 mx-auto rounded-3xl opacity-20 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${womanBackgroundImage})`,
                filter: 'blur(2px)',
                zIndex: 0
              }}
            />
            <img 
              src={logoGazzella} 
              alt="Logo La Mia Gazzella - Assistente Nutrizionale Personalizzato per la pianificazione alimentare" 
              className="w-32 h-32 md:w-40 md:h-40 object-contain rounded-full shadow-2xl glass-morphism p-4 animate-float relative z-10"
              data-testid="hero-logo"
              role="img"
            />
          </div>
          
          {/* Personalized Greeting */}
          {user && (
            <div className="mb-6">
              <p className="text-2xl md:text-3xl text-slate-700 font-bold mb-2">
                Ciao {(user as any).firstName || (user as any).email?.split('@')[0]}! 👋
              </p>
              <p className="text-lg text-slate-600 font-medium">
                È ora di riprendere il controllo del tuo corpo e della tua vita
              </p>
            </div>
          )}
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-8 leading-tight" role="banner">
            Ritrova la Tua
            <br />
            <span className="text-emerald-600">Forma Perfetta</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-700 mb-6 leading-relaxed max-w-3xl mx-auto font-medium">
            🌸 <strong>Menopausa non significa rinunciare alla bellezza.</strong> 🌸
          </p>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            Scopri come migliaia di donne over 45 hanno trasformato il loro corpo con il metodo Gazzella. 
            <strong>Piani nutrizionali personalizzati</strong> che rispettano i cambiamenti ormonali e ti aiutano a raggiungere il tuo peso ideale in modo naturale e duraturo.
          </p>
          {/* Ideal Weight Goal Section */}
          <div className="mb-12 p-8 bg-gradient-to-r from-rose-50 to-pink-50 rounded-3xl shadow-lg border border-rose-100">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
                  🏆 Il Tuo Obiettivo di Peso Forma
                </h2>
                <p className="text-lg text-slate-600 mb-6">
                  Basato sulla tua età e altezza, il tuo <strong>peso ideale è il primo passo</strong> verso una nuova versione di te stessa.
                </p>
                <div className="bg-white p-6 rounded-2xl shadow-md">
                  <p className="text-sm text-slate-500 mb-2">Il tuo peso forma ideale:</p>
                  <p className="text-4xl font-bold text-emerald-600 mb-2">{getIdealWeight()} kg</p>
                  <p className="text-sm text-slate-600">
                    {userProfile ? "✨ Calcolato con precisione per il tuo profilo" : "📝 Completa il profilo per un calcolo personalizzato"}
                  </p>
                </div>
              </div>
              <div className="w-64 h-48">
                <img 
                  src={successMeasurementImage} 
                  alt="Donna che misura la vita con successo" 
                  className="w-full h-full object-cover rounded-2xl shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* Main Action Button - Featured */}
          <div className="mb-16">
            <Link href="/genera-piano" className="group block">
              <Button
                size="lg"
                className="mx-auto w-full max-w-lg bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 text-white font-bold px-8 py-10 rounded-3xl shadow-2xl hover:shadow-rose-500/25 transform group-hover:scale-105 transition-all duration-500 backdrop-blur-sm border border-white/10 flex flex-col items-center gap-4"
                data-testid="genera-piano-button"
                aria-label="Inizia la tua trasformazione ora"
              >
                <div className="relative">
                  <img src={healthyMealIcon} alt="Trasformazione nutrizionale" className="h-20 w-20 rounded-2xl shadow-xl group-hover:rotate-3 transition-transform duration-300" />
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full animate-pulse">✨ NUOVA TE</div>
                </div>
                <span className="text-white drop-shadow-lg text-xl font-bold">🔥 INIZIA LA TUA TRASFORMAZIONE</span>
                <span className="text-white drop-shadow-lg text-lg font-semibold">Genera il Tuo Piano Personalizzato</span>
                <span className="text-rose-100 text-base font-medium opacity-90">Piano personalizzato in 30 secondi - Risultati in 21 giorni</span>
              </Button>
            </Link>
          </div>

          {/* Success Stories Section */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-800 mb-12">
              🌟 Le Storie di Successo delle Nostre Gazzelle
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-rose-100">
                <img 
                  src={confidentWomanImage} 
                  alt="Donna sicura di sé" 
                  className="w-full h-48 object-cover rounded-2xl mb-6"
                />
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  💪 Ritrova la Fiducia
                </h3>
                <p className="text-slate-600">
                  "Ho perso 8 kg in 3 mesi e mi sento di nuovo me stessa. La menopausa non mi fa più paura!"
                </p>
              </div>
              
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-emerald-100">
                <img 
                  src={cookingHealthyImage} 
                  alt="Donna che cucina sano" 
                  className="w-full h-48 object-cover rounded-2xl mb-6"
                />
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  🍽️ Cucina con Gioia
                </h3>
                <p className="text-slate-600">
                  "Finalmente ricette gustose che mi aiutano a dimagrire. Non rinuncio più al piacere del cibo!"
                </p>
              </div>
              
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100">
                <img 
                  src={yogaWomanImage} 
                  alt="Donna che fa yoga" 
                  className="w-full h-48 object-cover rounded-2xl mb-6"
                />
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  🧘‍♀️ Energia Ritrovata
                </h3>
                <p className="text-slate-600">
                  "Ho 52 anni e non mi sono mai sentita così energica. Il metabolismo è tornato attivo!"
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Link href="/piani-personalizzati" className="group">
              <div className="relative backdrop-blur-md bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-500 transform group-hover:scale-105 group-hover:-translate-y-2">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl shadow-lg">
                    <img src={mealPlansIcon} alt="I miei piani" className="h-10 w-10 rounded-lg group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="text-slate-700 font-bold text-sm">I Miei Piani</span>
                  <span className="text-slate-500 text-xs">Piani salvati per te</span>
                </div>
              </div>
            </Link>

            <Link href="/assistente-nutrizionale" className="group">
              <div className="relative backdrop-blur-md bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-500 transform group-hover:scale-105 group-hover:-translate-y-2">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-xl shadow-lg">
                    <img src={nutritionConsultationIcon} alt="Consulente nutrizionale" className="h-10 w-10 rounded-lg group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="text-slate-700 font-bold text-sm">Consulente</span>
                  <span className="text-slate-500 text-xs">Supporto nutrizionale</span>
                </div>
              </div>
            </Link>

            <Link href="/aggiorna-profilo" className="group">
              <div className="relative backdrop-blur-md bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200 shadow-xl hover:shadow-2xl transition-all duration-500 transform group-hover:scale-105 group-hover:-translate-y-2">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 p-4 rounded-xl shadow-lg">
                    <img src={userProfileIcon} alt="Il mio profilo" className="h-10 w-10 rounded-lg group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="text-slate-700 font-bold text-sm">Il Mio Profilo</span>
                  <span className="text-slate-500 text-xs">Personalizza tutto</span>
                </div>
              </div>
            </Link>

            <Link href="/recipe-generator" className="group">
              <div className="relative backdrop-blur-md bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 shadow-xl hover:shadow-2xl transition-all duration-500 transform group-hover:scale-105 group-hover:-translate-y-2">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-xl shadow-lg">
                    <img src={recipesIcon} alt="Genera ricette" className="h-10 w-10 rounded-lg group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="text-slate-700 font-bold text-sm">Ricette Magiche</span>
                  <span className="text-slate-500 text-xs">Gustose e dimagranti</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Emotional Call to Action Section */}
      <section className="bg-gradient-to-r from-rose-100 via-pink-50 to-purple-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-8">
            🌸 Non È Mai Troppo Tardi per Essere la Migliore Versione di Te Stessa
          </h2>
          <p className="text-xl text-slate-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            Ogni giorno che passa senza agire è un giorno in meno per goderti il corpo che meriti. 
            <strong>La menopausa è l'inizio di una nuova fase di vita</strong>, non la fine della tua bellezza.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">🔥</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Metabolismo Accelerato</h3>
              <p className="text-slate-600">Riattiva il tuo metabolismo con strategie scientifiche specifiche per la menopausa</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Benessere Ormonale</h3>
              <p className="text-slate-600">Alimenti che supportano l'equilibrio ormonale e riducono i sintomi della menopausa</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Bellezza Radiosa</h3>
              <p className="text-slate-600">Nutri la tua pelle, i tuoi capelli e la tua energia dall'interno con i nutrienti giusti</p>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-2xl mx-auto">
            <p className="text-2xl font-bold text-slate-800 mb-4">
              🏆 Unisciti a più di 10.000 donne che hanno già trasformato la loro vita
            </p>
            <p className="text-lg text-slate-600">
              Il tuo futuro self ti ringrazierà per aver preso questa decisione oggi.
            </p>
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