import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Clock, Users, ChefHat, Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { type Recipe } from "@shared/schema";

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: recipe, isLoading, error } = useQuery<Recipe>({
    queryKey: ["/api/recipe", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="glass-morphism rounded-3xl p-8 shadow-2xl">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-full mb-8" />
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <Skeleton className="h-6 w-1/2 mb-4" />
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              </div>
              <div>
                <Skeleton className="h-6 w-1/2 mb-4" />
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/">
            <Button variant="ghost" className="mb-6" data-testid="back-home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla Home
            </Button>
          </Link>
          <div className="glass-morphism rounded-3xl p-8 shadow-2xl border border-red-200">
            <div className="text-center text-red-600">
              <h1 className="text-2xl font-bold mb-4">Ricetta Non Trovata</h1>
              <p>La ricetta richiesta non è stata trovata.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="back-home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna alla Home
          </Button>
        </Link>

        <div className="glass-morphism rounded-3xl overflow-hidden shadow-2xl" data-testid="recipe-detail">
          {/* Recipe Header */}
          <div className="relative bg-gradient-to-br from-secondary/20 to-primary/20 p-8">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="text-9xl">🍽️</div>
            </div>
            <div className="relative">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">{recipe.title}</h1>
              <p className="text-xl text-slate-600 mb-6">{recipe.description}</p>
              
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2 bg-white/30 rounded-full px-4 py-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-semibold">
                    {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-white/30 rounded-full px-4 py-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{recipe.servings} porzioni</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/30 rounded-full px-4 py-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{recipe.difficulty}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/30 rounded-full px-4 py-2">
                  <div className="flex text-accent">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < (recipe.rating || 5) ? "fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{recipe.rating || 5}</span>
                </div>
              </div>

              {/* Dietary Tags */}
              {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {recipe.dietaryTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-white/30">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-8">
            {/* Nutrition Info */}
            <Card className="glass-dark rounded-xl mb-8">
              <CardHeader>
                <CardTitle className="text-slate-800">Informazioni Nutrizionali</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{recipe.calories}</div>
                    <div className="text-sm text-slate-600">Calorie</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">{recipe.protein}g</div>
                    <div className="text-sm text-slate-600">Proteine</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{recipe.carbs}g</div>
                    <div className="text-sm text-slate-600">Carboidrati</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-600">{recipe.fat}g</div>
                    <div className="text-sm text-slate-600">Grassi</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Ingredients */}
              <Card className="glass-dark rounded-xl">
                <CardHeader>
                  <CardTitle className="text-slate-800">Ingredienti</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2" data-testid="ingredients-list">
                    {recipe.ingredients?.map((ingredient, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-primary font-semibold">•</span>
                        <span className="text-slate-700">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card className="glass-dark rounded-xl">
                <CardHeader>
                  <CardTitle className="text-slate-800">Istruzioni</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-4" data-testid="instructions-list">
                    {recipe.instructions?.map((instruction, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-slate-700">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>

            {/* Timing Info */}
            <Card className="glass-dark rounded-xl mt-8">
              <CardHeader>
                <CardTitle className="text-slate-800">Tempi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-slate-700">{recipe.prepTime || 0} min</div>
                    <div className="text-sm text-slate-600">Tempo di Preparazione</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-slate-700">{recipe.cookTime || 0} min</div>
                    <div className="text-sm text-slate-600">Tempo di Cottura</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">
                      {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
                    </div>
                    <div className="text-sm text-slate-600">Tempo Totale</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}