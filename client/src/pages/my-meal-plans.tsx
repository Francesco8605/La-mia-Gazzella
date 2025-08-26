import { Calendar, Eye, Plus, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import type { MealPlan } from "@shared/schema";
import logoGazzella from "@/immagini/Logo-gazzella.jpg";

export default function MyMealPlans() {
  
  // Fetch all public meal plans
  const { data: mealPlans = [], isLoading, error } = useQuery<MealPlan[]>({
    queryKey: ["/api/meal-plans"],
  });

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
            Piani Alimentari Gazzella
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Tutti i piani alimentari creati seguendo il protocollo Gazzella. Accesso libero e gratuito per tutti.
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
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <RefreshCw className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              Errore nel caricamento
            </h3>
            <p className="text-slate-500 mb-4">
              Non riusciamo a caricare i piani alimentari
            </p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Riprova
            </Button>
          </div>
        ) : mealPlans.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-20 w-20 text-slate-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-slate-600 mb-4">
              Nessun piano creato ancora
            </h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Inizia creando il tuo primo piano alimentare personalizzato seguendo il protocollo Gazzella
            </p>
            <Link href="/genera-piano">
              <Button
                size="lg"
                className="bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Plus className="mr-2 h-5 w-5" />
                Crea il Primo Piano
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mealPlans.map((plan) => (
              <Card key={plan.id} className="glass-morphism hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-800 mb-2">
                    {plan.title || "Piano Alimentare Gazzella"}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {plan.targetCalories && (
                      <Badge variant="secondary" className="text-xs">
                        {plan.targetCalories} kcal
                      </Badge>
                    )}
                    {plan.currentWeight && plan.targetWeight && (
                      <Badge variant="outline" className="text-xs">
                        {plan.currentWeight}kg → {plan.targetWeight}kg
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {plan.description && (
                    <p className="text-slate-600 mb-4 text-sm line-clamp-3">
                      {plan.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {plan.createdAt ? format(new Date(plan.createdAt), "dd MMM yyyy", { locale: it }) : "Data non disponibile"}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/piano-salvato/${plan.id}`} className="flex-1">
                      <Button 
                        size="sm" 
                        className="w-full bg-gradient-to-r from-red-500 to-green-600 hover:from-red-600 hover:to-green-700 text-white"
                        data-testid={`view-plan-${plan.id}`}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizza
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}