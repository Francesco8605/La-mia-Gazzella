import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, RefreshCw, Scale, Target, Settings, AlertTriangle, Plus } from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertUserProfileSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { UserProfile } from "@shared/schema";
import CreateProfileForm from "@/components/create-profile-form";
import WeightTracker from "@/components/weight-tracker";

// Schema for weight update (simplified)
const updateWeightSchema = z.object({
  weight: z.number().min(30, "Il peso deve essere almeno 30kg").max(300, "Il peso deve essere massimo 300kg"),
});

type UpdateWeightForm = z.infer<typeof updateWeightSchema>;

export default function UpdateProfile() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const params = useParams<{ id?: string }>();
  const profileId = params.id;

  const { data: userProfile, isLoading } = useQuery<UserProfile>({
    queryKey: [`/api/profiles/${profileId}`],
    enabled: !!profileId,
    staleTime: 1000 * 60 * 2, // 2 minuti di cache
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
      if (!profileId) throw new Error("Profile ID richiesto");
      return apiRequest(`/api/profiles/${profileId}`, { weight: data.weight }, "PATCH");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/profiles/${profileId}`] });
      toast({
        title: "Profilo aggiornato",
        description: "I tuoi dati sono stati aggiornati con successo",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile aggiornare il profilo",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateWeightForm) => {
    updateMutation.mutate(data);
  };

  // No profile ID provided - show create form
  if (!profileId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-emerald-50 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent mb-4">
              Crea Profilo Nutrizionale
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Crea il tuo profilo per piani alimentari personalizzati seguendo il protocollo Gazzella
            </p>
          </div>
          
          <CreateProfileForm />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-slate-600">Caricamento profilo...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Profilo Non Trovato</h2>
          <p className="text-slate-600 mb-6">
            Il profilo richiesto non esiste o non è accessibile.
          </p>
          <Link href="/">
            <Button>Torna alla Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-emerald-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla Home
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent mb-4">
            Aggiorna Profilo
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Mantieni aggiornati i tuoi dati per piani alimentari sempre personalizzati
          </p>
        </div>

        {/* Profile Summary */}
        <Card className="glass-morphism mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5 text-green-600" />
              Dati Attuali del Profilo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Scale className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">{userProfile.weight}kg</div>
                <div className="text-sm text-green-600">Peso Attuale</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-700">{userProfile.targetWeight || "Non impostato"}kg</div>
                <div className="text-sm text-blue-600">Peso Obiettivo</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">{userProfile.age}</div>
                <div className="text-sm text-purple-600">Anni</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weight Update Form */}
        <Card className="glass-morphism mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scale className="mr-2 h-5 w-5 text-green-600" />
              Aggiorna Peso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso Attuale (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="75.5"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  className="w-full bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white font-semibold"
                >
                  {updateMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Aggiornamento...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salva Modifiche
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Weight Tracking Chart */}
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scale className="mr-2 h-5 w-5 text-green-600" />
              Tracciamento Peso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeightTracker profileId={profileId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}