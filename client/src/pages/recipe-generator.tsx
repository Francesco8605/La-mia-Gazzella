import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChefHat, Clock, Users, Utensils, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Schema semplificato per le ricette - richiede solo il tipo di piatto
const recipeFormSchema = z.object({
  dishType: z.enum(["primo", "secondo"], { required_error: "Seleziona tipo di piatto" }),
  meatOrFish: z.enum(["carne", "pesce", "uova"], { required_error: "Seleziona base del piatto" }),
  difficulty: z.enum(["facile", "media", "difficile"], { required_error: "Seleziona difficoltà" }),
  preferredProteins: z.string().min(1, "Specifica le proteine preferite"),
  preferredFish: z.string().optional(),
  foodIntolerances: z.string().optional(),
  excludedFoods: z.string().optional(),
});

// Schema per i dati mancanti nel popup
const quickProfileSchema = z.object({
  age: z.number().min(18, "Età minima 18 anni").max(100, "Età massima 100 anni"),
  currentWeight: z.number().min(30, "Peso minimo 30kg").max(200, "Peso massimo 200kg"),
  height: z.number().min(120, "Altezza minima 120cm").max(220, "Altezza massima 220cm"),
});

type RecipeFormData = z.infer<typeof recipeFormSchema>;
type QuickProfileData = z.infer<typeof quickProfileSchema>;

interface GeneratedRecipe {
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
}

// Helper function to detect mobile devices
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(navigator.userAgent);
};

