import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Clock, Scale, Heart, AlertTriangle, Sparkles, CheckCircle } from "lucide-react";
import { insertUserProfileSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Schema per la creazione del profilo
const createProfileSchema = insertUserProfileSchema.extend({
  age: z.number().min(18, "Devi avere almeno 18 anni").max(100, "Età massima 100 anni"),
  weight: z.number().min(30, "Peso minimo 30kg").max(300, "Peso massimo 300kg"),
  height: z.number().min(130, "Altezza minima 130cm").max(220, "Altezza massima 220cm"),
  breakfastTime: z.string().min(1, "Orario colazione obbligatorio"),
  lunchTime: z.string().min(1, "Orario pranzo obbligatorio"),
  dinnerTime: z.string().min(1, "Orario cena obbligatorio"),
});

type CreateProfileForm = z.infer<typeof createProfileSchema>;

export default function CreateProfileForm() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const form = useForm<CreateProfileForm>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: {
      age: undefined,
      weight: undefined,
      height: undefined,
      thyroidIssues: "no",
      intestinalIssues: "mai",
      weeklyExercise: 0,
      breakfastTime: "08:00",
      lunchTime: "13:00",
      dinnerTime: "20:00",
      excludedFoods: [],
      allergies: [],
      dailyWaterIntake: "si",
      cravingTimeFrame: "",
      preferredCheatFood: "",
      takingFormulaGazzella: "no",
      dietaryPreferences: ["gazzella"],
      healthGoal: "weight_loss",
      activityLevel: "moderate",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateProfileForm) => {
      return await apiRequest("/api/user-profiles/current", data, "PUT");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-profiles/current"] });
      toast({
        title: "Profilo creato con successo! 🎉",
        description: "Ora puoi accedere a tutti i nostri servizi premium personalizzati.",
      });
      // Reindirizza alla dashboard
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Errore nella creazione del profilo",
        description: "Si è verificato un errore. Riprova.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateProfileForm) => {
    createMutation.mutate(data);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return "Dati Anagrafici";
      case 2: return "Salute e Benessere";
      case 3: return "Orari e Abitudini";
      case 4: return "Preferenze Alimentari";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full">
                <User className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Crea il Tuo Profilo
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Compila tutti i campi per accedere ai servizi premium personalizzati
            </p>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Passo {currentStep} di {totalSteps}: {getStepTitle(currentStep)}
            </p>
          </div>

          {/* Alert importante */}
          <Alert className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              <strong>Completamento obbligatorio:</strong> Tutti i campi contrassegnati con * sono necessari per utilizzare i nostri servizi di pianificazione nutrizionale.
            </AlertDescription>
          </Alert>

          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-emerald-600" />
                {getStepTitle(currentStep)}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Step 1: Dati Anagrafici */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300">Età *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="35"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                            <FormLabel className="text-gray-700 dark:text-gray-300">Peso attuale (kg) *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder="65.5"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                            <FormLabel className="text-gray-700 dark:text-gray-300">Altezza (cm) *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="165"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Step 2: Salute e Benessere */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="thyroidIssues"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300">Problemi alla tiroide</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || "no"}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleziona..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="no">No</SelectItem>
                                <SelectItem value="si">Sì</SelectItem>
                                <SelectItem value="eutirox">Assumo Eutirox</SelectItem>
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
                            <FormLabel className="text-gray-700 dark:text-gray-300">Problemi intestinali</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || "mai"}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleziona..." />
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

                      <FormField
                        control={form.control}
                        name="weeklyExercise"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300">Esercizio fisico (volte a settimana)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="7"
                                placeholder="3"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Step 3: Orari e Abitudini */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="breakfastTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300">Orario colazione *</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
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
                            <FormLabel className="text-gray-700 dark:text-gray-300">Orario pranzo *</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
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
                            <FormLabel className="text-gray-700 dark:text-gray-300">Orario cena *</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dailyWaterIntake"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300">Bevi almeno 2 litri d'acqua al giorno?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || "si"}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleziona..." />
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
                  )}

                  {/* Step 4: Preferenze Alimentari */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="healthGoal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300">Obiettivo principale</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || "weight_loss"}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleziona il tuo obiettivo..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="weight_loss">Perdere peso</SelectItem>
                                <SelectItem value="maintenance">Mantenere il peso</SelectItem>
                                <SelectItem value="muscle_building">Tonificare</SelectItem>
                                <SelectItem value="general_health">Salute generale</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="takingFormulaGazzella"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300">Stai assumendo la Formula Gazzella?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || "no"}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleziona..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="no">No</SelectItem>
                                <SelectItem value="si">Sì</SelectItem>
                                <SelectItem value="ho_iniziato">Ho appena iniziato</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Navigation buttons */}
                  <div className="flex justify-between pt-6">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                      >
                        Indietro
                      </Button>
                    )}
                    
                    {currentStep < totalSteps ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="ml-auto bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
                      >
                        Continua
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="ml-auto bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
                      >
                        {createMutation.isPending ? (
                          "Creazione..."
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Completa Profilo
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}