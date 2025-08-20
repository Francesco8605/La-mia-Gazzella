import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, RefreshCw, Calendar, Target, Scale } from "lucide-react";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import type { MealPlan } from "@shared/schema";

export default function SavedMealPlan() {
  const [match, params] = useRoute("/piano-salvato/:id");
  const mealPlanId = params?.id;

  const { data: mealPlan, isLoading, error } = useQuery<MealPlan>({
    queryKey: ["/api/meal-plan", mealPlanId],
    enabled: !!mealPlanId,
  });

  if (!match) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-pink-600" />
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Caricamento del tuo piano alimentare...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !mealPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <Scale className="h-12 w-12 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Piano non trovato
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Il piano alimentare richiesto non esiste o non è più disponibile.
              </p>
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Torna alla Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const dayNames = {
    monday: "Lunedì",
    tuesday: "Martedì", 
    wednesday: "Mercoledì",
    thursday: "Giovedì",
    friday: "Venerdì",
    saturday: "Sabato",
    sunday: "Domenica"
  };

  const mealNames = {
    breakfast: "Colazione",
    lunch: "Pranzo",
    dinner: "Cena",
    snacks: "Spuntini"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Torna alla Home
              </Button>
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Il Tuo Piano Gazzella
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              Piano alimentare personalizzato salvato il {mealPlan.createdAt ? format(new Date(mealPlan.createdAt), 'dd MMMM yyyy', { locale: it }) : 'oggi'}
            </p>
          </div>

          {/* Update Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/aggiorna-profilo">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                data-testid="button-update-profile"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Aggiorna i tuoi dati
              </Button>
            </Link>
          </div>
        </div>

        {/* Client Profile & Diet Info */}
        {(mealPlan.currentWeight || mealPlan.currentBmi || mealPlan.dietMethod) && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Client Profile */}
            {(mealPlan.currentWeight || mealPlan.currentBmi) && (
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <Target className="w-5 h-5 mr-2 text-green-600" />
                    Profilo Personalizzato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {mealPlan.currentWeight && (
                      <div className="text-center p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Peso Attuale</p>
                        <p className="text-xl font-bold text-green-600">{mealPlan.currentWeight}kg</p>
                      </div>
                    )}
                    {mealPlan.targetWeight && (
                      <div className="text-center p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Obiettivo</p>
                        <p className="text-xl font-bold text-blue-600">{mealPlan.targetWeight}kg</p>
                      </div>
                    )}
                    {mealPlan.currentBmi && (
                      <div className="text-center p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">BMI Attuale</p>
                        <p className="text-xl font-bold text-purple-600">{mealPlan.currentBmi}</p>
                      </div>
                    )}
                    {mealPlan.weightToLose && (
                      <div className="text-center p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Da Perdere</p>
                        <p className="text-xl font-bold text-orange-600">{mealPlan.weightToLose}kg</p>
                      </div>
                    )}
                  </div>
                  {mealPlan.bmiCategory && (
                    <div className="text-center">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        {mealPlan.bmiCategory}
                      </Badge>
                    </div>
                  )}
                  {mealPlan.timeToGoal && (
                    <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">⏱️ {mealPlan.timeToGoal}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Diet Explanation */}
            {(mealPlan.dietMethod || mealPlan.expectedResults) && (
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <Scale className="w-5 h-5 mr-2 text-amber-600" />
                    Metodo Gazzella
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mealPlan.dietMethod && (
                    <p className="text-gray-700 dark:text-gray-300 font-medium">{mealPlan.dietMethod}</p>
                  )}
                  {mealPlan.dietPrinciples && Array.isArray(mealPlan.dietPrinciples) && mealPlan.dietPrinciples.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">Principi:</p>
                      <ul className="space-y-1">
                        {mealPlan.dietPrinciples.slice(0, 3).map((principle, index) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                            <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {principle}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {mealPlan.expectedResults && (
                    <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Risultati Attesi:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{mealPlan.expectedResults}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Plan Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-gray-900 dark:text-white">
                <Target className="w-5 h-5 mr-2 text-pink-600" />
                Obiettivo Calorico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-600">
                {mealPlan.targetCalories}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">kcal/giorno</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-gray-900 dark:text-white">
                <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                Durata Piano
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">7</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">giorni</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-gray-900 dark:text-white">
                <Scale className="w-5 h-5 mr-2 text-green-600" />
                Macronutrienti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Proteine</span>
                  <span className="font-semibold text-green-600">{mealPlan.targetProtein}g</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Carboidrati</span>
                  <span className="font-semibold text-blue-600">{mealPlan.targetCarbs}g</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Grassi</span>
                  <span className="font-semibold text-orange-600">{mealPlan.targetFat}g</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Meal Plans */}
        <div className="space-y-8">
          {mealPlan.days?.map((day, index) => (
            <Card key={`${day.day}-${index}`} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-gray-900 dark:text-white">
                    {dayNames[day.day.toLowerCase() as keyof typeof dayNames]} - Giorno {index + 1}
                  </CardTitle>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {day.totalCalories} kcal
                  </Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {format(parseISO(day.date), 'dd MMMM yyyy', { locale: it })}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {/* Breakfast */}
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
                      {mealNames.breakfast}
                    </h4>
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                      <p className="text-gray-800 dark:text-gray-200 mb-2" data-testid={`meal-breakfast-${index}`}>
                        {day.meals.breakfast.name}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <span>{day.meals.breakfast.calories} kcal</span>
                        <span>P: {day.meals.breakfast.protein}g</span>
                        <span>C: {day.meals.breakfast.carbs}g</span>
                        <span>G: {day.meals.breakfast.fat}g</span>
                      </div>
                    </div>
                  </div>

                  {/* Snacks */}
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
                      Spuntino Mattino
                    </h4>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <p className="text-gray-800 dark:text-gray-200 mb-2" data-testid={`snack-morning-${index}`}>
                        {day.meals.snacks[0]?.name}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <span>{day.meals.snacks[0]?.calories} kcal</span>
                        <span>P: {day.meals.snacks[0]?.protein}g</span>
                        <span>C: {day.meals.snacks[0]?.carbs}g</span>
                        <span>G: {day.meals.snacks[0]?.fat}g</span>
                      </div>
                    </div>
                  </div>

                  {/* Lunch */}
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
                      {mealNames.lunch}
                    </h4>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <p className="text-gray-800 dark:text-gray-200 mb-2" data-testid={`meal-lunch-${index}`}>
                        {day.meals.lunch.name}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <span>{day.meals.lunch.calories} kcal</span>
                        <span>P: {day.meals.lunch.protein}g</span>
                        <span>C: {day.meals.lunch.carbs}g</span>
                        <span>G: {day.meals.lunch.fat}g</span>
                      </div>
                    </div>
                  </div>

                  {/* Afternoon Snack */}
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
                      Merenda Pomeriggio
                    </h4>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <p className="text-gray-800 dark:text-gray-200 mb-2" data-testid={`snack-afternoon-${index}`}>
                        {day.meals.snacks[1]?.name}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <span>{day.meals.snacks[1]?.calories} kcal</span>
                        <span>P: {day.meals.snacks[1]?.protein}g</span>
                        <span>C: {day.meals.snacks[1]?.carbs}g</span>
                        <span>G: {day.meals.snacks[1]?.fat}g</span>
                      </div>
                    </div>
                  </div>

                  {/* Dinner */}
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
                      {mealNames.dinner}
                    </h4>
                    <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
                      <p className="text-gray-800 dark:text-gray-200 mb-2" data-testid={`meal-dinner-${index}`}>
                        {day.meals.dinner.name}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <span>{day.meals.dinner.calories} kcal</span>
                        <span>P: {day.meals.dinner.protein}g</span>
                        <span>C: {day.meals.dinner.carbs}g</span>
                        <span>G: {day.meals.dinner.fat}g</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link href="/aggiorna-profilo">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              data-testid="button-update-profile-bottom"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Aggiorna i tuoi dati
            </Button>
          </Link>
          
          <Link href="/genera-piano">
            <Button 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto"
              data-testid="button-generate-new-plan"
            >
              <Target className="w-5 h-5 mr-2" />
              Genera nuovo piano
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}