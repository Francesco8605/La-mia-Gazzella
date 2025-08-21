import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, RefreshCw, Scale, Target, CreditCard, Settings, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertUserProfileSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { UserProfile } from "@shared/schema";
import { SubscriptionSettings } from "@/components/subscription-settings";

// Schema for weight update (simplified)
const updateWeightSchema = z.object({
  weight: z.number().min(30, "Il peso deve essere almeno 30kg").max(300, "Il peso deve essere massimo 300kg"),
});

type UpdateWeightForm = z.infer<typeof updateWeightSchema>;

export default function UpdateProfile() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: userProfile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/user-profile"],
    enabled: !!user,
  });

  const form = useForm<UpdateWeightForm>({
    resolver: zodResolver(updateWeightSchema),
    defaultValues: {
      weight: userProfile?.weight ? parseFloat(userProfile.weight.toString()) : 0,
    },
  });

  // Update form when profile loads
  if (userProfile && !form.formState.isDirty) {
    form.reset({
      weight: userProfile.weight ? parseFloat(userProfile.weight.toString()) : 0,
    });
  }

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateWeightForm) => {
      return await apiRequest(`/api/user-profile`, {
        weight: data.weight,
      }, "PATCH");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-profile"] });
      toast({
        title: "Dati aggiornati!",
        description: "I tuoi dati sono stati aggiornati con successo. Ora puoi generare un nuovo piano personalizzato.",
      });
      // Redirect to meal plan generator
      navigate("/genera-piano");
    },
    onError: (error) => {
      toast({
        title: "Errore nell'aggiornamento",
        description: "Si è verificato un errore durante l'aggiornamento. Riprova.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateWeightForm) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-pink-600" />
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Caricamento dei tuoi dati...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Scale className="h-12 w-12 mx-auto mb-4 text-pink-600" />
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Profilo non trovato
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Devi prima creare un profilo per poter aggiornare i tuoi dati.
              </p>
              <Link href="/profilo">
                <Button>Crea il tuo profilo</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate current BMI
  const currentBMI = userProfile.weight && userProfile.height 
    ? userProfile.weight / Math.pow(userProfile.height / 100, 2)
    : 0;
  const idealWeight = userProfile.height 
    ? Math.round(22 * Math.pow(userProfile.height / 100, 2))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna alla Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Aggiorna i tuoi dati
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
            Mantieni il tuo profilo sempre aggiornato per piani alimentari più precisi
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Current Stats */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <Scale className="w-5 h-5 mr-2 text-pink-600" />
                  I tuoi dati attuali
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-pink-600">
                      {userProfile.weight} kg
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Peso attuale</div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {currentBMI.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">BMI attuale</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Altezza:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{userProfile.height} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Peso ideale:</span>
                    <span className="font-semibold text-green-600">{idealWeight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Peso obiettivo:</span>
                    <span className="font-semibold text-blue-600">{userProfile.weight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Età:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{userProfile.age} anni</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Update Form */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  Aggiorna i tuoi dati
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Weight */}
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300">
                            Peso attuale (kg) *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="65"
                              className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                              data-testid="input-current-weight"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    {/* Submit Button */}
                    <div className="flex flex-col gap-3">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={updateMutation.isPending}
                        className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        data-testid="button-save-updates"
                      >
                        {updateMutation.isPending ? (
                          <>
                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                            Salvataggio...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5 mr-2" />
                            Salva modifiche
                          </>
                        )}
                      </Button>

                      <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                        Dopo aver aggiornato i dati, potrai generare un nuovo piano alimentare personalizzato
                      </p>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Management Section */}
          <div className="mt-8">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <CreditCard className="w-5 h-5 mr-2 text-emerald-600" />
                  Gestione Abbonamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/piani-abbonamento" className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Visualizza Piani
                      </Button>
                    </Link>
                    
                    <Link href="/cancella-abbonamento" className="flex-1">
                      <Button variant="destructive" className="w-full">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Cancella Abbonamento
                      </Button>
                    </Link>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Gestisci il tuo abbonamento o cancellalo quando vuoi
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}