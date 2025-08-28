import { Calendar, Eye, Plus, RefreshCw, Clock, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import type { MealPlan } from "@shared/schema";
import logoGazzella from "@/immagini/Logo-gazzella.jpg";

export default function MyMealPlans() {
  const { user, isAuthenticated } = useAuth();
  
  // Fetch user's meal plans
  const { data: mealPlans = [], isLoading, error } = useQuery<MealPlan[]>({
    queryKey: ["/api/meal-plans/user"],
    enabled: isAuthenticated,
  });

  // Sort meal plans by creation date (most recent first)
  const sortedMealPlans = mealPlans.sort((a, b) => {
    const dateA = new Date(a.createdAt || a.startDate || new Date());
    const dateB = new Date(b.createdAt || b.startDate || new Date());
    return dateB.getTime() - dateA.getTime();
  });

  // Group meal plans by time periods
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const groupedPlans = {
    today: sortedMealPlans.filter(plan => {
      const planDate = new Date(plan.createdAt || plan.startDate || new Date());
      return planDate >= today;
    }),
    yesterday: sortedMealPlans.filter(plan => {
      const planDate = new Date(plan.createdAt || plan.startDate || new Date());
      return planDate >= yesterday && planDate < today;
    }),
    thisWeek: sortedMealPlans.filter(plan => {
      const planDate = new Date(plan.createdAt || plan.startDate || new Date());
      return planDate >= thisWeek && planDate < yesterday;
    }),
    older: sortedMealPlans.filter(plan => {
      const planDate = new Date(plan.createdAt || plan.startDate || new Date());
      return planDate < thisWeek;
    })
  };

  const renderPlanGroup = (title: string, plans: MealPlan[], icon: React.ReactNode, gradient: string) => {
    if (plans.length === 0) return null;
    
    return (
      <div className="mb-12">
        <div className={`flex items-center gap-3 mb-6 pb-3 border-b-2 ${gradient}`}>
          <div className={`p-2 rounded-xl bg-gradient-to-r ${gradient}`}>
            {icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
            <p className="text-sm text-slate-500">{plans.length} piano{plans.length !== 1 ? 'i' : ''}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((mealPlan) => renderMealPlanCard(mealPlan))}
        </div>
      </div>
    );
  };

  const renderMealPlanCard = (mealPlan: MealPlan) => {
    const createdDate = new Date(mealPlan.createdAt || mealPlan.startDate || new Date());
    const isRecent = (new Date().getTime() - createdDate.getTime()) < 24 * 60 * 60 * 1000;
    
    return (
      <Card 
        key={mealPlan.id} 
        className={`backdrop-blur-md bg-white/20 border border-white/30 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 group relative overflow-hidden ${isRecent ? 'ring-2 ring-emerald-500/50' : ''}`}
        data-testid={`meal-plan-card-${mealPlan.id}`}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10 group-hover:from-emerald-500/20 group-hover:via-green-500/10 group-hover:to-teal-500/20 transition-all duration-500" />
        
        {/* New Badge for Recent Plans */}
        {isRecent && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse">
              <Sparkles className="w-3 h-3 mr-1" />
              NUOVO
            </Badge>
          </div>
        )}
        
        <CardHeader className="pb-4 relative z-10">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-emerald-600 transition-colors leading-tight">
              {mealPlan.title || "Piano Personalizzato"}
            </CardTitle>
            <Badge variant="secondary" className="bg-gradient-to-r from-red-100 to-pink-100 text-red-700 font-semibold">
              {mealPlan.targetCalories} kcal
            </Badge>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mt-2">
            {mealPlan.description?.slice(0, 100) || "Piano alimentare personalizzato seguendo il protocollo Gazzella"}...
          </p>
        </CardHeader>
        
        <CardContent className="pt-0 relative z-10">
          {/* Date and Time Info */}
          <div className="flex items-center justify-between mb-4 p-3 bg-white/30 rounded-xl">
            <div className="flex items-center text-sm text-slate-600">
              <Calendar className="w-4 h-4 mr-2 text-emerald-600" />
              <span className="font-medium">{format(createdDate, 'dd MMM yyyy', { locale: it })}</span>
            </div>
            <div className="flex items-center text-xs text-slate-500">
              <Clock className="w-3 h-3 mr-1" />
              {format(createdDate, 'HH:mm')}
            </div>
          </div>
          
          {/* Enhanced Macronutrients */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200/50">
              <div className="font-bold text-red-600 text-lg">{mealPlan.targetProtein}g</div>
              <div className="text-red-700 text-xs font-medium">Proteine</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200/50">
              <div className="font-bold text-green-600 text-lg">{mealPlan.targetCarbs}g</div>
              <div className="text-green-700 text-xs font-medium">Carboidrati</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200/50">
              <div className="font-bold text-blue-600 text-lg">{mealPlan.targetFat}g</div>
              <div className="text-blue-700 text-xs font-medium">Grassi</div>
            </div>
          </div>
          
          <Link href={`/piano-salvato/${mealPlan.id}`}>
            <Button 
              className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 hover:from-emerald-600 hover:via-green-600 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-xl"
              data-testid={`view-meal-plan-${mealPlan.id}`}
            >
              <Eye className="w-4 h-4 mr-2" />
              Visualizza Piano Completo
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Accesso Richiesto
          </h2>
          <p className="text-slate-600 mb-6">
            Devi effettuare l'accesso per visualizzare i tuoi piani personalizzati
          </p>
          <Link href="/auth">
            <Button className="bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white">
              Accedi
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-emerald-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <img 
                src={logoGazzella} 
                alt="Logo della Gazzella" 
                className="w-24 h-24 object-contain rounded-full shadow-2xl backdrop-blur-md bg-white/30 p-3 animate-float"
              />
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                {mealPlans.length}
              </div>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-emerald-600 via-green-500 to-teal-600 bg-clip-text text-transparent mb-6 leading-tight">
            I Miei Piani
            <br className="md:hidden" />
            <span className="text-4xl md:text-6xl">Personalizzati</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed mb-4">
            La tua collezione di piani alimentari personalizzati, <strong>organizzati cronologicamente</strong> per il tuo benessere nutrizionale
          </p>
          <div className="flex items-center justify-center gap-2 text-emerald-600">
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">Ordinati per data e ora di creazione</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link href="/genera-piano">
            <Button
              size="lg"
              className="bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              data-testid="create-new-plan-button"
            >
              <Plus className="mr-2 h-5 w-5" />
              Crea Nuovo Piano
            </Button>
          </Link>
        </div>

        {/* Meal Plans Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="glass-morphism animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-200 rounded"></div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-12 bg-slate-200 rounded"></div>
                      <div className="h-12 bg-slate-200 rounded"></div>
                      <div className="h-12 bg-slate-200 rounded"></div>
                    </div>
                    <div className="h-10 bg-slate-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="glass-morphism max-w-md mx-auto text-center">
            <CardContent className="pt-8 pb-8">
              <div className="text-red-500 mb-4">
                <RefreshCw className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Errore di Caricamento
              </h3>
              <p className="text-slate-600 mb-6">
                Impossibile caricare i tuoi piani. Riprova più tardi.
              </p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Riprova
              </Button>
            </CardContent>
          </Card>
        ) : mealPlans.length > 0 ? (
          <div>
            {renderPlanGroup(
              "Oggi", 
              groupedPlans.today, 
              <Sparkles className="w-5 h-5 text-white" />, 
              "from-emerald-500 to-green-600 border-emerald-200"
            )}
            {renderPlanGroup(
              "Ieri", 
              groupedPlans.yesterday, 
              <Clock className="w-5 h-5 text-white" />, 
              "from-blue-500 to-indigo-600 border-blue-200"
            )}
            {renderPlanGroup(
              "Questa Settimana", 
              groupedPlans.thisWeek, 
              <Calendar className="w-5 h-5 text-white" />, 
              "from-purple-500 to-pink-600 border-purple-200"
            )}
            {renderPlanGroup(
              "Più Vecchi", 
              groupedPlans.older, 
              <TrendingUp className="w-5 h-5 text-white" />, 
              "from-amber-500 to-orange-600 border-amber-200"
            )}
          </div>
        ) : (
          <Card className="glass-morphism max-w-md mx-auto text-center">
            <CardContent className="pt-8 pb-8">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Nessun Piano Creato
              </h3>
              <p className="text-slate-600 mb-6">
                Crea il tuo primo piano alimentare personalizzato seguendo il protocollo Gazzella
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
      </div>
    </div>
  );
}