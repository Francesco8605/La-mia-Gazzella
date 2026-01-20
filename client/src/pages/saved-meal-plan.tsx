import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, RefreshCw, Calendar, Target, Scale, TrendingUp, Lightbulb, AlertCircle, Sparkles, Award, Zap, Clock, ShoppingCart, Crown, ArrowRight, Leaf, Printer, Download } from "lucide-react";
import { useState, useRef } from "react";
import html2pdf from "html2pdf.js";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import type { MealPlan } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import formulaGazzellaImage from "@assets/PRODOTTO_formulagazzella_-formatoQUADRATO_1758271113849.webp";

export default function SavedMealPlan() {
  const [match, params] = useRoute("/piano-salvato/:id");
  const mealPlanId = params?.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { hasActiveSubscription, isInTrial } = useSubscription();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const printContentRef = useRef<HTMLDivElement>(null);
  
  // Determina se l'utente può accedere all'offerta (solo premium, non trial)
  const canAccessOffer = hasActiveSubscription && !isInTrial;

  // Funzione per stampare il piano
  const handlePrint = () => {
    window.print();
  };

  // Funzione per scaricare il PDF
  const handleDownloadPdf = async () => {
    if (!printContentRef.current || !mealPlan) return;
    
    setIsGeneratingPdf(true);
    try {
      const element = printContentRef.current;
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `Piano-Gazzella-${format(new Date(mealPlan.createdAt || new Date()), 'dd-MM-yyyy')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      
      await html2pdf().set(opt).from(element).save();
      
      toast({
        title: "✅ PDF Scaricato!",
        description: "Il tuo piano alimentare è stato salvato come PDF"
      });
    } catch (error) {
      console.error("Errore generazione PDF:", error);
      toast({
        title: "❌ Errore",
        description: "Impossibile generare il PDF. Riprova.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const { data: mealPlan, isLoading, error } = useQuery<MealPlan>({
    queryKey: ["/api/meal-plan", mealPlanId],
    enabled: !!mealPlanId,
  });

  // Generate shopping list mutation
  const generateShoppingListMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/shopping-lists/generate/${mealPlanId}`, {
        method: "POST"
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "✅ Lista della Spesa Creata!",
        description: "La tua lista della spesa è pronta"
      });
      setLocation(`/lista-spesa/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "❌ Errore",
        description: error.message || "Impossibile generare la lista della spesa",
        variant: "destructive"
      });
    }
  });

  if (!match) return null;

  // Determina se la cliente è in ricomposizione corporea
  // (peso normale ma vuole perdere peso - NON deve seguire la bilancia)
  const isBodyRecomposition = mealPlan && 
    mealPlan.bmiCategory === "Peso normale" && 
    mealPlan.targetWeight && 
    mealPlan.currentWeight && 
    mealPlan.targetWeight < mealPlan.currentWeight;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-pink-600" />
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Caricamento del tuo piano alimentare...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !mealPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <Scale className="h-12 w-12 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Piano non trovato
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Il piano alimentare richiesto non esiste o non è più disponibile.
              </p>
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Torna alla Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const dayNames = {
    Monday: "Lunedì",
    Tuesday: "Martedì", 
    Wednesday: "Mercoledì",
    Thursday: "Giovedì",
    Friday: "Venerdì",
    Saturday: "Sabato",
    Sunday: "Domenica",
    monday: "Lunedì",
    tuesday: "Martedì", 
    wednesday: "Mercoledì",
    thursday: "Giovedì",
    friday: "Venerdì",
    saturday: "Sabato",
    sunday: "Domenica"
  };

  const mealNames = {
    breakfast: "Colazione",
    lunch: "Pranzo",
    dinner: "Cena",
    snacks: "Spuntini"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Torna alla Home
              </Button>
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Il Tuo Piano Gazzella
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              Piano alimentare personalizzato salvato il {mealPlan.createdAt ? format(new Date(mealPlan.createdAt), 'dd MMMM yyyy', { locale: it }) : 'oggi'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 print:hidden">
            <Button 
              size="lg" 
              onClick={() => generateShoppingListMutation.mutate()}
              disabled={generateShoppingListMutation.isPending}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              data-testid="button-generate-shopping-list"
            >
              {generateShoppingListMutation.isPending ? (
                <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Creazione in corso...</>
              ) : (
                <><ShoppingCart className="w-5 h-5 mr-2" /> Lista della Spesa</>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handlePrint}
              className="border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
              data-testid="button-print-plan"
            >
              <Printer className="w-5 h-5 mr-2" />
              Stampa
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20"
              data-testid="button-download-pdf"
            >
              {isGeneratingPdf ? (
                <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Generazione...</>
              ) : (
                <><Download className="w-5 h-5 mr-2" /> Scarica PDF</>
              )}
            </Button>
            <Link href="/aggiorna-profilo">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                data-testid="button-update-profile"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Aggiorna i tuoi dati
              </Button>
            </Link>
          </div>
        </div>

        {/* Printable Content */}
        <div ref={printContentRef} className="print:bg-white print:p-4">
        {/* Client Profile & Diet Info */}
        {(mealPlan.currentWeight || mealPlan.currentBMI || mealPlan.dietMethod) && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Client Profile */}
            {(mealPlan.currentWeight || mealPlan.currentBMI) && (
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <Target className="w-5 h-5 mr-2 text-green-600" />
                    Profilo Personalizzato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {mealPlan.currentWeight && (
                      <div className="text-center p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Peso Attuale</p>
                        <p className="text-xl font-bold text-green-600">{mealPlan.currentWeight}kg</p>
                      </div>
                    )}
                    {mealPlan.targetWeight && (
                      <div className="text-center p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Obiettivo</p>
                        <p className="text-xl font-bold text-blue-600">{mealPlan.targetWeight}kg</p>
                      </div>
                    )}
                    {mealPlan.currentBMI && (
                      <div className="text-center p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">BMI Attuale</p>
                        <p className="text-xl font-bold text-purple-600">{mealPlan.currentBMI}</p>
                      </div>
                    )}
                    {mealPlan.weightToLose && !isBodyRecomposition && (
                      <div className="text-center p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Da Perdere</p>
                        <p className="text-xl font-bold text-orange-600">{mealPlan.weightToLose}kg</p>
                      </div>
                    )}
                  </div>
                  {isBodyRecomposition && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-l-4 border-purple-500">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-1">
                            💪 Ricomposizione Corporea
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            Sei già in un peso sano! Non serve usare la bilancia come riferimento. 
                            Il tuo obiettivo è <strong>trasformare massa grassa in massa magra</strong> e ritrovare tonicità.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {mealPlan.bmiCategory && !isBodyRecomposition && (
                    <div className="text-center">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        {mealPlan.bmiCategory}
                      </Badge>
                    </div>
                  )}
                  {mealPlan.timeToGoal && !isBodyRecomposition && (
                    <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">⏱️ {mealPlan.timeToGoal}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Diet Explanation */}
            {(mealPlan.dietMethod || mealPlan.expectedResults) && (
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <Scale className="w-5 h-5 mr-2 text-amber-600" />
                    Metodo Gazzella
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mealPlan.dietMethod && (
                    <p className="text-gray-700 dark:text-gray-300 font-medium">{mealPlan.dietMethod}</p>
                  )}
                  {mealPlan.dietPrinciples && Array.isArray(mealPlan.dietPrinciples) && mealPlan.dietPrinciples.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">Principi:</p>
                      <ul className="space-y-1">
                        {mealPlan.dietPrinciples.slice(0, 3).map((principle, index) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                            <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {principle}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {mealPlan.expectedResults && (
                    <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Risultati Attesi:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{mealPlan.expectedResults}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Diet Explanation */}
            {(mealPlan.dietMethod || mealPlan.dietPrinciples || mealPlan.expectedResults) && (
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <Scale className="w-5 h-5 mr-2 text-purple-600" />
                    Metodo Gazzella
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mealPlan.dietMethod && (
                    <div className="p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                      <p className="font-semibold text-purple-800 dark:text-purple-200">{mealPlan.dietMethod}</p>
                    </div>
                  )}
                  
                  {mealPlan.dietPrinciples && Array.isArray(mealPlan.dietPrinciples) && mealPlan.dietPrinciples.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Principi Fondamentali:</h4>
                      <ul className="space-y-1">
                        {mealPlan.dietPrinciples.map((principle, index) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                            <span className="text-purple-500 mr-2">•</span>
                            {principle}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {mealPlan.expectedResults && (
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Risultati Attesi:</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                        {mealPlan.expectedResults}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Enhanced Gazzella Advanced Guide Section */}
        {(mealPlan.scientificIdealWeight || mealPlan.progressiveGoals || mealPlan.dataUpdateInstructions) && (
          <div className="mb-12">
            {/* Section Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 shadow-2xl animate-pulse">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-4xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                {isBodyRecomposition ? "Il Tuo Percorso di Trasformazione" : "Guida Avanzata Gazzella"}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {isBodyRecomposition 
                  ? "Focus sulla ricomposizione corporea e il benessere, non sulla bilancia"
                  : "Precisione scientifica per il tuo percorso di trasformazione nutrizionale"
                }
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-purple-600 mx-auto rounded-full mt-3"></div>
            </div>

            {isBodyRecomposition ? (
              // Messaggio speciale per ricomposizione corporea
              <div className="max-w-4xl mx-auto">
                <Card className="group relative overflow-hidden backdrop-blur-md bg-gradient-to-br from-purple-50/80 via-pink-50/60 to-rose-50/80 dark:from-purple-900/20 dark:via-pink-900/15 dark:to-rose-900/20 border-0 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-pink-400/5 to-rose-400/10 transition-all duration-500" />
                  
                  <CardHeader className="relative z-10 pb-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                        <Sparkles className="w-3 h-3 mr-1" />
                        RICOMPOSIZIONE CORPOREA
                      </Badge>
                    </div>
                    <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                      🌸 Non Serve Guardare la Bilancia
                    </CardTitle>
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      Sei già in un peso sano e perfetto per la tua salute. Il tuo corpo ha bisogno di una trasformazione diversa.
                    </p>
                  </CardHeader>
                  
                  <CardContent className="relative z-10 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-6 bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-purple-200/50">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                            <Target className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Il Vero Obiettivo</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                              Non perdere peso sulla bilancia, ma <strong>trasformare massa grassa in massa magra</strong>. 
                              Il numero sulla bilancia potrebbe anche restare uguale!
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-purple-200/50">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg">
                            <Sparkles className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Cosa Vedrai</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                              Ritroverai <strong>tonicità in tutto il corpo</strong>, sentirai i vestiti più comodi, 
                              e vedrai una silhouette più definita e armoniosa.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-600" />
                        I Tuoi Indicatori di Successo
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <span className="text-2xl">💪</span>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>Più energia e forza:</strong> Ti sentirai più forte e vitale nelle attività quotidiane
                          </p>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-2xl">👗</span>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>Vestiti più comodi:</strong> La taglia potrebbe scendere anche se il peso resta uguale
                          </p>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-2xl">✨</span>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>Corpo più tonico:</strong> Braccia, gambe, addome - tutto più definito e armonioso
                          </p>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-2xl">🌸</span>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>Benessere generale:</strong> Miglioramento dell'umore, del sonno e della digestione
                          </p>
                        </li>
                      </ul>
                    </div>

                    <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border-l-4 border-amber-500">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5" />
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          <strong>Consiglio importante:</strong> Usa lo specchio e come ti senti nei vestiti come riferimento, 
                          non la bilancia. Fai foto di progresso ogni 2-3 settimane per vedere la trasformazione reale.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
              {/* Scientific Ideal Weight Card */}
              {mealPlan.scientificIdealWeight ? (
                <Card className="group relative overflow-hidden backdrop-blur-md bg-gradient-to-br from-cyan-50/80 via-teal-50/60 to-blue-50/80 dark:from-cyan-900/20 dark:via-teal-900/15 dark:to-blue-900/20 border-0 shadow-2xl hover:shadow-cyan-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-teal-400/5 to-blue-400/10 group-hover:from-cyan-400/20 group-hover:via-teal-400/10 group-hover:to-blue-400/20 transition-all duration-500" />
                  
                  {/* Floating Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white animate-bounce">
                      <Award className="w-3 h-3 mr-1" />
                      SCIENTIFIC
                    </Badge>
                  </div>
                  
                  <CardHeader className="relative z-10 pb-4">
                    <CardTitle className="flex items-center text-gray-900 dark:text-white group-hover:text-cyan-600 transition-colors">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 mr-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      Peso Forma Calcolato
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="relative z-10 space-y-4">
                    <div className="text-center p-6 bg-gradient-to-br from-white/70 to-cyan-50/70 dark:from-gray-800/70 dark:to-cyan-900/30 rounded-2xl shadow-inner border border-cyan-200/50">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Peso Ideale Scientifico</p>
                      <p className="text-4xl font-black bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">{mealPlan.scientificIdealWeight}kg</p>
                      <div className="mt-2 flex items-center justify-center gap-2 text-xs text-cyan-600 font-medium">
                        <Zap className="w-3 h-3" />
                        Formula Robinson
                      </div>
                    </div>
                    
                    {mealPlan.progressiveGoals?.idealWeightCalculation && (
                      <div className="p-4 bg-gradient-to-r from-cyan-50/80 to-teal-50/80 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-xl border-l-4 border-cyan-500">
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{mealPlan.progressiveGoals.idealWeightCalculation}</p>
                      </div>
                    )}
                    
                    {mealPlan.progressiveGoals?.comparisonMessage && (
                      <div className={`p-4 rounded-xl border-l-4 ${mealPlan.scientificIdealWeight === mealPlan.targetWeight 
                        ? 'bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 border-green-500 text-green-800 dark:text-green-200' 
                        : 'bg-gradient-to-r from-amber-50/80 to-yellow-50/80 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-500 text-amber-800 dark:text-amber-200'
                      }`}>
                        <p className="text-sm font-medium">{mealPlan.progressiveGoals.comparisonMessage}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="group relative overflow-hidden backdrop-blur-md bg-gradient-to-br from-gray-50/80 via-slate-50/60 to-gray-100/80 dark:from-gray-800/40 dark:via-slate-800/30 dark:to-gray-900/40 border-2 border-dashed border-gray-300 dark:border-gray-600 shadow-lg transition-all duration-500">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 rounded-full bg-gray-200 dark:bg-gray-700 mb-4">
                      <Target className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Peso Forma Calcolato</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Genera un nuovo piano per vedere<br />il tuo peso ideale scientifico</p>
                  </CardContent>
                </Card>
              )}

              {/* Progressive Steps Card */}
              {mealPlan.progressiveGoals?.progressiveSteps && mealPlan.progressiveGoals.progressiveSteps.length > 0 ? (
                <Card className="group relative overflow-hidden backdrop-blur-md bg-gradient-to-br from-emerald-50/80 via-green-50/60 to-teal-50/80 dark:from-emerald-900/20 dark:via-green-900/15 dark:to-teal-900/20 border-0 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-green-400/5 to-teal-400/10 group-hover:from-emerald-400/20 group-hover:via-green-400/10 group-hover:to-teal-400/20 transition-all duration-500" />
                  
                  {/* Floating Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white animate-pulse">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      PROGRESSIVO
                    </Badge>
                  </div>
                  
                  <CardHeader className="relative z-10 pb-4">
                    <CardTitle className="flex items-center text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 mr-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      Obiettivi Progressivi
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="relative z-10 space-y-3 max-h-80 overflow-y-auto">
                    {mealPlan.progressiveGoals.progressiveSteps.map((step, index) => (
                      <div key={index} className="group/step p-4 bg-gradient-to-r from-white/70 to-emerald-50/70 dark:from-gray-800/70 dark:to-emerald-900/30 rounded-2xl border border-emerald-200/50 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-102">
                        <div className="flex justify-between items-start mb-3">
                          <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold px-3 py-1">
                            <Award className="w-3 h-3 mr-1" />
                            Fase {step.phaseNumber}
                          </Badge>
                          <div className="text-right">
                            <span className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">{step.targetWeight}</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">peso target</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">{step.description}</p>
                        <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold mb-2">
                          <Clock className="w-3 h-3" />
                          {step.duration}
                        </div>
                        {step.advice && (
                          <div className="p-3 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-lg border-l-2 border-emerald-400">
                            <p className="text-xs text-gray-600 dark:text-gray-400 italic">{step.advice}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <Card className="group relative overflow-hidden backdrop-blur-md bg-gradient-to-br from-gray-50/80 via-slate-50/60 to-gray-100/80 dark:from-gray-800/40 dark:via-slate-800/30 dark:to-gray-900/40 border-2 border-dashed border-gray-300 dark:border-gray-600 shadow-lg transition-all duration-500">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 rounded-full bg-gray-200 dark:bg-gray-700 mb-4">
                      <TrendingUp className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Obiettivi Progressivi</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Step intermedi personalizzati<br />per raggiungere il tuo obiettivo</p>
                  </CardContent>
                </Card>
              )}

              {/* Data Update Instructions Card */}
              {mealPlan.dataUpdateInstructions ? (
                <Card className="group relative overflow-hidden backdrop-blur-md bg-gradient-to-br from-rose-50/80 via-pink-50/60 to-red-50/80 dark:from-rose-900/20 dark:via-pink-900/15 dark:to-red-900/20 border-0 shadow-2xl hover:shadow-rose-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-400/10 via-pink-400/5 to-red-400/10 group-hover:from-rose-400/20 group-hover:via-pink-400/10 group-hover:to-red-400/20 transition-all duration-500" />
                  
                  {/* Floating Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-gradient-to-r from-rose-500 to-pink-600 text-white animate-bounce">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      IMPORTANTE
                    </Badge>
                  </div>
                  
                  <CardHeader className="relative z-10 pb-4">
                    <CardTitle className="flex items-center text-gray-900 dark:text-white group-hover:text-rose-600 transition-colors">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 mr-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      Guida Aggiornamento
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="relative z-10 space-y-4 max-h-80 overflow-y-auto">
                    <div className="p-4 bg-gradient-to-r from-rose-100/80 to-pink-100/80 dark:from-rose-900/30 dark:to-pink-900/30 rounded-2xl border-l-4 border-rose-500 shadow-inner">
                      <p className="font-bold text-rose-800 dark:text-rose-200 text-sm">{mealPlan.dataUpdateInstructions.importance}</p>
                    </div>
                    
                    <div className="grid gap-4">
                      <div className="p-4 bg-gradient-to-br from-white/70 to-amber-50/70 dark:from-gray-800/70 dark:to-amber-900/20 rounded-xl border border-amber-200/50">
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                          <Lightbulb className="w-4 h-4 mr-2 text-amber-500" />
                          Quando Aggiornare:
                        </h4>
                        <ul className="space-y-2">
                          {mealPlan.dataUpdateInstructions.whenToUpdate.map((item, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                              <span className="w-2 h-2 bg-rose-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-br from-white/70 to-blue-50/70 dark:from-gray-800/70 dark:to-blue-900/20 rounded-xl border border-blue-200/50">
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                          <Target className="w-4 h-4 mr-2 text-blue-500" />
                          Cosa Aggiornare:
                        </h4>
                        <ul className="space-y-2">
                          {mealPlan.dataUpdateInstructions.whatToUpdate.map((item, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                              <span className="w-2 h-2 bg-rose-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-l-4 border-blue-500">
                      <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Perché è Importante:
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">{mealPlan.dataUpdateInstructions.whyImportant}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="group relative overflow-hidden backdrop-blur-md bg-gradient-to-br from-gray-50/80 via-slate-50/60 to-gray-100/80 dark:from-gray-800/40 dark:via-slate-800/30 dark:to-gray-900/40 border-2 border-dashed border-gray-300 dark:border-gray-600 shadow-lg transition-all duration-500">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 rounded-full bg-gray-200 dark:bg-gray-700 mb-4">
                      <AlertCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Guida Aggiornamento</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Istruzioni personalizzate su<br />quando e come aggiornare i dati</p>
                  </CardContent>
                </Card>
              )}
            </div>
            )}
          </div>
        )}

        {/* Potenzia i Tuoi Risultati - Formula Gazzella Banner */}
        {canAccessOffer && (
          <Card className="mb-8 overflow-hidden backdrop-blur-md bg-gradient-to-br from-emerald-50/90 via-green-50/80 to-teal-50/90 dark:from-emerald-900/40 dark:via-green-900/30 dark:to-teal-900/40 border-2 border-emerald-300 dark:border-emerald-700 shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-2xl font-bold text-slate-800 dark:text-white">
                <Zap className="w-6 h-6 mr-2 text-emerald-600 dark:text-emerald-400" />
                💎 Potenzia i Tuoi Risultati
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                Accelera il metabolismo e ottieni risultati più rapidi con Formula Gazzella
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img 
                      src={String(formulaGazzellaImage)} 
                      alt="Formula Gazzella - Acceleratore del Metabolismo" 
                      className="w-28 h-28 md:w-36 md:h-36 object-contain rounded-2xl shadow-lg"
                      data-testid="img-formula-gazzella-saved-plan"
                    />
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
                      SOLO 20€
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                    Completa il tuo percorso con Formula Gazzella
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
                    Integratore naturale con <strong className="text-emerald-600 dark:text-emerald-400">Meliloto e Tarassaco</strong> per 
                    drenaggio, riduzione gonfiore e accelerazione metabolica.
                  </p>

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-4 mb-4">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">
                      🎁 Offerta Esclusiva Premium:
                    </p>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      <strong className="text-emerald-600 dark:text-emerald-400 text-base">20€ invece di 49€</strong> - 
                      Risparmi 29€! = <strong className="text-red-600 dark:text-red-400">TOTALE 49€ invece di 78€!</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="flex items-center text-xs text-slate-600 dark:text-slate-300">
                      <Leaf className="h-3 w-3 text-emerald-500 mr-1" />
                      85% attivi
                    </div>
                    <div className="flex items-center text-xs text-slate-600 dark:text-slate-300">
                      <Leaf className="h-3 w-3 text-emerald-500 mr-1" />
                      100% naturale
                    </div>
                    <div className="flex items-center text-xs text-slate-600 dark:text-slate-300">
                      <Leaf className="h-3 w-3 text-emerald-500 mr-1" />
                      Per menopausa
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link href="/offerta-esclusiva" className="inline-block">
                    <Button
                      className="px-4 py-2 text-sm font-semibold rounded-lg shadow-lg transition-all duration-300 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                      data-testid="button-formula-gazzella-saved-plan"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      <span className="mr-2">Scopri l'Offerta</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plan Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-gray-900 dark:text-white">
                <Target className="w-5 h-5 mr-2 text-pink-600" />
                Obiettivo Calorico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-600">
                {mealPlan.targetCalories}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">kcal/giorno</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-gray-900 dark:text-white">
                <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                Durata Piano
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">7</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">giorni</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-gray-900 dark:text-white">
                <Scale className="w-5 h-5 mr-2 text-green-600" />
                Macronutrienti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Proteine</span>
                  <span className="font-semibold text-green-600">{mealPlan.targetProtein}g</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Carboidrati</span>
                  <span className="font-semibold text-blue-600">{mealPlan.targetCarbs}g</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Grassi</span>
                  <span className="font-semibold text-orange-600">{mealPlan.targetFat}g</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Meal Plans */}
        <div className="space-y-8">
          {mealPlan.days?.map((day, index) => (
            <Card key={`${day.day}-${index}`} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-gray-900 dark:text-white">
                    {dayNames[day.day.toLowerCase() as keyof typeof dayNames]}
                  </CardTitle>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {day.totalCalories} kcal
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {/* Breakfast */}
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
                      {mealNames.breakfast}
                    </h4>
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                      <p className="text-gray-800 dark:text-gray-200 mb-2" data-testid={`meal-breakfast-${index}`}>
                        {day.meals.breakfast.name}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <span>{day.meals.breakfast.calories} kcal</span>
                        <span>P: {day.meals.breakfast.protein}g</span>
                        <span>C: {day.meals.breakfast.carbs}g</span>
                        <span>G: {day.meals.breakfast.fat}g</span>
                      </div>
                    </div>
                  </div>

                  {/* Snacks */}
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
                      Spuntino Mattino
                    </h4>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <p className="text-gray-800 dark:text-gray-200 mb-2" data-testid={`snack-morning-${index}`}>
                        {day.meals.snacks[0]?.name}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <span>{day.meals.snacks[0]?.calories} kcal</span>
                        <span>P: {day.meals.snacks[0]?.protein}g</span>
                        <span>C: {day.meals.snacks[0]?.carbs}g</span>
                        <span>G: {day.meals.snacks[0]?.fat}g</span>
                      </div>
                    </div>
                  </div>

                  {/* Lunch */}
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
                      {mealNames.lunch}
                    </h4>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <p className="text-gray-800 dark:text-gray-200 mb-2" data-testid={`meal-lunch-${index}`}>
                        {day.meals.lunch.name}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <span>{day.meals.lunch.calories} kcal</span>
                        <span>P: {day.meals.lunch.protein}g</span>
                        <span>C: {day.meals.lunch.carbs}g</span>
                        <span>G: {day.meals.lunch.fat}g</span>
                      </div>
                    </div>
                  </div>

                  {/* Afternoon Snack */}
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
                      Merenda Pomeriggio
                    </h4>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <p className="text-gray-800 dark:text-gray-200 mb-2" data-testid={`snack-afternoon-${index}`}>
                        {day.meals.snacks[1]?.name}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <span>{day.meals.snacks[1]?.calories} kcal</span>
                        <span>P: {day.meals.snacks[1]?.protein}g</span>
                        <span>C: {day.meals.snacks[1]?.carbs}g</span>
                        <span>G: {day.meals.snacks[1]?.fat}g</span>
                      </div>
                    </div>
                  </div>

                  {/* Dinner */}
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
                      {mealNames.dinner}
                    </h4>
                    <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
                      <p className="text-gray-800 dark:text-gray-200 mb-2" data-testid={`meal-dinner-${index}`}>
                        {day.meals.dinner.name}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <span>{day.meals.dinner.calories} kcal</span>
                        <span>P: {day.meals.dinner.protein}g</span>
                        <span>C: {day.meals.dinner.carbs}g</span>
                        <span>G: {day.meals.dinner.fat}g</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        </div>
        {/* End Printable Content */}

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 print:hidden">
          <Link href="/aggiorna-profilo">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              data-testid="button-update-profile-bottom"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Aggiorna i tuoi dati
            </Button>
          </Link>
          
          <Link href="/genera-piano">
            <Button 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto"
              data-testid="button-generate-new-plan"
            >
              <Target className="w-5 h-5 mr-2" />
              Genera nuovo piano
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}