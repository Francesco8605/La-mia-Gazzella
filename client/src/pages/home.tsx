import { Sparkles, Play, User, Calendar, Eye, Plus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import type { MealPlan } from "@shared/schema";

import RecipeCards from "@/components/recipe-cards";
import LoadingStates from "@/components/loading-states";
import logoGazzella from "@/immagini/Logo-gazzella.jpg";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  
  // Fetch user's meal plans if authenticated
  const { data: mealPlans = [], isLoading: isLoadingMealPlans } = useQuery<MealPlan[]>({
    queryKey: ["/api/meal-plans", user?.id],
    enabled: isAuthenticated && !!user?.id,
  });

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
                className="bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                data-testid="personalization-button"
              >
                <User className="mr-2 h-5 w-5" />
                Inizia Personalizzazione
              </Button>
            </Link>
            <Link href="/recipe-generator">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                data-testid="create-meal-plan-button"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Genera Ricette
              </Button>
            </Link>
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

      {/* User's Saved Meal Plans - Show only if authenticated */}
      {isAuthenticated && (
        <section className="container mx-auto px-4 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
              I Tuoi Piani Alimentari
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Accedi rapidamente ai tuoi piani nutrizionali personalizzati
            </p>
          </div>
          
          {isLoadingMealPlans ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="glass-morphism animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-slate-200 rounded mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-slate-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : mealPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mealPlans.slice(0, 6).map((mealPlan) => (
                <Card 
                  key={mealPlan.id} 
                  className="glass-morphism hover:shadow-xl transition-all duration-300 border-0 group"
                  data-testid={`meal-plan-card-${mealPlan.id}`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-red-600 transition-colors">
                        {mealPlan.title || "Piano Personalizzato"}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-red-100 text-red-700">
                        {mealPlan.targetCalories} kcal
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      {mealPlan.description || "Piano alimentare personalizzato basato sui tuoi dati"}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-slate-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {format(new Date(mealPlan.startDate || new Date()), 'dd MMM yyyy', { locale: it })}
                      </div>
                      <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        7 giorni
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                      <div className="text-center p-2 bg-white/50 rounded">
                        <div className="font-semibold text-red-600">{mealPlan.targetProtein}g</div>
                        <div className="text-slate-600">Proteine</div>
                      </div>
                      <div className="text-center p-2 bg-white/50 rounded">
                        <div className="font-semibold text-green-600">{mealPlan.targetCarbs}g</div>
                        <div className="text-slate-600">Carboidrati</div>
                      </div>
                      <div className="text-center p-2 bg-white/50 rounded">
                        <div className="font-semibold text-green-600">{mealPlan.targetFat}g</div>
                        <div className="text-slate-600">Grassi</div>
                      </div>
                    </div>
                    
                    <Link href={`/piano-salvato/${mealPlan.id}`}>
                      <Button 
                        className="w-full bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white"
                        data-testid={`view-meal-plan-${mealPlan.id}`}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizza Piano
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-morphism max-w-md mx-auto text-center">
              <CardContent className="pt-8 pb-8">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Nessun Piano Creato
                </h3>
                <p className="text-slate-600 mb-6">
                  Crea il tuo primo piano alimentare personalizzato per iniziare
                </p>
                <Link href="/genera-piano">
                  <Button className="bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Crea Primo Piano
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>
      )}

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