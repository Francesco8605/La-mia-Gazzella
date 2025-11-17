import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft, User, Mail, Phone, Calendar, TrendingDown, Activity, Utensils, ChefHat, Heart, Ruler, Weight, Clock, Droplets, AlertCircle, Apple, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  notes?: string;
}

interface Meal {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface MealPlanDay {
  day: string;
  totalCalories: number;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks?: Meal[];
  };
}

interface MealPlan {
  id: string;
  title: string;
  description: string;
  targetCalories: number;
  currentWeight: number;
  targetWeight: number;
  createdAt: string;
  days?: MealPlanDay[];
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
}

interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients?: string[];
  instructions?: string[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  servings?: number;
  prepTime?: number;
  cookTime?: number;
  difficulty?: string;
  cuisine?: string;
  dietaryTags?: string[];
  imageUrl?: string;
  rating?: number;
  createdAt: string;
}

interface ClientHistory {
  user: {
    id: string;
    email: string;
    username: string;
    subscriptionStatus: string;
    subscriptionPlan: string;
    createdAt: string;
  };
  profile: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    age?: number;
    weight?: number;
    height?: number;
    thyroidIssues?: string;
    intestinalIssues?: string;
    weeklyExercise?: number;
    breakfastTime?: string;
    lunchTime?: string;
    dinnerTime?: string;
    excludedFoods?: string[];
    allergies?: string[];
    dailyWaterIntake?: string;
    cravingTimeFrame?: string;
    preferredCheatFood?: string;
    takingFormulaGazzella?: string;
  } | null;
  mealPlans: MealPlan[];
  weightHistory: WeightEntry[];
  recipes: Recipe[];
}

