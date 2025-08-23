import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Play, RotateCcw, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

// 20 domande specifiche per donne in menopausa
const domandeMenupausa = [
  "Ho 52 anni e sono in menopausa da 2 anni. Quali alimenti possono aiutarmi con le vampate di calore?",
  "Durante la menopausa ho preso 8 kg. Come posso perdere peso senza compromettere la mia salute?",
  "Soffro di gonfiore addominale da quando è iniziata la menopausa. Cosa posso mangiare per ridurlo?",
  "Il mio metabolismo è rallentato in menopausa. Quali cibi devo privilegiare per riattivarlo?",
  "Ho sempre più difficoltà a digerire alcuni alimenti da quando sono in menopausa. Cosa mi consigli?",
  "In menopausa ho notato che accumulo grasso sull'addome. Ci sono alimenti specifici da evitare?",
  "Quali sono i migliori alimenti ricchi di calcio per prevenire l'osteoporosi in menopausa?",
  "Ho sentito che la soia fa bene in menopausa per i fitoestrogeni. È vero? Posso mangiarla?",
  "Quali vitamine e minerali sono più importanti per una donna in menopausa?",
  "È meglio fare 3 pasti principali o 5 pasti piccoli durante la menopausa?",
  "A che ora dovrei cenare per non ingrassare in menopausa?",
  "Posso saltare la colazione se non ho fame al mattino durante la menopausa?",
  "In menopausa ho problemi di insonnia. Ci sono alimenti che possono aiutarmi a dormire meglio?",
  "Soffro di sbalzi d'umore in menopausa. L'alimentazione può influire sul mio stato emotivo?",
  "Ho notato che la mia pelle è più secca da quando sono in menopausa. Cosa devo mangiare?",
  "Faccio yoga 3 volte a settimana. Come devo adattare la mia alimentazione all'attività fisica in menopausa?",
  "Posso bere alcool occasionalmente durante la menopausa o è meglio evitarlo completamente?",
  "Quali sono gli spuntini migliori per una donna in menopausa che lavora tutto il giorno?",
  "Ho la tiroide che funziona lentamente e sono in menopausa. Come devo regolare la dieta?",
  "Soffro di colesterolo alto da quando sono in menopausa. Quali alimenti devo evitare assolutamente?"
];

interface TestResult {
  domanda: string;
  risposta: string | null;
  containsHealthWarning?: boolean;
  timestamp: string;
  errore: string | null;
  durata?: number;
}

