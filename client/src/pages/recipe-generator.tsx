import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { ChefHat, Clock, Users, Utensils, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const recipeFormSchema = z.object({
  email: z.string().email("Email non valida"),
  fullName: z.string().min(2, "Nome e cognome richiesti"),
  phone: z.string().min(8, "Numero di telefono richiesto"),
  age: z.number().min(18, "Età minima 18 anni").max(100, "Età massima 100 anni"),
  currentWeight: z.number().min(30, "Peso minimo 30kg").max(200, "Peso massimo 200kg"),
  height: z.number().min(120, "Altezza minima 120cm").max(220, "Altezza massima 220cm"),
  targetWeight: z.number().min(30, "Peso obiettivo minimo 30kg").max(200, "Peso obiettivo massimo 200kg"),
  dishType: z.enum(["primo", "secondo"], { required_error: "Seleziona tipo di piatto" }),
  preferredProteins: z.string().min(1, "Specifica le proteine preferite"),
  preferredFish: z.string().optional(),
  meatOrFish: z.enum(["carne", "pesce"], { required_error: "Seleziona base del piatto" }),
  foodIntolerances: z.string().optional(),
  excludedFoods: z.string().optional(),
  additionalDetails: z.string().optional(),
});

type RecipeFormData = z.infer<typeof recipeFormSchema>;

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

export default function RecipeGenerator() {
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null);
  const { toast } = useToast();

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      email: "",
      fullName: "",
      phone: "",
      age: 45,
      currentWeight: 70,
      height: 165,
      targetWeight: 65,
      dishType: "secondo",
      preferredProteins: "",
      preferredFish: "",
      meatOrFish: "pesce",
      foodIntolerances: "",
      excludedFoods: "",
      additionalDetails: "",
    },
  });

  const generateRecipeMutation = useMutation({
    mutationFn: async (data: RecipeFormData) => {
      const recipeRequest = {
        mealName: `${data.dishType === "primo" ? "Primo piatto" : "Secondo piatto"} ${data.meatOrFish === "carne" ? "a base di carne" : "a base di pesce"}`,
        dietaryPreferences: [
          "menopausa",
          "no legumi",
          "no latticini",
          "no affettati",
          "no ultra-processati"
        ],
        targetCalories: data.dishType === "primo" ? 400 : 350,
        allergies: data.foodIntolerances ? data.foodIntolerances.split(",").map(s => s.trim()) : [],
        cuisine: "italiana",
        userProfile: {
          email: data.email,
          fullName: data.fullName,
          phone: data.phone,
          age: data.age,
          currentWeight: data.currentWeight,
          height: data.height,
          targetWeight: data.targetWeight,
          preferredProteins: data.preferredProteins,
          preferredFish: data.preferredFish,
          meatOrFish: data.meatOrFish,
          excludedFoods: data.excludedFoods,
          additionalDetails: data.additionalDetails
        }
      };

      return apiRequest("/api/recipes/generate", recipeRequest);
    },
    onSuccess: (recipe: GeneratedRecipe) => {
      setGeneratedRecipe(recipe);
      toast({
        title: "Ricetta Generata!",
        description: "La tua ricetta personalizzata secondo il Manuale della Gazzella è pronta.",
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
                Compila tutti i campi per ottenere una ricetta personalizzata secondo le regole della Gazzella
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Informazioni Personali */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-700">Informazioni Personali</h3>
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="tua@email.com" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome e Cognome</FormLabel>
                          <FormControl>
                            <Input placeholder="Mario Rossi" {...field} data-testid="input-fullname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numero di Telefono</FormLabel>
                          <FormControl>
                            <Input placeholder="+39 123 456 7890" {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Età</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="input-age"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currentWeight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Peso Attuale (kg)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="input-current-weight"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Altezza (cm)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="input-height"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="targetWeight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Obiettivo di Peso (kg)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-target-weight"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Preferenze Ricetta */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-700">Preferenze Ricetta</h3>
                    
                    <FormField
                      control={form.control}
                      name="dishType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vuoi la ricetta per un primo o un secondo?</FormLabel>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="meatOrFish"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Questa ricetta la preferisci base carne o pesce?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-meat-fish">
                                <SelectValue placeholder="Seleziona base" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="carne">Base Carne</SelectItem>
                              <SelectItem value="pesce">Base Pesce</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferredProteins"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quali proteine animali preferisci?</FormLabel>
                          <FormControl>
                            <Input placeholder="es. pollo, manzo, tacchino..." {...field} data-testid="input-proteins" />
                          </FormControl>
                          <FormDescription>
                            Specifica le tue proteine preferite (carne fresca, non confezionata)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferredFish"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quali tipi di pesci preferisci?</FormLabel>
                          <FormControl>
                            <Input placeholder="es. salmone, orata, spigola, sogliola..." {...field} data-testid="input-fish" />
                          </FormControl>
                          <FormDescription>
                            Solo pesce fresco (no merluzzo se escluso espressamente)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="foodIntolerances"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hai intolleranze alimentari?</FormLabel>
                          <FormControl>
                            <Input placeholder="es. glutine, nichel..." {...field} data-testid="input-intolerances" />
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
                          <FormLabel>Ci sono alimenti che proprio non vuoi vedere nelle ricette?</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="es. merluzzo, cipolla, aglio..."
                              {...field}
                              data-testid="textarea-excluded-foods"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="additionalDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scrivi qui ogni altro dettaglio utile per creare le tue ricette personalizzate</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="es. tempo limitato per cucinare, preferenze di cottura, occasioni speciali..."
                              {...field}
                              data-testid="textarea-additional-details"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={generateRecipeMutation.isPending}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                    data-testid="button-generate-recipe"
                  >
                    {generateRecipeMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Generando Ricetta...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Genera Ricetta Gazzella
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Recipe Display Section */}
          <div className="space-y-6">
            {generatedRecipe ? (
              <Card className="glass-morphism">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5" />
                    {generatedRecipe.title}
                  </CardTitle>
                  <CardDescription>{generatedRecipe.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Recipe Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <Clock className="h-5 w-5 mx-auto mb-1 text-green-600" />
                      <div className="text-sm font-medium">{generatedRecipe.prepTime + generatedRecipe.cookTime} min</div>
                      <div className="text-xs text-slate-600">Tempo Totale</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                      <div className="text-sm font-medium">{generatedRecipe.servings}</div>
                      <div className="text-xs text-slate-600">Porzioni</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <Sparkles className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                      <div className="text-sm font-medium">{generatedRecipe.calories}</div>
                      <div className="text-xs text-slate-600">Calorie</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-sm font-medium">{generatedRecipe.difficulty}</div>
                      <div className="text-xs text-slate-600">Difficoltà</div>
                    </div>
                  </div>

                  {/* Nutritional Info */}
                  <div className="bg-white/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Valori Nutrizionali (per porzione)</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>Proteine: {generatedRecipe.protein}g</div>
                      <div>Carboidrati: {generatedRecipe.carbs}g</div>
                      <div>Grassi: {generatedRecipe.fat}g</div>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <h4 className="font-semibold mb-3">Ingredienti</h4>
                    <ul className="space-y-1">
                      {generatedRecipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm">{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h4 className="font-semibold mb-3">Preparazione</h4>
                    <ol className="space-y-2">
                      {generatedRecipe.instructions.map((instruction, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="text-sm">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Dietary Tags */}
                  {generatedRecipe.dietaryTags.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Tags Alimentari</h4>
                      <div className="flex flex-wrap gap-2">
                        {generatedRecipe.dietaryTags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-morphism">
                <CardContent className="text-center py-12">
                  <ChefHat className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">
                    Ricetta Non Ancora Generata
                  </h3>
                  <p className="text-slate-500 max-w-md mx-auto">
                    Compila il modulo a sinistra per generare una ricetta personalizzata secondo il Manuale della Gazzella
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}