import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChefHat, Clock, Users, Star, Search, Filter } from "lucide-react";

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: string;
  cuisine: string;
  dietaryTags: string[];
  imageUrl: string | null;
  rating: number;
  createdAt: string;
}

export default function Recipes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [cuisineFilter, setCuisineFilter] = useState<string>("");

  const { data: recipes, isLoading } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
    retry: false,
  });

  // Filtra le ricette in base ai criteri di ricerca
  const filteredRecipes = recipes?.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = !difficultyFilter || recipe.difficulty === difficultyFilter;
    const matchesCuisine = !cuisineFilter || recipe.cuisine === cuisineFilter;
    
    return matchesSearch && matchesDifficulty && matchesCuisine;
  }) || [];

  if (isLoading) {
    return (
      <div className="pt-24 pb-12 min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Caricamento ricette...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full mb-6">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Le Tue Ricette Gazzella
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Tutte le ricette personalizzate generate secondo il Manuale della Gazzella
          </p>
        </div>

        {/* Filtri e Ricerca */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Cerca ricette..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="search-recipes"
            />
          </div>
          
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger data-testid="filter-difficulty">
              <SelectValue placeholder="Difficoltà" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tutte</SelectItem>
              <SelectItem value="Facile">Facile</SelectItem>
              <SelectItem value="Media">Media</SelectItem>
              <SelectItem value="Difficile">Difficile</SelectItem>
            </SelectContent>
          </Select>

          <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
            <SelectTrigger data-testid="filter-cuisine">
              <SelectValue placeholder="Cucina" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tutte</SelectItem>
              <SelectItem value="italiana">Italiana</SelectItem>
              <SelectItem value="mediterranea">Mediterranea</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm("");
              setDifficultyFilter("");
              setCuisineFilter("");
            }}
            data-testid="clear-filters"
          >
            <Filter className="w-4 h-4 mr-2" />
            Azzera Filtri
          </Button>
        </div>

        {/* Griglia delle Ricette */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-16">
            <ChefHat className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-slate-600 mb-2">
              {recipes?.length === 0 ? "Nessuna ricetta salvata" : "Nessuna ricetta trovata"}
            </h3>
            <p className="text-slate-500 mb-6">
              {recipes?.length === 0 
                ? "Genera la tua prima ricetta personalizzata usando il Generatore Ricette"
                : "Prova a modificare i filtri di ricerca"
              }
            </p>
            {recipes?.length === 0 && (
              <Button onClick={() => window.location.href = "/recipe-generator"} data-testid="goto-recipe-generator">
                <ChefHat className="w-4 h-4 mr-2" />
                Genera Prima Ricetta
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <Card key={recipe.id} className="glass-morphism hover:shadow-xl transition-all duration-300" data-testid={`recipe-card-${recipe.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-slate-800 mb-2 line-clamp-2">
                        {recipe.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {recipe.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-slate-600">{recipe.rating}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Info nutrizionali */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-2 bg-green-50 rounded-lg">
                        <div className="font-semibold text-green-700">{recipe.calories}</div>
                        <div className="text-green-600">Calorie</div>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <div className="font-semibold text-blue-700">{recipe.protein}g</div>
                        <div className="text-blue-600">Proteine</div>
                      </div>
                    </div>

                    {/* Tempi e porzioni */}
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.prepTime + recipe.cookTime} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{recipe.servings} porz.</span>
                      </div>
                      <Badge variant="outline">{recipe.difficulty}</Badge>
                    </div>

                    {/* Tag dietetici */}
                    <div className="flex flex-wrap gap-1">
                      {recipe.dietaryTags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {recipe.dietaryTags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{recipe.dietaryTags.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Azioni */}
                    <div className="pt-2">
                      <Button 
                        className="w-full" 
                        onClick={() => window.location.href = `/recipe/${recipe.id}`}
                        data-testid={`view-recipe-${recipe.id}`}
                      >
                        Visualizza Ricetta
                      </Button>
                    </div>
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