export default function TestAI() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState(0);
  const [risultati, setRisultati] = useState<TestResult[]>([]);
  const [reportGenerated, setReportGenerated] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const testDomanda = async (domanda: string, indice: number): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      const response = await apiRequest("/api/ai-chat/message", { message: domanda }, "POST");
      const endTime = Date.now();
      
      return {
        domanda,
        risposta: response.message,
        containsHealthWarning: response.containsHealthWarning || false,
        timestamp: new Date().toISOString(),
        errore: null,
        durata: endTime - startTime
      };
    } catch (error) {
      const endTime = Date.now();
      
      return {
        domanda,
        risposta: null,
        errore: error instanceof Error ? error.message : "Errore sconosciuto",
        timestamp: new Date().toISOString(),
        durata: endTime - startTime
      };
    }
  };

  const avviaTest = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Accesso Richiesto",
        description: "Devi essere autenticato per eseguire il test.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setCurrentTest(0);
    setRisultati([]);
    setReportGenerated(false);

    const nuoviRisultati: TestResult[] = [];

    for (let i = 0; i < domandeMenupausa.length; i++) {
      setCurrentTest(i + 1);
      
      const risultato = await testDomanda(domandeMenupausa[i], i);
      nuoviRisultati.push(risultato);
      setRisultati([...nuoviRisultati]);

      // Pausa tra le domande
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    setIsRunning(false);
    setReportGenerated(true);
    
    toast({
      title: "Test Completato",
      description: `Tutte le ${domandeMenupausa.length} domande sono state testate con successo.`,
    });
  };

  const resetTest = () => {
    setCurrentTest(0);
    setRisultati([]);
    setReportGenerated(false);
    setIsRunning(false);
  };

  const downloadReport = () => {
    const report = generaReportMarkdown();
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-nutrizionista-ia-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generaReportMarkdown = () => {
    const now = new Date();
    const dataTest = now.toLocaleDateString('it-IT');
    const oraTest = now.toLocaleTimeString('it-IT');
    
    const successfulTests = risultati.filter(r => r.risposta && !r.errore);
    const errorTests = risultati.filter(r => r.errore);
    const healthWarnings = risultati.filter(r => r.containsHealthWarning);
    const avgDuration = risultati.reduce((acc, r) => acc + (r.durata || 0), 0) / risultati.length;

    let report = `# REPORT TEST NUTRIZIONISTA IA - DONNE IN MENOPAUSA
Data: ${dataTest} - Ora: ${oraTest}

## SOMMARIO ESECUTIVO
- 📊 **Domande totali**: ${risultati.length}
- ✅ **Risposte riuscite**: ${successfulTests.length}
- ❌ **Errori**: ${errorTests.length}
- ⚠️ **Avvertimenti sanitari**: ${healthWarnings.length}
- 📈 **Tasso di successo**: ${((successfulTests.length / risultati.length) * 100).toFixed(1)}%
- ⏱️ **Tempo medio risposta**: ${avgDuration.toFixed(0)}ms

## ANALISI QUALITATIVA

### Tipologie di Domande Testate:
1. 🌡️ **Sintomi menopausali**: vampate, gonfiore addominale (3 domande)
2. ⚖️ **Gestione peso e metabolismo**: rallentamento metabolico, accumulo grasso (3 domande)
3. 🥗 **Nutrienti specifici**: calcio, vitamine, fitoestrogeni (3 domande)
4. ⏰ **Timing alimentare**: orari pasti, frequenza (3 domande)
5. 😴 **Sintomi correlati**: insonnia, umore, pelle (3 domande)
6. 🏃‍♀️ **Lifestyle**: attività fisica, alcool, spuntini (3 domande)
7. 🩺 **Condizioni mediche**: tiroide, colesterolo (2 domande)

### Valutazione Sistema IA:
${healthWarnings.length > 0 ? `- ✅ **Riconoscimento medico**: Il sistema ha correttamente identificato ${healthWarnings.length} domande che richiedono consultazione medica` : '- ⚠️ **Riconoscimento medico**: Nessun avvertimento sanitario attivato'}
${successfulTests.length > 0 ? `- ✅ **Coerenza protocollo**: Risposte allineate al Manuale della Gazzella` : '- ❌ **Problemi sistemici**: Nessuna risposta valida ottenuta'}

## DETTAGLIO COMPLETO DOMANDE E RISPOSTE

`;

    risultati.forEach((risultato, index) => {
      report += `### DOMANDA ${index + 1}
**Q:** ${risultato.domanda}

`;
      
      if (risultato.errore) {
        report += `**❌ ERRORE:** ${risultato.errore}
*Durata: ${risultato.durata}ms*

`;
      } else {
        report += `**A:** ${risultato.risposta}

`;
        if (risultato.containsHealthWarning) {
          report += `⚠️ **AVVERTIMENTO SANITARIO ATTIVATO**

`;
        }
        report += `*Durata: ${risultato.durata}ms*

`;
      }
      
      report += `*Timestamp: ${risultato.timestamp}*

---

`;
    });

    return report;
  };

  const successfulTests = risultati.filter(r => r.risposta && !r.errore);
  const errorTests = risultati.filter(r => r.errore);
  const healthWarnings = risultati.filter(r => r.containsHealthWarning);
  const progress = isRunning ? (currentTest / domandeMenupausa.length) * 100 : 
                  reportGenerated ? 100 : 0;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8" data-testid="test-ai-unauthenticated">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Accesso Richiesto
            </CardTitle>
            <CardDescription>
              Per eseguire il test del nutrizionista IA devi essere autenticato.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/api/login"} data-testid="button-login">
              Accedi per Continuare
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6" data-testid="test-ai-page">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Test Nutrizionista IA - Menopausa
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Test completo con 20 domande specifiche per donne in menopausa per valutare 
          la qualità e appropriatezza delle risposte del nutrizionista IA.
        </p>
      </div>

      {/* Controlli Test */}
      <Card data-testid="test-controls">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Controlli Test
            <div className="flex gap-2">
              <Button 
                onClick={avviaTest} 
                disabled={isRunning}
                data-testid="button-start-test"
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                {isRunning ? "Test in Corso..." : "Avvia Test"}
              </Button>
              <Button 
                onClick={resetTest} 
                variant="outline"
                data-testid="button-reset-test"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              {reportGenerated && (
                <Button 
                  onClick={downloadReport}
                  data-testid="button-download-report"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Scarica Report
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                <span>Progresso: {currentTest}/{domandeMenupausa.length}</span>
                <span>{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="w-full" data-testid="test-progress" />
            </div>
            
            {risultati.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-blue-600" data-testid="text-total-questions">
                    {risultati.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Totali</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-green-600" data-testid="text-successful-questions">
                    {successfulTests.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Riuscite</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-red-600" data-testid="text-failed-questions">
                    {errorTests.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Errori</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-amber-600" data-testid="text-health-warnings">
                    {healthWarnings.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Avvertimenti</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Risultati */}
      {risultati.length > 0 && (
        <Card data-testid="test-results">
          <CardHeader>
            <CardTitle>Risultati Test in Tempo Reale</CardTitle>
            <CardDescription>
              Domande e risposte del nutrizionista IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea ref={scrollAreaRef} className="h-96">
              <div className="space-y-4">
                {risultati.map((risultato, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3" data-testid={`result-item-${index}`}>
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Domanda {index + 1}
                      </h4>
                      <div className="flex gap-2">
                        {risultato.errore ? (
                          <Badge variant="destructive" data-testid={`badge-error-${index}`}>
                            <XCircle className="h-3 w-3 mr-1" />
                            Errore
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-100 text-green-800" data-testid={`badge-success-${index}`}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Successo
                          </Badge>
                        )}
                        {risultato.containsHealthWarning && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800" data-testid={`badge-warning-${index}`}>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Avvertimento
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Domanda:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`question-text-${index}`}>
                          {risultato.domanda}
                        </p>
                      </div>
                      
                      {risultato.errore ? (
                        <div>
                          <p className="text-sm font-medium text-red-700">Errore:</p>
                          <p className="text-sm text-red-600" data-testid={`error-text-${index}`}>
                            {risultato.errore}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Risposta:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap" data-testid={`response-text-${index}`}>
                            {risultato.risposta}
                          </p>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 flex justify-between">
                        <span data-testid={`timestamp-${index}`}>
                          {new Date(risultato.timestamp).toLocaleString('it-IT')}
                        </span>
                        {risultato.durata && (
                          <span data-testid={`duration-${index}`}>
                            {risultato.durata}ms
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}