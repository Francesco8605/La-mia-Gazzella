import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Clock, Target, Heart, Utensils } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { MealPlanLoading } from "@/components/meal-plan-loading";

export default function MealPlanGenerator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  // Recupera il profilo utente
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["/api/user-profiles", "current"],
    queryFn: async () => {
      const response = await fetch("/api/user-profiles/current", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Profilo non trovato");
      }
      return response.json();
    },
  });

  const generateMealPlanMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/meal-plans/generate", {}, "POST");
    },
    onSuccess: (mealPlan) => {
      toast({
        title: "Piano Alimentare Creato! 🎉",
        description: `Il tuo piano personalizzato è stato salvato. Ti stiamo reindirizzando ai tuoi piani...`,
      });
      
      // Invalida le query per aggiornare la cache
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans"] });
      
      // Reindirizza al piano salvato dopo 2 secondi
      setTimeout(() => {
        window.location.href = `/piani-personalizzati`;
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Errore nella Generazione",
        description: error.message || "Si è verificato un errore durante la creazione del piano alimentare.",
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });

  const handleGenerateMealPlan = () => {
    setIsGenerating(true);
    generateMealPlanMutation.mutate();
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Caricamento profilo...</p>
        </div>
      </div>
    );
  }

  // Mostra componente di caricamento durante la generazione
  if (isGenerating || generateMealPlanMutation.isPending) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <MealPlanLoading />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto">
        <Card className="glass-morphism border-0 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              <Sparkles className="h-16 w-16 text-green-600 animate-pulse" />
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Piano Nutrizionale Personalizzato
            </CardTitle>
            <CardDescription className="text-lg text-slate-600 mt-4">
              Basato sui tuoi dati personali, creiamo un piano alimentare studiato specificamente per te
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {userProfile && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-white/50 rounded-lg backdrop-blur-sm">
                  <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-800">{userProfile.age}</div>
                  <div className="text-sm text-slate-600">anni</div>
                </div>
                
                <div className="text-center p-4 bg-white/50 rounded-lg backdrop-blur-sm">
                  <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-800">{userProfile.weight}</div>
                  <div className="text-sm text-slate-600">kg</div>
                </div>
                
                <div className="text-center p-4 bg-white/50 rounded-lg backdrop-blur-sm">
                  <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-800">{userProfile.weeklyExercise}</div>
                  <div className="text-sm text-slate-600">allenamenti/settimana</div>
                </div>
                
                <div className="text-center p-4 bg-white/50 rounded-lg backdrop-blur-sm">
                  <Utensils className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-lg font-bold text-slate-800">
                    {userProfile.excludedFoods?.length || 0}
                  </div>
                  <div className="text-sm text-slate-600">esclusioni alimentari</div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-slate-800 mb-4 text-center">
                🧬 Cosa Includerà il Tuo Piano Personalizzato:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Colazioni, pranzi e cene bilanciate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Rispetto delle tue preferenze e intolleranze</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Calcolo preciso di calorie e macronutrienti</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Adattato ai tuoi orari dei pasti</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Protocollo nutrizionale Gazzella autentico</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Consigli per la gestione delle voglie</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={handleGenerateMealPlan}
                disabled={isGenerating || generateMealPlanMutation.isPending}
                size="lg"
                className="w-full md:w-auto px-12 py-6 text-xl font-semibold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-generate-meal-plan"
              >
                {isGenerating || generateMealPlanMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Generazione in corso...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Genera il Mio Piano Nutrizionale
                  </>
                )}
              </Button>
            </div>

            <div className="text-center text-sm text-slate-500 mt-6">
              <p>⚡ La generazione richiede circa 30-60 secondi</p>
              <p>🤖 Powered by OpenAI GPT-4o e protocollo Nutrizionista Gazzella</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}