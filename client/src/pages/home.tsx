import { Mail, Settings, Star, Crown, Leaf, Lock, ArrowRight, LogOut } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
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
import formulaGazzellaImage from "@assets/PRODOTTO_formulagazzella_-formatoQUADRATO_1758271113849.webp";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const { hasActiveSubscription, isInTrial } = useSubscription();
  
  // Determina se l'utente può accedere all'offerta (solo premium, non trial)
  const canAccessOffer = hasActiveSubscription && !isInTrial;
  
  // Fetch user profile for weight calculation
  const { data: userProfile } = useQuery({
    queryKey: ["/api/user-profiles/current"],
    enabled: !!user,
    retry: false
  });

  // Fetch user's latest meal plan for AI summary
  const { data: mealPlans } = useQuery<any[]>({
    queryKey: ["/api/meal-plans"],
    enabled: !!user,
    retry: false
  });
  
  // Get the most recent meal plan with AI summary
  const latestPlan = mealPlans && mealPlans.length > 0 
    ? mealPlans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;
  
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
                backgroundImage: `url(${String(womanBackgroundImage)})`,
                filter: 'blur(2px)',
                zIndex: 0
              }}
            />
            <img 
              src={String(logoGazzella)} 
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
                  src={String(successMeasurementImage)} 
                  alt="Donna che misura la vita con successo" 
                  className="w-full h-full object-cover rounded-2xl shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* Main Action Button - Featured - Ottimizzato per Mobile */}
          <div className="mb-16 md:mb-16 pb-6 md:pb-0 relative px-2 md:px-4">
            {/* Decorative background glow - Più prominente su mobile */}
            <div className="absolute inset-0 bg-gradient-to-r from-rose-300/30 via-pink-300/30 to-purple-300/30 blur-xl md:blur-3xl rounded-full transform scale-125 pointer-events-none"></div>
            
            <Button
              asChild
              size="lg"
              className="mx-auto w-full max-w-lg md:max-w-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 text-white font-bold px-8 md:px-12 py-10 md:py-12 rounded-3xl shadow-2xl hover:shadow-rose-500/50 transform hover:scale-105 transition-all duration-500 md:duration-700 backdrop-blur-sm border-2 border-white/30 flex flex-col items-center gap-6 md:gap-6 relative overflow-hidden min-h-[220px] md:min-h-[280px] active:scale-95 touch-manipulation group"
            >
              <Link 
                href="/genera-piano" 
                className="flex flex-col items-center gap-6 w-full h-full"
                data-testid="genera-piano-button"
                aria-label="Inizia la tua trasformazione ora"
              >
                {/* Animated background shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {/* Icon section with enhanced styling - Più grande su mobile */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/40 to-orange-300/40 rounded-3xl blur-xl scale-110 pointer-events-none"></div>
                  <img src={String(healthyMealIcon)} alt="Trasformazione nutrizionale" className="relative h-20 w-20 md:h-24 md:w-24 rounded-3xl shadow-2xl group-hover:rotate-6 group-hover:scale-110 transition-all duration-500" />
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-sm font-black px-3 py-2 rounded-full animate-bounce shadow-xl border-2 border-white/20">
                    ✨ NUOVA TE
                  </div>
                </div>
                
                {/* Text content with improved hierarchy - Più leggibile su mobile */}
                <div className="text-center space-y-3">
                  <div className="text-xl md:text-3xl font-black tracking-wide drop-shadow-xl leading-tight">
                    🔥 INIZIA LA TUA TRASFORMAZIONE
                  </div>
                  <div className="text-lg md:text-2xl font-bold text-yellow-100 drop-shadow-lg leading-tight">
                    Genera il Tuo Piano Personalizzato
                  </div>
                  <div className="bg-white/15 backdrop-blur-md rounded-2xl px-6 py-3 mt-4 border border-white/20">
                    <div className="text-white font-bold text-base md:text-lg">Piano in 30 secondi</div>
                    <div className="text-rose-100 text-sm md:text-base font-medium">Risultati visibili in 21 giorni</div>
                  </div>
                </div>
                
                {/* Mobile sparkle animations - Visibili anche su mobile */}
                <div className="absolute top-3 right-3 md:top-4 md:right-4 text-yellow-300 animate-pulse text-xl md:text-2xl pointer-events-none">✨</div>
                <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 text-yellow-300 animate-pulse text-lg md:text-xl delay-300 pointer-events-none">💫</div>
                <div className="absolute top-1/2 right-6 md:right-8 text-yellow-300 animate-pulse text-base md:text-lg delay-700 pointer-events-none">⭐</div>
                
                {/* Pulse ring animation - Nuovo effetto per mobile */}
                <div className="absolute inset-0 rounded-3xl border-2 border-white/20 animate-pulse pointer-events-none"></div>
              </Link>
            </Button>
            
            {/* Mobile-specific urgency indicator */}
            <div className="block md:hidden absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-bounce pointer-events-none">
              👆 TOCCA ORA - TRASFORMA LA TUA VITA
            </div>
          </div>

          {/* Formula Gazzella Offer Section */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-3xl p-8 md:p-12 shadow-2xl border border-emerald-200 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img 
                      src={String(formulaGazzellaImage)} 
                      alt="Formula Gazzella - Acceleratore del Metabolismo per Menopausa" 
                      className="w-32 h-32 md:w-48 md:h-48 object-contain rounded-2xl shadow-lg"
                      data-testid="img-formula-gazzella-home"
                    />
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse shadow-lg">
                      SOLO 20€
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start mb-4">
                    <Crown className="h-8 w-8 text-emerald-600 mr-3" />
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                      💎 Offerta Esclusiva Formula Gazzella
                    </h2>
                  </div>
                  
                  <p className="text-lg text-slate-700 mb-4 leading-relaxed">
                    L'integratore naturale studiato per accelerare il metabolismo durante la menopausa. 
                    {canAccessOffer 
                      ? <span className="font-bold text-emerald-600"> Sul sito costa 49€, per te solo 20€ - risparmi 29€!</span>
                      : <span className="font-bold text-amber-600"> Disponibile per abbonati Premium</span>
                    }
                  </p>

                  {/* Price Comparison - Visible only for premium users */}
                  {canAccessOffer && (
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 mb-4 border-2 border-emerald-200">
                      <div className="flex items-center justify-center md:justify-start gap-4">
                        <div className="text-center">
                          <div className="text-slate-400 line-through text-sm">Prezzo normale</div>
                          <div className="text-slate-500 line-through text-xl font-bold">49€</div>
                        </div>
                        <div className="text-emerald-600 text-2xl">→</div>
                        <div className="text-center">
                          <div className="text-emerald-700 text-sm font-semibold">Prezzo per te</div>
                          <div className="text-emerald-600 text-3xl font-bold">20€</div>
                        </div>
                        <div className="ml-auto bg-red-500 text-white px-3 py-2 rounded-lg">
                          <div className="text-xs font-semibold">RISPARMI</div>
                          <div className="text-lg font-bold">29€</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-slate-600">
                      <div className="flex items-center">
                        <Leaf className="h-4 w-4 text-emerald-500 mr-2" />
                        85% principi attivi
                      </div>
                      <div className="flex items-center">
                        <Leaf className="h-4 w-4 text-emerald-500 mr-2" />
                        100% naturale
                      </div>
                      <div className="flex items-center">
                        <Leaf className="h-4 w-4 text-emerald-500 mr-2" />
                        Specifico per menopausa
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link href="/offerta-esclusiva" className="group inline-block">
                    <Button
                      className={`px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 min-h-[48px] ${
                        canAccessOffer 
                          ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                          : "bg-gradient-to-r from-gray-400 to-gray-500 text-gray-200 cursor-not-allowed"
                      }`}
                      data-testid="button-formula-gazzella-home"
                    >
                      {canAccessOffer ? (
                        <Crown className="h-5 w-5 mr-2" />
                      ) : (
                        <Lock className="h-5 w-5 mr-2" />
                      )}
                      <span className="mr-2">
                        {canAccessOffer ? "Scopri l'Offerta Esclusiva" : "Solo per Premium"}
                      </span>
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>

                  {/* Trial User Message */}
                  {!canAccessOffer && (
                    <p className="text-sm text-amber-600 mt-3 font-medium">
                      Passa a Premium per accedere all'offerta esclusiva Formula Gazzella
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Link href="/piani-personalizzati" className="group">
              <div className="relative backdrop-blur-md bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-500 transform group-hover:scale-105 group-hover:-translate-y-2">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl shadow-lg">
                    <img src={String(mealPlansIcon)} alt="I miei piani" className="h-10 w-10 rounded-lg group-hover:scale-110 transition-transform duration-300" />
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
                    <img src={String(nutritionConsultationIcon)} alt="Consulente nutrizionale" className="h-10 w-10 rounded-lg group-hover:scale-110 transition-transform duration-300" />
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
                    <img src={String(userProfileIcon)} alt="Il mio profilo" className="h-10 w-10 rounded-lg group-hover:scale-110 transition-transform duration-300" />
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
                    <img src={String(recipesIcon)} alt="Genera ricette" className="h-10 w-10 rounded-lg group-hover:scale-110 transition-transform duration-300" />
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
            <div className="flex flex-col sm:flex-row justify-center gap-4">
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
              
              <Button
                onClick={async () => {
                  try {
                    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                    window.location.reload();
                  } catch (error) {
                    console.error("Logout error:", error);
                    window.location.reload();
                  }
                }}
                variant="outline"
                className="bg-red-600/20 border-red-300/30 text-white hover:bg-red-600/30 hover:border-red-300/50 font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                data-testid="footer-logout-button"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Esci dall'App
              </Button>
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