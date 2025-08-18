import { useQuery } from "@tanstack/react-query";
import { Download, RotateCw, Calendar, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { type MealPlan, type MealPlanDay } from "@shared/schema";

interface MealPlanDisplayProps {
  mealPlanId: string;
}

const mealIcons = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snacks: "🍎",
};

export default function MealPlanDisplay({ mealPlanId }: MealPlanDisplayProps) {
  const { data: mealPlan, isLoading, error } = useQuery<MealPlan>({
    queryKey: ["/api/meal-plan", mealPlanId],
    enabled: !!mealPlanId,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="glass-morphism rounded-3xl p-8 shadow-2xl">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mt-8">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !mealPlan) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="glass-morphism rounded-3xl p-8 shadow-2xl border border-red-200">
          <div className="text-center text-red-600">
            <p>Failed to load meal plan. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('it-IT', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const translateDay = (day: string) => {
    const dayTranslations: Record<string, string> = {
      'Monday': 'Lunedì',
      'Tuesday': 'Martedì', 
      'Wednesday': 'Mercoledì',
      'Thursday': 'Giovedì',
      'Friday': 'Venerdì',
      'Saturday': 'Sabato',
      'Sunday': 'Domenica'
    };
    return dayTranslations[day] || day;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Il Tuo Piano Alimentare Personalizzato</h2>
        <p className="text-slate-600 text-lg">Un piano nutrizionale di 7 giorni su misura per i tuoi obiettivi e preferenze</p>
      </div>

      {/* Weekly Overview */}
      <div className="glass-morphism rounded-3xl p-8 mb-8 shadow-2xl" data-testid="meal-plan-overview">
        <div className="flex flex-col lg:flex-row items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2 flex items-center">
              <Calendar className="mr-2 h-6 w-6 text-primary" />
              {mealPlan.title}
            </h3>
            <p className="text-slate-600 mb-2">{mealPlan.description}</p>
            <div className="flex items-center space-x-4 text-sm">
              <Badge variant="outline" className="flex items-center">
                <Target className="mr-1 h-3 w-3" />
                {mealPlan.targetCalories} calorie
              </Badge>
              <Badge variant="outline">{mealPlan.targetProtein}g proteine</Badge>
              <Badge variant="outline">{mealPlan.targetCarbs}g carboidrati</Badge>
              <Badge variant="outline">{mealPlan.targetFat}g grassi</Badge>
            </div>
          </div>
          <div className="flex space-x-4 mt-4 lg:mt-0">
            <Button
              variant="default"
              className="bg-primary hover:bg-primary/90"
              data-testid="export-meal-plan"
            >
              <Download className="mr-2 h-4 w-4" />
              Esporta
            </Button>
            <Button
              variant="outline"
              className="glass-dark hover:bg-white/20"
              data-testid="regenerate-meal-plan"
            >
              <RotateCw className="mr-2 h-4 w-4" />
              Rigenera
            </Button>
          </div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-4">
          {mealPlan.days?.map((day: MealPlanDay, index: number) => (
            <div
              key={`${day.day}-${index}`}
              className="glass-dark rounded-xl p-4 hover:bg-white/20 transition-all duration-300 group"
              data-testid={`meal-day-${day.day.toLowerCase()}`}
            >
              <div className="text-center mb-4">
                <h4 className="font-bold text-slate-800 text-lg">{translateDay(day.day)}</h4>
                <p className="text-sm text-slate-600">{day.totalCalories} kcal</p>
                {day.date && <p className="text-xs text-slate-500">{formatDate(day.date)}</p>}
              </div>
              
              <div className="space-y-3">
                {/* Breakfast */}
                <div className="bg-white/30 rounded-lg p-3">
                  <h5 className="font-semibold text-slate-700 text-sm mb-1 flex items-center">
                    <span className="mr-2">{mealIcons.breakfast}</span>
                    Colazione
                  </h5>
                  <p className="text-xs text-slate-600" data-testid={`breakfast-${day.day.toLowerCase()}`}>
                    {day.meals.breakfast.name}
                  </p>
                  <p className="text-xs text-slate-500">{day.meals.breakfast.calories} kcal</p>
                </div>
                
                {/* Lunch */}
                <div className="bg-white/30 rounded-lg p-3">
                  <h5 className="font-semibold text-slate-700 text-sm mb-1 flex items-center">
                    <span className="mr-2">{mealIcons.lunch}</span>
                    Pranzo
                  </h5>
                  <p className="text-xs text-slate-600" data-testid={`lunch-${day.day.toLowerCase()}`}>
                    {day.meals.lunch.name}
                  </p>
                  <p className="text-xs text-slate-500">{day.meals.lunch.calories} kcal</p>
                </div>
                
                {/* Dinner */}
                <div className="bg-white/30 rounded-lg p-3">
                  <h5 className="font-semibold text-slate-700 text-sm mb-1 flex items-center">
                    <span className="mr-2">{mealIcons.dinner}</span>
                    Cena
                  </h5>
                  <p className="text-xs text-slate-600" data-testid={`dinner-${day.day.toLowerCase()}`}>
                    {day.meals.dinner.name}
                  </p>
                  <p className="text-xs text-slate-500">{day.meals.dinner.calories} kcal</p>
                </div>
                
                {/* Snacks */}
                {day.meals.snacks?.length > 0 && (
                  <div className="bg-white/30 rounded-lg p-3">
                    <h5 className="font-semibold text-slate-700 text-sm mb-1 flex items-center">
                      <span className="mr-2">{mealIcons.snacks}</span>
                      Spuntini
                    </h5>
                    {day.meals.snacks.map((snack, snackIndex) => (
                      <div key={snackIndex}>
                        <p className="text-xs text-slate-600" data-testid={`snack-${day.day.toLowerCase()}-${snackIndex}`}>
                          {snack.name}
                        </p>
                        <p className="text-xs text-slate-500">{snack.calories} kcal</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