export default function RecipeGenerator() {
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null);
  const [showQuickProfileDialog, setShowQuickProfileDialog] = useState(false);
  const [pendingRecipeData, setPendingRecipeData] = useState<RecipeFormData | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const { toast } = useToast();

  // Check for mobile device and enable fallback if needed
  useEffect(() => {
    const isMobile = isMobileDevice();
    const userAgent = navigator.userAgent;
    
    // Extended detection for all Xiaomi device variants including Redmi 15 Pro
    const isXiaomi = /MIUI|Redmi|Xiaomi|Mi\s|HyperOS/i.test(userAgent);
    const isBrowser = /Chrome|WebView|MiuiBrowser/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    
    console.log("🔍 Recipe Generator - DEVICE DEBUG:");
    console.log("User Agent:", userAgent);
    console.log("Is Mobile:", isMobile);
    console.log("Is Android:", isAndroid);
    console.log("Is Xiaomi (extended):", isXiaomi);
    console.log("Browser detected:", isBrowser);
    
    // Precise detection for Xiaomi/MIUI devices with compatibility issues
    const shouldUseFallback = (
      (isMobile && isXiaomi) ||
      (isAndroid && isXiaomi) ||
      userAgent.includes('MIUI') || 
      userAgent.includes('Redmi') || 
      userAgent.includes('Xiaomi') ||
      userAgent.includes('HyperOS') ||
      userAgent.includes('Mi ') ||
      // Specific problematic browsers on Xiaomi devices
      (isAndroid && /MiuiBrowser|XiaoMi/i.test(userAgent))
    );
    
    if (shouldUseFallback) {
      console.log("🚨 Recipe Generator - ENABLING FALLBACK MODE for device compatibility");
      console.log("Detected device type: Xiaomi/MIUI/Redmi/HyperOS");
      setUseFallback(true);
    } else {
      console.log("✅ Recipe Generator - Using standard UI components");
    }
  }, []);

  // Controlla se esistono piani personalizzati salvati
  const { data: mealPlans, isLoading: mealPlansLoading } = useQuery({
    queryKey: ["/api/meal-plans/user"],
    retry: false,
  });

  // Controlla se esiste un profilo utente
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/user-profiles/current"],
    retry: false,
  });

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      dishType: "secondo",
      meatOrFish: "pesce",
      difficulty: "facile",
      preferredProteins: "",
      preferredFish: "",
      foodIntolerances: "",
      excludedFoods: "",
    },
  });

  const quickProfileForm = useForm<QuickProfileData>({
    resolver: zodResolver(quickProfileSchema),
    defaultValues: {
      age: 45,
      currentWeight: 70,
      height: 165,
    },
  });

  const generateRecipeMutation = useMutation({
    mutationFn: async (recipeData: RecipeFormData) => {
      // Semplice: sempre usiamo dati di default per ora
      const clientProfile = {
        eta: 45,
        peso: 70,
        altezza: 165,
        pesoObbiettivo: 65,
      };

      const proteinType = recipeData.meatOrFish === "carne" ? "carne" : 
                         recipeData.meatOrFish === "pesce" ? "pesce" : "uova";

      const recipeRequest = {
        mealName: `${recipeData.dishType === "primo" ? "Primo piatto" : "Secondo piatto"} a base di ${proteinType}`,
        dietaryPreferences: [
          "menopausa",
          "no legumi",
          "no latticini", 
          "no affettati",
          "no ultra-processati"
        ],
        targetCalories: recipeData.dishType === "primo" ? 400 : 350,
        allergies: recipeData.foodIntolerances ? recipeData.foodIntolerances.split(",").map(s => s.trim()) : [],
        cuisine: "italiana",
        difficulty: recipeData.difficulty,
        clientProfile: clientProfile,
        recipePreferences: {
          preferredProteins: recipeData.preferredProteins,
          preferredFish: recipeData.preferredFish || "",
          meatOrFish: recipeData.meatOrFish,
          excludedFoods: recipeData.excludedFoods || "",
          additionalDetails: ""
        }
      };

      console.log("Sending recipe request:", JSON.stringify(recipeRequest, null, 2));
      return apiRequest("/api/recipes/generate-gazzella", recipeRequest);
    },
    onSuccess: (recipe: GeneratedRecipe) => {
      setGeneratedRecipe(recipe);
      setShowQuickProfileDialog(false);
      setPendingRecipeData(null);
      
      // Invalida la cache delle ricette per aggiornare la pagina "Ricette"
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      
      toast({
        title: "Ricetta Generata e Salvata!",
        description: "La tua ricetta personalizzata è stata salvata nella pagina Ricette.",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore nella generazione della ricetta",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RecipeFormData) => {
    generateRecipeMutation.mutate(data);
  };

  const onQuickProfileSubmit = (userData: QuickProfileData) => {
    if (pendingRecipeData) {
      generateRecipeMutation.mutate(pendingRecipeData);
    }
  };

  if (mealPlansLoading || profileLoading) {
    return (
      <div className="pt-24 pb-12 min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Caricamento...</p>
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
            Generatore Ricette Gazzella
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Crea ricette personalizzate secondo il Manuale della Gazzella per la menopausa
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Informazioni per la Ricetta
              </CardTitle>
              <CardDescription>
                {Array.isArray(mealPlans) && mealPlans.length > 0 
                  ? "Genereremo una ricetta usando i dati del tuo piano personalizzato esistente"
                  : userProfile && typeof userProfile === 'object' && 'age' in userProfile && 'currentWeight' in userProfile && 'height' in userProfile
                  ? "Genereremo una ricetta usando i dati del tuo profilo"
                  : "Ti chiederemo peso, altezza ed età per personalizzare le grammature"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Tipo di Ricetta */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-700">Tipo di Ricetta</h3>
                    
                    <FormField
                      control={form.control}
                      name="dishType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo di Piatto</FormLabel>
                          {useFallback ? (
                            <FormControl>
                              <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                value={field.value}
                                onChange={(e) => {
                                  console.log("DishType native select changed to:", e.target.value);
                                  field.onChange(e.target.value);
                                }}
                                data-testid="dishtype-native-select"
                              >
                                <option value="">Seleziona tipo di piatto</option>
                                <option value="primo">Primo Piatto</option>
                                <option value="secondo">Secondo Piatto</option>
                              </select>
                            </FormControl>
                          ) : (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-dish-type">
                                  <SelectValue placeholder="Seleziona tipo di piatto" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="primo">Primo Piatto</SelectItem>
                                <SelectItem value="secondo">Secondo Piatto</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="meatOrFish"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base del Piatto</FormLabel>
                          {useFallback ? (
                            <FormControl>
                              <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                value={field.value}
                                onChange={(e) => {
                                  console.log("MeatOrFish native select changed to:", e.target.value);
                                  field.onChange(e.target.value);
                                }}
                                data-testid="meatfish-native-select"
                              >
                                <option value="">Seleziona base</option>
                                <option value="carne">A base di Carne</option>
                                <option value="pesce">A base di Pesce</option>
                                <option value="uova">A base di Uova</option>
                              </select>
                            </FormControl>
                          ) : (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-meat-fish">
                                  <SelectValue placeholder="Seleziona base" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="carne">A base di Carne</SelectItem>
                                <SelectItem value="pesce">A base di Pesce</SelectItem>
                                <SelectItem value="uova">A base di Uova</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficoltà</FormLabel>
                          {useFallback ? (
                            <FormControl>
                              <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                value={field.value}
                                onChange={(e) => {
                                  console.log("Difficulty native select changed to:", e.target.value);
                                  field.onChange(e.target.value);
                                }}
                                data-testid="difficulty-native-select"
                              >
                                <option value="">Seleziona difficoltà</option>
                                <option value="facile">Facile</option>
                                <option value="media">Media</option>
                                <option value="difficile">Difficile</option>
                              </select>
                            </FormControl>
                          ) : (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-difficulty">
                                  <SelectValue placeholder="Seleziona difficoltà" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="facile">Facile</SelectItem>
                                <SelectItem value="media">Media</SelectItem>
                                <SelectItem value="difficile">Difficile</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferredProteins"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proteine Preferite</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="es. pollo, manzo, salmone..." 
                              {...field} 
                              data-testid="input-preferred-proteins"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("meatOrFish") === "pesce" && (
                      <FormField
                        control={form.control}
                        name="preferredFish"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipi di Pesce Preferiti (opzionale)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="es. salmone, tonno, orata..." 
                                {...field} 
                                data-testid="input-preferred-fish"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="foodIntolerances"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Intolleranze Alimentari (opzionale)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="es. glutine, nichel..." 
                              {...field} 
                              data-testid="input-food-intolerances"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="excludedFoods"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cibi da Evitare (opzionale)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="es. funghi, peperoni..." 
                              {...field} 
                              data-testid="input-excluded-foods"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={generateRecipeMutation.isPending}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    data-testid="generate-recipe-button"
                  >
                    {generateRecipeMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generazione in corso...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Genera Ricetta Personalizzata
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Recipe Display */}
          {generatedRecipe && (
            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  {generatedRecipe.title}
                </CardTitle>
                <CardDescription>
                  {generatedRecipe.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Recipe Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{generatedRecipe.prepTime + generatedRecipe.cookTime} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{generatedRecipe.servings} porzioni</span>
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <h4 className="font-semibold mb-2">Ingredienti:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {generatedRecipe.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="font-semibold mb-2">Istruzioni:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    {generatedRecipe.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>

                {/* Nutritional Info */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Valori Nutrizionali (per porzione):</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Calorie: {generatedRecipe.calories}</div>
                    <div>Proteine: {generatedRecipe.protein}g</div>
                    <div>Carboidrati: {generatedRecipe.carbs}g</div>
                    <div>Grassi: {generatedRecipe.fat}g</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Profile Dialog */}
        <Dialog open={showQuickProfileDialog} onOpenChange={setShowQuickProfileDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Dati Mancanti per Personalizzazione
              </DialogTitle>
              <DialogDescription>
                Per generare una ricetta con grammature personalizzate, abbiamo bisogno di questi dati base:
              </DialogDescription>
            </DialogHeader>
            
            <Form {...quickProfileForm}>
              <form onSubmit={quickProfileForm.handleSubmit(onQuickProfileSubmit)} className="space-y-4">
                <FormField
                  control={quickProfileForm.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Età</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="quick-input-age"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={quickProfileForm.control}
                  name="currentWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso Attuale (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="quick-input-weight"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={quickProfileForm.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Altezza (cm)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="quick-input-height"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowQuickProfileDialog(false)}
                    className="flex-1"
                  >
                    Annulla
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={generateRecipeMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    {generateRecipeMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generazione...
                      </>
                    ) : (
                      "Genera Ricetta"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}