export default function AdminClientDetail() {
  const [match, params] = useRoute("/admin/client/:userId");
  const userId = params?.userId;
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());
  const [loadingPlanDetails, setLoadingPlanDetails] = useState<Set<string>>(new Set());
  const [planDetails, setPlanDetails] = useState<Map<string, MealPlan>>(new Map());
  const { toast } = useToast();

  // API helper with auth headers
  const fetchWithAuth = async (url: string) => {
    const token = localStorage.getItem("admin_token");
    const email = localStorage.getItem("admin_email");
    return fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Admin-Email": email || "",
      },
    });
  };

  // Toggle plan details visibility and load full details if not already loaded
  const togglePlanDetails = async (planId: string) => {
    const newExpanded = new Set(expandedPlans);
    if (newExpanded.has(planId)) {
      newExpanded.delete(planId);
      setExpandedPlans(newExpanded);
    } else {
      newExpanded.add(planId);
      setExpandedPlans(newExpanded);
      
      // Load full plan details if not already loaded
      if (!planDetails.has(planId)) {
        setLoadingPlanDetails(prev => {
          const next = new Set(prev);
          next.add(planId);
          return next;
        });
        
        try {
          const response = await fetchWithAuth(`/api/admin/meal-plan/${planId}`);
          if (response.ok) {
            const fullPlan = await response.json();
            setPlanDetails(prev => {
              const next = new Map(prev);
              next.set(planId, fullPlan);
              return next;
            });
          } else {
            console.error("Error loading plan details: unauthorized or not found");
            toast({
              title: "Errore",
              description: "Impossibile caricare i dettagli del piano",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error loading plan details:", error);
          toast({
            title: "Errore",
            description: "Errore durante il caricamento del piano",
            variant: "destructive",
          });
        } finally {
          setLoadingPlanDetails(prev => {
            const next = new Set(prev);
            next.delete(planId);
            return next;
          });
        }
      }
    }
  };

  // Helper to translate day names
  const translateDay = (day: string) => {
    const dayTranslations: Record<string, string> = {
      'Monday': 'Lunedì',
      'Tuesday': 'Martedì', 
      'Wednesday': 'Mercoledì',
      'Thursday': 'Giovedì',
      'Friday': 'Venerdì',
      'Saturday': 'Sabato',
      'Sunday': 'Domenica'
    };
    return dayTranslations[day] || day;
  };

  // Meal icons
  const mealIcons = {
    breakfast: "🌅",
    lunch: "☀️",
    dinner: "🌙",
    snacks: "🍎",
  };

  // Fetch client history
  const { data: clientHistory, isLoading } = useQuery<ClientHistory>({
    queryKey: ["/api/admin/clients", userId, "history"],
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/admin/clients/${userId}/history`);
      if (!response.ok) throw new Error('Failed to fetch client history');
      return response.json();
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-lg">Caricamento...</div>
      </div>
    );
  }

  if (!clientHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Cliente non trovato</p>
            <Link href="/admin">
              <Button className="mt-4">Torna alla Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare weight chart data
  const weightChartData = clientHistory.weightHistory
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(entry => ({
      date: format(new Date(entry.date), 'dd/MM', { locale: it }),
      peso: entry.weight,
      fullDate: format(new Date(entry.date), 'dd MMMM yyyy', { locale: it })
    }));

  // Calculate weight progress
  const startWeight = weightChartData[0]?.peso || clientHistory.profile?.weight || 0;
  const currentWeight = weightChartData[weightChartData.length - 1]?.peso || clientHistory.profile?.weight || 0;
  const weightLost = startWeight - currentWeight;

  // Get subscription status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'trial': return 'bg-blue-500';
      case 'canceled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Attivo';
      case 'trial': return 'Trial';
      case 'canceled': return 'Cancellato';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="ghost" className="text-white hover:bg-slate-700 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla Dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              {clientHistory.profile?.firstName || clientHistory.profile?.lastName ? (
                <>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {clientHistory.profile.firstName || ''} {clientHistory.profile.lastName || ''}
                  </h1>
                  <p className="text-slate-400 text-sm mb-2">{clientHistory.user.email}</p>
                </>
              ) : (
                <h1 className="text-3xl font-bold text-white mb-2">
                  {clientHistory.user.email}
                </h1>
              )}
              <Badge className={`${getStatusColor(clientHistory.user.subscriptionStatus)} text-white`}>
                {getStatusText(clientHistory.user.subscriptionStatus)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Client Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white truncate">
                {clientHistory.profile?.email || clientHistory.user.email}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
                <Phone className="mr-2 h-4 w-4" />
                Telefono
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {clientHistory.profile?.phone || 'N/A'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
                <TrendingDown className="mr-2 h-4 w-4" />
                Peso Perso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {weightLost > 0 ? `-${weightLost.toFixed(1)} kg` : '0 kg'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
                <Utensils className="mr-2 h-4 w-4" />
                Piani Generati
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {clientHistory.mealPlans.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Profile Data */}
        {clientHistory.profile && (
          <Card className="bg-slate-800 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="mr-2 h-5 w-5" />
                Dati Profilo Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Dati Fisici */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-emerald-400 flex items-center">
                    <Ruler className="mr-2 h-4 w-4" />
                    Dati Fisici
                  </h3>
                  <div className="space-y-2 pl-6">
                    <div>
                      <p className="text-xs text-slate-400">Età</p>
                      <p className="text-sm text-white">{clientHistory.profile.age || 'N/A'} anni</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Peso</p>
                      <p className="text-sm text-white">{clientHistory.profile.weight || 'N/A'} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Altezza</p>
                      <p className="text-sm text-white">{clientHistory.profile.height || 'N/A'} cm</p>
                    </div>
                  </div>
                </div>

                {/* Condizioni di Salute */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-red-400 flex items-center">
                    <Heart className="mr-2 h-4 w-4" />
                    Condizioni di Salute
                  </h3>
                  <div className="space-y-2 pl-6">
                    <div>
                      <p className="text-xs text-slate-400">Problemi Tiroide</p>
                      <p className="text-sm text-white">{clientHistory.profile.thyroidIssues || 'Nessuno'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Problemi Intestinali</p>
                      <p className="text-sm text-white">{clientHistory.profile.intestinalIssues || 'Nessuno'}</p>
                    </div>
                  </div>
                </div>

                {/* Attività Fisica */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-blue-400 flex items-center">
                    <Activity className="mr-2 h-4 w-4" />
                    Attività Fisica
                  </h3>
                  <div className="space-y-2 pl-6">
                    <div>
                      <p className="text-xs text-slate-400">Esercizio Settimanale</p>
                      <p className="text-sm text-white">
                        {clientHistory.profile.weeklyExercise 
                          ? `${clientHistory.profile.weeklyExercise} volte/settimana` 
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Orari Pasti */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-orange-400 flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Orari Pasti
                  </h3>
                  <div className="space-y-2 pl-6">
                    <div>
                      <p className="text-xs text-slate-400">Colazione</p>
                      <p className="text-sm text-white">{clientHistory.profile.breakfastTime || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Pranzo</p>
                      <p className="text-sm text-white">{clientHistory.profile.lunchTime || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Cena</p>
                      <p className="text-sm text-white">{clientHistory.profile.dinnerTime || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Preferenze Alimentari */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-purple-400 flex items-center">
                    <Apple className="mr-2 h-4 w-4" />
                    Preferenze Alimentari
                  </h3>
                  <div className="space-y-2 pl-6">
                    <div>
                      <p className="text-xs text-slate-400">Cibi Esclusi</p>
                      <p className="text-sm text-white">
                        {clientHistory.profile.excludedFoods && clientHistory.profile.excludedFoods.length > 0 
                          ? clientHistory.profile.excludedFoods.join(', ') 
                          : 'Nessuno'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Allergie</p>
                      <p className="text-sm text-white">
                        {clientHistory.profile.allergies && clientHistory.profile.allergies.length > 0 
                          ? clientHistory.profile.allergies.join(', ') 
                          : 'Nessuna'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Abitudini */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-cyan-400 flex items-center">
                    <Droplets className="mr-2 h-4 w-4" />
                    Abitudini
                  </h3>
                  <div className="space-y-2 pl-6">
                    <div>
                      <p className="text-xs text-slate-400">Assunzione Acqua</p>
                      <p className="text-sm text-white">{clientHistory.profile.dailyWaterIntake || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Orario Voglie</p>
                      <p className="text-sm text-white">{clientHistory.profile.cravingTimeFrame || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Cibo Sgarro Preferito</p>
                      <p className="text-sm text-white">{clientHistory.profile.preferredCheatFood || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Integratori */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-pink-400 flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Integratori
                  </h3>
                  <div className="space-y-2 pl-6">
                    <div>
                      <p className="text-xs text-slate-400">Formula Gazzella</p>
                      <p className="text-sm text-white">{clientHistory.profile.takingFormulaGazzella || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weight Chart */}
        {weightChartData.length > 0 && (
          <Card className="bg-slate-800 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Andamento Peso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weightChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: any) => [`${value} kg`, 'Peso']}
                    labelFormatter={(label: any) => {
                      const entry = weightChartData.find(d => d.date === label);
                      return entry?.fullDate || label;
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#94a3b8' }} />
                  <Line
                    type="monotone"
                    dataKey="peso"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 5 }}
                    activeDot={{ r: 8 }}
                    name="Peso (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Meal Plans History */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Storico Piani Alimentari ({clientHistory.mealPlans.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientHistory.mealPlans.length === 0 ? (
              <p className="text-slate-400">Nessun piano alimentare generato</p>
            ) : (
              <div className="space-y-4">
                {clientHistory.mealPlans
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((plan) => {
                    const isExpanded = expandedPlans.has(plan.id);
                    const isLoading = loadingPlanDetails.has(plan.id);
                    const fullPlan = planDetails.get(plan.id);
                    
                    return (
                      <div
                        key={plan.id}
                        className="border border-slate-700 rounded-lg p-4 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">{plan.title}</h3>
                            <p className="text-sm text-slate-400">{plan.description}</p>
                          </div>
                          <Badge variant="outline" className="text-emerald-400 border-emerald-400">
                            {format(new Date(plan.createdAt), 'dd MMM yyyy', { locale: it })}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-slate-400">Calorie Target</p>
                            <p className="text-sm font-medium text-white">{plan.targetCalories || 'N/A'} kcal</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Peso Iniziale</p>
                            <p className="text-sm font-medium text-white">{plan.currentWeight || 'N/A'} kg</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Peso Obiettivo</p>
                            <p className="text-sm font-medium text-white">{plan.targetWeight || 'N/A'} kg</p>
                          </div>
                        </div>

                        {/* Toggle Details Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 w-full bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                          onClick={() => togglePlanDetails(plan.id)}
                        >
                          {isLoading ? (
                            <>Caricamento dettagli...</>
                          ) : isExpanded ? (
                            <>
                              <ChevronUp className="mr-2 h-4 w-4" />
                              Nascondi Dettagli
                            </>
                          ) : (
                            <>
                              <ChevronDown className="mr-2 h-4 w-4" />
                              Visualizza Piano Completo (7 Giorni)
                            </>
                          )}
                        </Button>

                        {/* Expanded View with All Days */}
                        {isExpanded && fullPlan?.days && (
                          <div className="mt-6 border-t border-slate-600 pt-6">
                            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                              <Calendar className="mr-2 h-5 w-5" />
                              Piano Settimanale Completo
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {fullPlan.days.map((day: MealPlanDay, index: number) => (
                                <div
                                  key={`${day.day}-${index}`}
                                  className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                                >
                                  <div className="text-center mb-3">
                                    <h5 className="font-bold text-white text-base">{translateDay(day.day)}</h5>
                                    <p className="text-xs text-emerald-400">{day.totalCalories} kcal</p>
                                  </div>
                                  
                                  <div className="space-y-3">
                                    {/* Breakfast */}
                                    <div className="bg-slate-800/70 rounded p-2">
                                      <h6 className="font-semibold text-slate-300 text-xs mb-1 flex items-center">
                                        <span className="mr-1">{mealIcons.breakfast}</span>
                                        Colazione
                                      </h6>
                                      <p className="text-xs text-white leading-relaxed">
                                        {day.meals.breakfast.name}
                                      </p>
                                      <p className="text-xs text-slate-400 mt-1">{day.meals.breakfast.calories} kcal</p>
                                    </div>
                                    
                                    {/* Lunch */}
                                    <div className="bg-slate-800/70 rounded p-2">
                                      <h6 className="font-semibold text-slate-300 text-xs mb-1 flex items-center">
                                        <span className="mr-1">{mealIcons.lunch}</span>
                                        Pranzo
                                      </h6>
                                      <p className="text-xs text-white leading-relaxed">
                                        {day.meals.lunch.name}
                                      </p>
                                      <p className="text-xs text-slate-400 mt-1">{day.meals.lunch.calories} kcal</p>
                                    </div>
                                    
                                    {/* Dinner */}
                                    <div className="bg-slate-800/70 rounded p-2">
                                      <h6 className="font-semibold text-slate-300 text-xs mb-1 flex items-center">
                                        <span className="mr-1">{mealIcons.dinner}</span>
                                        Cena
                                      </h6>
                                      <p className="text-xs text-white leading-relaxed">
                                        {day.meals.dinner.name}
                                      </p>
                                      <p className="text-xs text-slate-400 mt-1">{day.meals.dinner.calories} kcal</p>
                                    </div>
                                    
                                    {/* Snacks */}
                                    {day.meals.snacks && day.meals.snacks.length > 0 && (
                                      <div className="bg-slate-800/70 rounded p-2">
                                        <h6 className="font-semibold text-slate-300 text-xs mb-1 flex items-center">
                                          <span className="mr-1">{mealIcons.snacks}</span>
                                          Spuntini
                                        </h6>
                                        {day.meals.snacks.map((snack: Meal, snackIndex: number) => (
                                          <div key={snackIndex} className="mb-1">
                                            <p className="text-xs text-white leading-relaxed">
                                              {snack.name}
                                            </p>
                                            <p className="text-xs text-slate-400">{snack.calories} kcal</p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recipes */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <ChefHat className="mr-2 h-5 w-5" />
              Ricette Generate ({clientHistory.recipes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientHistory.recipes.length === 0 ? (
              <p className="text-slate-400">Nessuna ricetta generata</p>
            ) : (
              <div className="space-y-4">
                {clientHistory.recipes
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((recipe) => (
                    <div
                      key={recipe.id}
                      className="border border-slate-700 rounded-lg p-4 hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{recipe.title}</h3>
                          {recipe.description && (
                            <p className="text-sm text-slate-400 mt-1">{recipe.description}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-blue-400 border-blue-400 ml-4">
                          {format(new Date(recipe.createdAt), 'dd MMM yyyy', { locale: it })}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                        {recipe.calories && (
                          <div>
                            <p className="text-xs text-slate-400">Calorie</p>
                            <p className="text-sm font-medium text-white">{recipe.calories} kcal</p>
                          </div>
                        )}
                        {recipe.protein && (
                          <div>
                            <p className="text-xs text-slate-400">Proteine</p>
                            <p className="text-sm font-medium text-white">{recipe.protein}g</p>
                          </div>
                        )}
                        {recipe.carbs && (
                          <div>
                            <p className="text-xs text-slate-400">Carboidrati</p>
                            <p className="text-sm font-medium text-white">{recipe.carbs}g</p>
                          </div>
                        )}
                        {recipe.fat && (
                          <div>
                            <p className="text-xs text-slate-400">Grassi</p>
                            <p className="text-sm font-medium text-white">{recipe.fat}g</p>
                          </div>
                        )}
                      </div>
                      {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {recipe.dietaryTags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
