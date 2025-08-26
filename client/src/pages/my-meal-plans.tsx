import { Calendar, Eye, Plus, RefreshCw } from "lucide-react";
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
    queryKey: ["/api/meal-plans", user?.id],
    enabled: isAuthenticated && !!user?.id,
  });

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
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center">
            <img 
              src={logoGazzella} 
              alt="Logo della Gazzella" 
              className="w-20 h-20 object-contain rounded-full shadow-2xl glass-morphism p-2"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent mb-4">
            I Miei Piani Personalizzati
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Tutti i tuoi piani alimentari personalizzati, creati seguendo il protocollo Gazzella per il tuo benessere nutrizionale
          </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mealPlans.map((mealPlan) => (
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
                    {mealPlan.description || "Piano alimentare personalizzato seguendo il protocollo Gazzella"}
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
                  
                  {/* Macronutrienti */}
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
                      Visualizza Piano Completo
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