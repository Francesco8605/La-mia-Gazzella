import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserProfileSchema, type InsertUserProfile } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { User, Heart, Clock, Utensils, AlertTriangle, Droplets, Timer, Pill } from "lucide-react";
import { useState } from "react";

const commonFoods = [
  "Glutine", "Lattosio", "Uova", "Noci", "Arachidi", "Pesce", "Crostacei", 
  "Soia", "Sedano", "Senape", "Sesamo", "Anidride solforosa"
];

const cheatFoodOptions = [
  "Dolci e cioccolato", "Pizza e prodotti da forno", "Snack salati e patatine",
  "Gelato e dessert cremosi", "Fast food e fritti", "Bevande zuccherate",
  "Pasta e carboidrati", "Formaggi e latticini", "Alcol", "Altro"
];

export default function Personalization() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [excludedFoodsList, setExcludedFoodsList] = useState<string[]>([]);
  const [allergiesList, setAllergiesList] = useState<string[]>([]);

  const form = useForm<InsertUserProfile>({
    resolver: zodResolver(insertUserProfileSchema),
    defaultValues: {
      userId: "demo-user", // Temporary user ID for demo
      email: "",
      phone: "",
      age: 25,
      weight: 70,
      height: 170,
      thyroidIssues: "no",
      intestinalIssues: "mai",
      weeklyExercise: 2,
      breakfastTime: "",
      lunchTime: "",
      dinnerTime: "",
      excludedFoods: [],
      allergies: [],
      dailyWaterIntake: "si",
      cravingTimeFrame: "",
      preferredCheatFood: "",
      takingFormulaGazzella: "no",
      dietaryPreferences: [],
      healthGoal: "maintenance",
      activityLevel: "moderate",
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: InsertUserProfile) => {
      const response = await fetch("/api/user-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          excludedFoods: excludedFoodsList,
          allergies: allergiesList,
        }),
      });
      if (!response.ok) throw new Error("Errore durante il salvataggio del profilo");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profilo salvato!",
        description: "I tuoi dati sono stati salvati con successo. Ora possiamo creare piani alimentari personalizzati per te.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user-profiles"] });
      
      // Reindirizza alla pagina di generazione del meal plan dopo 2 secondi
      setTimeout(() => {
        window.location.href = "/meal-plan-generator";
      }, 2000);
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio. Riprova.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertUserProfile) => {
    createProfileMutation.mutate(data);
  };

  const toggleExcludedFood = (food: string) => {
    setExcludedFoodsList(prev => 
      prev.includes(food) 
        ? prev.filter(f => f !== food)
        : [...prev, food]
    );
  };

  const toggleAllergy = (allergy: string) => {
    setAllergiesList(prev => 
      prev.includes(allergy) 
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto">
        <Card className="glass-morphism border-0 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Personalizza La Tua Gazzella
            </CardTitle>
            <CardDescription className="text-lg text-slate-600 mt-4">
              Rispondi a queste 18 domande per creare un piano nutrizionale perfetto per te
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Informazioni di Contatto */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <User className="text-green-600 h-6 w-6" />
                    <h3 className="text-2xl font-semibold text-slate-800">Informazioni di Contatto</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Indirizzo Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="la.tua.email@esempio.com" 
                              {...field} 
                              data-testid="input-email"
                            />
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
                            <Input 
                              type="tel" 
                              placeholder="+39 123 456 7890" 
                              {...field} 
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Dati Fisici */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Heart className="text-red-500 h-6 w-6" />
                    <h3 className="text-2xl font-semibold text-slate-800">Dati Fisici</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quanti anni hai?</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="25" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              data-testid="input-age"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Peso attuale (kg)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="70" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              data-testid="input-weight"
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
                              placeholder="170" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              data-testid="input-height"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Condizioni di Salute */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="text-orange-500 h-6 w-6" />
                    <h3 className="text-2xl font-semibold text-slate-800">Condizioni di Salute</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="thyroidIssues"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hai problemi alla tiroide o assumi Eutirox?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-thyroid">
                                <SelectValue placeholder="Seleziona un'opzione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="no">No</SelectItem>
                              <SelectItem value="si">Sì, ho problemi alla tiroide</SelectItem>
                              <SelectItem value="eutirox">Sì, assumo Eutirox</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="intestinalIssues"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hai l'intestino spesso gonfio o infiammato?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-intestinal">
                                <SelectValue placeholder="Seleziona un'opzione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="mai">Mai</SelectItem>
                              <SelectItem value="qualche_volta">Qualche volta</SelectItem>
                              <SelectItem value="spesso">Spesso</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Attività Fisica */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Timer className="text-blue-500 h-6 w-6" />
                    <h3 className="text-2xl font-semibold text-slate-800">Attività Fisica</h3>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="weeklyExercise"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quante volte a settimana ti muovi (camminata o sport)?</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="2" 
                            min="0" 
                            max="14"
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            data-testid="input-exercise"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Orari dei Pasti */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="text-purple-500 h-6 w-6" />
                    <h3 className="text-2xl font-semibold text-slate-800">Orari dei Pasti</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="breakfastTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>A che ora fai solitamente colazione?</FormLabel>
                          <FormControl>
                            <Input 
                              type="time" 
                              {...field} 
                              data-testid="input-breakfast-time"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lunchTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>A che ora fai solitamente pranzo?</FormLabel>
                          <FormControl>
                            <Input 
                              type="time" 
                              {...field} 
                              data-testid="input-lunch-time"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dinnerTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>A che ora fai solitamente cena?</FormLabel>
                          <FormControl>
                            <Input 
                              type="time" 
                              {...field} 
                              data-testid="input-dinner-time"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Preferenze Alimentari */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Utensils className="text-green-500 h-6 w-6" />
                    <h3 className="text-2xl font-semibold text-slate-800">Preferenze Alimentari</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-3 block">
                        Ci sono alimenti che non vuoi mangiare?
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {commonFoods.map((food) => (
                          <div key={food} className="flex items-center space-x-2">
                            <Checkbox
                              id={`excluded-${food}`}
                              checked={excludedFoodsList.includes(food)}
                              onCheckedChange={() => toggleExcludedFood(food)}
                              data-testid={`checkbox-excluded-${food.toLowerCase()}`}
                            />
                            <label 
                              htmlFor={`excluded-${food}`}
                              className="text-sm text-slate-600 cursor-pointer"
                            >
                              {food}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-3 block">
                        Ci sono allergie o intolleranze?
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {commonFoods.map((allergy) => (
                          <div key={allergy} className="flex items-center space-x-2">
                            <Checkbox
                              id={`allergy-${allergy}`}
                              checked={allergiesList.includes(allergy)}
                              onCheckedChange={() => toggleAllergy(allergy)}
                              data-testid={`checkbox-allergy-${allergy.toLowerCase()}`}
                            />
                            <label 
                              htmlFor={`allergy-${allergy}`}
                              className="text-sm text-slate-600 cursor-pointer"
                            >
                              {allergy}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Abitudini Idriche */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Droplets className="text-blue-400 h-6 w-6" />
                    <h3 className="text-2xl font-semibold text-slate-800">Abitudini Idriche</h3>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="dailyWaterIntake"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bevi almeno 1 litro e mezzo di acqua al giorno?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-water-intake">
                              <SelectValue placeholder="Seleziona un'opzione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="si">Sì</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Comportamenti Alimentari */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Timer className="text-orange-400 h-6 w-6" />
                    <h3 className="text-2xl font-semibold text-slate-800">Comportamenti Alimentari</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="cravingTimeFrame"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>In che fascia oraria ti capita più spesso di sgarrare o avere fame?</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Es: 16:00-18:00 o dopo cena" 
                              {...field} 
                              data-testid="input-craving-time"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="preferredCheatFood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qual è il tipo di cibo "sgarro" che ti tenta di più?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-cheat-food">
                                <SelectValue placeholder="Seleziona un'opzione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cheatFoodOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Integratori */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Pill className="text-indigo-500 h-6 w-6" />
                    <h3 className="text-2xl font-semibold text-slate-800">Integratori</h3>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="takingFormulaGazzella"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hai già iniziato a prendere l'integratore Formula Gazzella?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-formula-gazzella">
                              <SelectValue placeholder="Seleziona un'opzione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="no">No, non l'ho ancora iniziato</SelectItem>
                            <SelectItem value="ho_iniziato">Sì, ho appena iniziato</SelectItem>
                            <SelectItem value="si">Sì, lo sto già prendendo da un po'</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Submit Button */}
                <div className="flex justify-center pt-8">
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full md:w-auto px-12 py-4 text-lg font-semibold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                    disabled={createProfileMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    {createProfileMutation.isPending ? "Salvataggio in corso..." : "Salva Profilo e Crea Piano Personalizzato"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}