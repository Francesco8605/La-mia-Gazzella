import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Scale, Activity, Clock, Apple, Droplets, Save, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { UserProfile } from "@shared/schema";

export default function AggiornaProfiloPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    // Dati fisici
    age: "",
    weight: "",
    height: "",
    
    // Condizioni di salute
    thyroidIssues: "",
    intestinalIssues: "",
    
    // Abitudini di esercizio
    weeklyExercise: "",
    
    // Orari dei pasti
    breakfastTime: "",
    lunchTime: "",
    dinnerTime: "",
    
    // Preferenze alimentari
    excludedFoods: [] as string[],
    allergies: [] as string[],
    
    // Abitudini idriche
    dailyWaterIntake: "",
    
    // Comportamenti alimentari
    cravingTimeFrame: "",
    preferredCheatFood: "",
    
    // Integratori
    takingFormulaGazzella: "",
    
    // Obiettivo di salute
    healthGoal: "",
    
  });

  // Fetch current profile
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/user-profiles/current"],
    enabled: !!user,
  });

  // Fetch latest weight entry
  const { data: weightEntries = [] } = useQuery<any[]>({
    queryKey: ["/api/weight-entries"],
    enabled: !!user,
  });

  const latestWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1]?.weight : undefined;

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        age: profile.age?.toString() || "",
        weight: latestWeight?.toString() || profile.weight?.toString() || "",
        height: profile.height?.toString() || "",
        thyroidIssues: profile.thyroidIssues || "",
        intestinalIssues: profile.intestinalIssues || "",
        weeklyExercise: profile.weeklyExercise?.toString() || "",
        breakfastTime: profile.breakfastTime || "",
        lunchTime: profile.lunchTime || "",
        dinnerTime: profile.dinnerTime || "",
        excludedFoods: profile.excludedFoods || [],
        allergies: profile.allergies || [],
        dailyWaterIntake: profile.dailyWaterIntake || "",
        cravingTimeFrame: profile.cravingTimeFrame || "",
        preferredCheatFood: profile.preferredCheatFood || "",
        takingFormulaGazzella: profile.takingFormulaGazzella || "",
        healthGoal: profile.healthGoal || "",
      });
    }
  }, [profile, latestWeight]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("/api/user-profiles/current", {
        ...data,
        age: data.age ? parseInt(data.age) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        height: data.height ? parseInt(data.height) : null,
        weeklyExercise: data.weeklyExercise ? parseInt(data.weeklyExercise) : null,
      }, "PUT");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-profiles/current"] });
      toast({
        title: "Profilo aggiornato",
        description: "Le tue informazioni sono state salvate con successo",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: `Impossibile aggiornare il profilo: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addToArray = (field: 'excludedFoods' | 'allergies', value: string) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      handleInputChange(field, [...formData[field], value.trim()]);
    }
  };

  const removeFromArray = (field: 'excludedFoods' | 'allergies', value: string) => {
    handleInputChange(field, formData[field].filter(item => item !== value));
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="glass-morphism">
          <CardContent className="pt-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Caricamento profilo...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent">
            Aggiorna Profilo
          </h1>
          <p className="text-slate-600 mt-1">
            Mantieni aggiornate le tue informazioni per piani personalizzati
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dati Fisici */}
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
              <Scale className="w-6 h-6 text-red-600" />
              Dati Fisici
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="age">Età (anni)</Label>
                <Input
                  id="age"
                  type="number"
                  min="13"
                  max="120"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="es. 30"
                />
              </div>
              <div>
                <Label htmlFor="weight">Peso Attuale (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="30"
                  max="300"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="es. 65.5"
                />
                {latestWeight && (
                  <p className="text-xs text-slate-500 mt-1">
                    Ultimo peso registrato: {latestWeight} kg
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="height">Altezza (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  min="100"
                  max="250"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  placeholder="es. 165"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Condizioni di Salute */}
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
              <User className="w-6 h-6 text-green-600" />
              Condizioni di Salute
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="thyroid">Problemi di Tiroide</Label>
                <Input
                  id="thyroid"
                  value={formData.thyroidIssues}
                  onChange={(e) => handleInputChange('thyroidIssues', e.target.value)}
                  placeholder="Descrivi eventuali problemi alla tiroide o scrivi 'no' se non ne hai"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Es: "No", "Sì, ipotiroidismo", "Assumo Eutirox 50mg", "Ipertiroidismo in cura", ecc.
                </p>
              </div>
              <div>
                <Label htmlFor="intestinal">Problemi Intestinali</Label>
                <Input
                  id="intestinal"
                  value={formData.intestinalIssues}
                  onChange={(e) => handleInputChange('intestinalIssues', e.target.value)}
                  placeholder="Descrivi eventuali problemi intestinali o scrivi 'mai' se non ne hai"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Es: "Mai", "Stitichezza occasionale", "Colon irritabile", "Spesso gonfiore", ecc.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Abitudini di Esercizio */}
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
              <Activity className="w-6 h-6 text-red-600" />
              Abitudini di Esercizio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="weeklyExercise">Quante volte a settimana ti alleni?</Label>
              <Input
                id="weeklyExercise"
                type="number"
                min="0"
                max="14"
                value={formData.weeklyExercise}
                onChange={(e) => handleInputChange('weeklyExercise', e.target.value)}
                placeholder="es. 3"
              />
            </div>
          </CardContent>
        </Card>

        {/* Orari dei Pasti */}
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
              <Clock className="w-6 h-6 text-green-600" />
              Orari dei Pasti
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="breakfast">Orario Colazione</Label>
                <Input
                  id="breakfast"
                  type="text"
                  value={formData.breakfastTime}
                  onChange={(e) => handleInputChange('breakfastTime', e.target.value)}
                  placeholder="Descrivi quando fai colazione"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Es: "Ore 7:30", "Tra le 7 e le 8", "Presto verso le 6:30", "Mai, digiuno", ecc.
                </p>
              </div>
              <div>
                <Label htmlFor="lunch">Orario Pranzo</Label>
                <Input
                  id="lunch"
                  type="text"
                  value={formData.lunchTime}
                  onChange={(e) => handleInputChange('lunchTime', e.target.value)}
                  placeholder="Descrivi quando pranzi"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Es: "13:00 preciso", "Tra le 12:30 e 13:30", "Tardi verso le 14", "Variabile in base al lavoro", ecc.
                </p>
              </div>
              <div>
                <Label htmlFor="dinner">Orario Cena</Label>
                <Input
                  id="dinner"
                  type="text"
                  value={formData.dinnerTime}
                  onChange={(e) => handleInputChange('dinnerTime', e.target.value)}
                  placeholder="Descrivi quando ceni"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Es: "20:00 fisso", "Tra le 19 e 20:30", "Molto tardi dopo le 21", "Presto alle 18:30", ecc.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Abitudini Idriche */}
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
              <Droplets className="w-6 h-6 text-blue-600" />
              Abitudini Idriche
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="water">Abitudini di idratazione</Label>
              <Input
                id="water"
                value={formData.dailyWaterIntake}
                onChange={(e) => handleInputChange('dailyWaterIntake', e.target.value)}
                placeholder="Descrivi le tue abitudini di idratazione quotidiana"
              />
              <p className="text-xs text-slate-500 mt-1">
                Es: "Bevo almeno 2 litri al giorno", "1-1.5 litri, spesso dimentico", "Solo caffè e tè", ecc.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Comportamenti Alimentari */}
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
              <Apple className="w-6 h-6 text-green-600" />
              Comportamenti Alimentari
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="craving">In che fascia oraria hai più voglia di sgarrare?</Label>
              <Input
                id="craving"
                value={formData.cravingTimeFrame}
                onChange={(e) => handleInputChange('cravingTimeFrame', e.target.value)}
                placeholder="es. Sera dopo cena, pomeriggio..."
              />
            </div>
            <div>
              <Label htmlFor="cheatFood">Che tipo di cibo sgarri preferisci?</Label>
              <Input
                id="cheatFood"
                value={formData.preferredCheatFood}
                onChange={(e) => handleInputChange('preferredCheatFood', e.target.value)}
                placeholder="es. Dolci, salato, pizza..."
              />
            </div>
            <div>
              <Label htmlFor="healthGoal">Obiettivo principale</Label>
              <Input
                id="healthGoal"
                value={formData.healthGoal}
                onChange={(e) => handleInputChange('healthGoal', e.target.value)}
                placeholder="Descrivi il tuo obiettivo principale di salute e benessere"
              />
              <p className="text-xs text-slate-500 mt-1">
                Es: "Perdere 10kg", "Mantenere peso e migliorare energia", "Tonificare e sentirmi meglio", "Gestire stress e digestione", ecc.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Integratori */}
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
              <User className="w-6 h-6 text-red-600" />
              Integratori
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="formula">Formula Gazzella</Label>
              <Input
                id="formula"
                value={formData.takingFormulaGazzella}
                onChange={(e) => handleInputChange('takingFormulaGazzella', e.target.value)}
                placeholder="Descrivi se e come assumi la Formula Gazzella"
              />
              <p className="text-xs text-slate-500 mt-1">
                Es: "No, non la prendo", "Sì, da 3 mesi", "Ho appena iniziato ieri", "La prendo irregolarmente", ecc.
              </p>
            </div>
          </CardContent>
        </Card>


        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white px-8 py-3"
          >
            {updateProfileMutation.isPending ? (
              "Salvataggio..."
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Salva Profilo
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}