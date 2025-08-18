import { useQuery } from "@tanstack/react-query";
import { Clock, Users, Heart, Share, BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { type Recipe } from "@shared/schema";

export default function RecipeCards() {
  const { data: recipes, isLoading, error } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Ricette in Evidenza</h2>
          <p className="text-slate-600 text-lg">Ricette dettagliate dal tuo piano alimentare con istruzioni passo-passo</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass-morphism rounded-3xl overflow-hidden shadow-2xl">
              <Skeleton className="w-full h-48" />
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Ricette in Evidenza</h2>
          <p className="text-slate-600 text-lg">Ricette dettagliate dal tuo piano alimentare con istruzioni passo-passo</p>
        </div>
        
        <div className="glass-morphism rounded-3xl p-8 shadow-2xl border border-red-200">
          <div className="text-center text-red-600">
            <p>Nessuna ricetta disponibile al momento. Genera un piano alimentare per vedere ricette personalizzate!</p>
          </div>
        </div>
      </div>
    );
  }

  // If no recipes, show placeholder
  if (!recipes || recipes.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Ricette in Evidenza</h2>
          <p className="text-slate-600 text-lg">Ricette dettagliate dal tuo piano alimentare con istruzioni passo-passo</p>
        </div>
        
        <div className="glass-morphism rounded-3xl p-8 shadow-2xl">
          <div className="text-center">
            <BookOpen className="mx-auto h-16 w-16 text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Nessuna Ricetta Ancora</h3>
            <p className="text-slate-600 mb-6">Genera il tuo primo piano alimentare per scoprire ricette personalizzate su misura per le tue preferenze!</p>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => document.getElementById('meal-plan-form')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="create-first-meal-plan"
            >
              Crea il Tuo Primo Piano Alimentare
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Ricette in Evidenza</h2>
        <p className="text-slate-600 text-lg">Ricette dettagliate dal tuo piano alimentare con istruzioni passo-passo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recipes.slice(0, 6).map((recipe) => (
          <Card
            key={recipe.id}
            className="glass-morphism rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 group hover:scale-105"
            data-testid={`recipe-card-${recipe.id}`}
          >
            {/* Recipe Image Placeholder */}
            <div className="relative overflow-hidden bg-gradient-to-br from-secondary/20 to-primary/20 h-48">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl opacity-30">🍽️</div>
              </div>
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm font-semibold">
                <Clock className="inline mr-1 h-3 w-3" />
                {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
              </div>
              <div className="absolute bottom-4 left-4 bg-secondary/80 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm font-semibold">
                {recipe.calories} kcal
              </div>
            </div>
            
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-2">{recipe.title}</h3>
              <p className="text-slate-600 text-sm mb-4 line-clamp-2">{recipe.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <span className="flex items-center">
                    <Users className="mr-1 h-3 w-3 text-primary" />
                    {recipe.servings} servings
                  </span>
                  {recipe.difficulty && (
                    <Badge variant="outline" className="text-xs">
                      {recipe.difficulty}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center">
                  <div className="flex text-accent">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < (recipe.rating || 5) ? "fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-slate-600 ml-2">{recipe.rating || 5}</span>
                </div>
              </div>

              {/* Dietary Tags */}
              {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {recipe.dietaryTags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h4 className="font-semibold text-slate-700 mb-2 text-sm">Quick Ingredients:</h4>
                <div className="text-xs text-slate-600 space-y-1">
                  {recipe.ingredients?.slice(0, 5).map((ingredient, index) => (
                    <div key={index}>• {ingredient}</div>
                  ))}
                  {recipe.ingredients && recipe.ingredients.length > 5 && (
                    <div className="text-slate-500">... and {recipe.ingredients.length - 5} more</div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <Link href={`/recipe/${recipe.id}`} className="flex-1">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-xl transition-colors duration-300"
                    data-testid={`view-recipe-${recipe.id}`}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Recipe
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="glass-dark hover:bg-white/20 text-slate-700 p-2 rounded-xl transition-colors duration-300"
                  data-testid={`favorite-recipe-${recipe.id}`}
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="glass-dark hover:bg-white/20 text-slate-700 p-2 rounded-xl transition-colors duration-300"
                  data-testid={`share-recipe-${recipe.id}`}
                >
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12">
        <Button
          variant="outline"
          size="lg"
          className="glass-morphism hover:bg-white/20 text-slate-700 font-semibold px-8 py-4 rounded-xl border border-white/30 hover:border-white/50 transition-all duration-300"
          data-testid="view-all-recipes"
        >
          <span>View All Recipes</span>
          <BookOpen className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
