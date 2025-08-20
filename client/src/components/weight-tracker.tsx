import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Scale, TrendingUp, TrendingDown, Plus, RefreshCw, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from "date-fns";
import { it } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { WeightEntry } from "@shared/schema";

export default function WeightTracker() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [newWeight, setNewWeight] = useState("");
  const [isAddingWeight, setIsAddingWeight] = useState(false);

  // Fetch weight entries
  const { data: weightEntries = [], isLoading, error, refetch } = useQuery<WeightEntry[]>({
    queryKey: ["/api/weight-entries"],
    enabled: !!user?.id,
    refetchInterval: 5000, // Refresh every 5 seconds to show updates
  });

  // Add weight entry mutation
  const addWeightMutation = useMutation({
    mutationFn: async (weight: number) => {
      console.log("Adding weight:", weight);
      return apiRequest("POST", "/api/weight-entries", {
        weight,
        date: new Date().toISOString(),
        notes: ""
      });
    },
    onSuccess: () => {
      // Invalidate multiple related queries to ensure full refresh
      queryClient.invalidateQueries({ queryKey: ["/api/weight-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-profiles/current"] });
      
      // Force refetch to immediately update chart
      refetch();
      
      setNewWeight("");
      setIsAddingWeight(false);
      toast({
        title: "Peso aggiunto",
        description: "Il tuo peso è stato registrato con successo",
      });
    },
    onError: (error) => {
      console.error("Weight submission error:", error);
      toast({
        title: "Errore",
        description: `Impossibile registrare il peso. ${error.message || "Riprova."}`,
        variant: "destructive",
      });
    },
  });

  const handleAddWeight = () => {
    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight < 30 || weight > 300) {
      toast({
        title: "Peso non valido",
        description: "Inserisci un peso tra 30 e 300 kg",
        variant: "destructive",
      });
      return;
    }
    addWeightMutation.mutate(weight);
  };

  // Get recent entries for display
  const recentEntries = weightEntries.slice(-7).reverse();
  const latestEntry = weightEntries[weightEntries.length - 1];
  const previousEntry = weightEntries[weightEntries.length - 2];
  
  const weightTrend = latestEntry && previousEntry 
    ? latestEntry.weight - previousEntry.weight
    : 0;

  // Prepare data for chart (last 30 entries)
  const chartData = weightEntries
    .slice(-30) // Last 30 entries
    .map(entry => ({
      date: format(new Date(entry.date), 'dd/MM', { locale: it }),
      peso: entry.weight,
      fullDate: format(new Date(entry.date), 'dd MMM yyyy', { locale: it })
    }));

  if (error) {
    return (
      <Card className="glass-morphism max-w-4xl mx-auto">
        <CardContent className="pt-8 text-center">
          <RefreshCw className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            Errore di Caricamento
          </h3>
          <p className="text-slate-600">
            Impossibile caricare i dati del peso. Riprova più tardi.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quick Add Weight */}
      <Card className="glass-morphism">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
            <Scale className="w-6 h-6 text-red-600" />
            Aggiorna Peso Oggi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isAddingWeight ? (
            <div className="text-center">
              <p className="text-slate-600 mb-4">
                Registra il tuo peso di oggi per monitorare i progressi
              </p>
              <Button 
                onClick={() => setIsAddingWeight(true)}
                className="bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white"
                data-testid="add-weight-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi Peso
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="30"
                  max="300"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="es. 65.5"
                  className="mt-1"
                  data-testid="weight-input"
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleAddWeight}
                  disabled={addWeightMutation.isPending}
                  className="bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white"
                  data-testid="save-weight-button"
                >
                  {addWeightMutation.isPending ? "Salvataggio..." : "Salva"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsAddingWeight(false);
                    setNewWeight("");
                  }}
                  data-testid="cancel-weight-button"
                >
                  Annulla
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weight Summary */}
      {latestEntry && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-morphism">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {latestEntry.weight} kg
              </div>
              <p className="text-sm text-slate-600">Peso Attuale</p>
              <p className="text-xs text-slate-500 mt-1">
                {format(new Date(latestEntry.date), 'dd MMM yyyy', { locale: it })}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-morphism">
            <CardContent className="pt-6 text-center">
              <div className={`text-3xl font-bold mb-2 ${
                weightTrend > 0 ? 'text-orange-600' : 
                weightTrend < 0 ? 'text-green-600' : 'text-slate-600'
              }`}>
                {weightTrend > 0 ? '+' : ''}{weightTrend.toFixed(1)} kg
              </div>
              <p className="text-sm text-slate-600 flex items-center justify-center gap-1">
                {weightTrend > 0 ? <TrendingUp className="w-4 h-4" /> : 
                 weightTrend < 0 ? <TrendingDown className="w-4 h-4" /> : null}
                Variazione
              </p>
              <p className="text-xs text-slate-500 mt-1">Ultima settimana</p>
            </CardContent>
          </Card>

          <Card className="glass-morphism">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {weightEntries.length}
              </div>
              <p className="text-sm text-slate-600">Misurazioni</p>
              <p className="text-xs text-slate-500 mt-1">Totali registrate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800">
              Ultime Misurazioni
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEntries.map((entry, index) => {
                const previousEntry = weightEntries[weightEntries.indexOf(entry) - 1];
                const dayTrend = previousEntry ? entry.weight - previousEntry.weight : 0;
                
                return (
                  <div 
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-white/50 rounded-lg"
                    data-testid={`weight-entry-${entry.id}`}
                  >
                    <div>
                      <div className="font-semibold text-slate-800">
                        {entry.weight} kg
                      </div>
                      <div className="text-sm text-slate-600">
                        {format(new Date(entry.date), 'EEEE dd MMM', { locale: it })}
                      </div>
                    </div>
                    {dayTrend !== 0 && (
                      <Badge 
                        variant={dayTrend > 0 ? "destructive" : "default"}
                        className={dayTrend < 0 ? "bg-green-100 text-green-700" : ""}
                      >
                        {dayTrend > 0 ? '+' : ''}{dayTrend.toFixed(1)} kg
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && weightEntries.length === 0 && (
        <Card className="glass-morphism text-center">
          <CardContent className="pt-8 pb-8">
            <Scale className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Inizia il Monitoraggio
            </h3>
            <p className="text-slate-600 mb-6">
              Registra il tuo primo peso per iniziare a monitorare i progressi
            </p>
            <Button 
              onClick={() => setIsAddingWeight(true)}
              className="bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Primo Peso
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Weight Progress Chart */}
      {chartData.length >= 2 && (
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
              <BarChart3 className="w-6 h-6 text-green-600" />
              Andamento del Peso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    domain={['dataMin - 2', 'dataMax + 2']}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
                            <p className="font-semibold text-slate-800">{data.fullDate}</p>
                            <p className="text-red-600 font-bold">
                              Peso: {data.peso} kg
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="peso" 
                    stroke="#dc2626" 
                    strokeWidth={3}
                    dot={{ fill: '#dc2626', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: '#dc2626', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-slate-600">
                {chartData.length > 1 && (
                  <>
                    Variazione totale: <span className={`font-semibold ${
                      chartData[chartData.length - 1].peso - chartData[0].peso >= 0 
                        ? 'text-orange-600' 
                        : 'text-green-600'
                    }`}>
                      {chartData[chartData.length - 1].peso - chartData[0].peso >= 0 ? '+' : ''}
                      {(chartData[chartData.length - 1].peso - chartData[0].peso).toFixed(1)} kg
                    </span>
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Regeneration CTA */}
      {latestEntry && (
        <Card className="glass-morphism bg-gradient-to-r from-red-50 to-green-50">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Aggiorna il Tuo Piano Nutrizionale
            </h3>
            <p className="text-slate-600 mb-4">
              Con i nuovi dati del peso, possiamo rigenerare un piano ancora più personalizzato
            </p>
            <Link href="/genera-piano">
              <Button 
                className="bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white"
                data-testid="regenerate-plan-button"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Rigenera Piano Alimentare
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}