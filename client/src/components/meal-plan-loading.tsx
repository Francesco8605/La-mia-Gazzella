import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock, Bot, Heart } from "lucide-react";

export function MealPlanLoading() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header con icona e titolo */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Sparkles className="h-12 w-12 text-pink-500 animate-pulse" />
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          🧬 Cosa Includerà il Tuo Piano Personalizzato:
        </h2>
      </div>

      {/* Card con benefici del piano */}
      <Card className="glass-morphism shadow-2xl mb-8">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-slate-700">Colazioni, pranzi e cene bilanciate</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-slate-700">Calcolo preciso di calorie e macronutrienti</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-slate-700">Protocollo nutrizionale Gazzella autentico</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-slate-700">Rispetto delle tue preferenze e intolleranze</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-slate-700">Adattato ai tuoi orari dei pasti</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-slate-700">Consigli per la gestione delle voglie</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stato di generazione */}
      <div className="text-center mb-8">
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <div className="animate-spin">
                <div className="w-8 h-8 border-4 border-gradient-to-r from-green-400 to-blue-500 border-t-transparent rounded-full" />
              </div>
            </div>
          </div>
          <div className="absolute -top-2 -right-2">
            <Heart className="h-6 w-6 text-red-500 animate-bounce" />
          </div>
        </div>
        
        <div className="mt-6 space-y-2">
          <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Generazione in corso...
          </h3>
          <p className="text-slate-600 text-sm">
            La tua nutrizionista virtuale sta creando il piano perfetto per te
          </p>
        </div>
      </div>

      {/* Informazioni tecniche */}
      <div className="flex flex-wrap justify-center gap-4">
        <Badge 
          variant="outline" 
          className="glass-dark border-yellow-200 text-slate-700 px-4 py-2"
        >
          <Clock className="mr-2 h-4 w-4 text-yellow-500" />
          ⚡ La generazione richiede circa 30-60 secondi
        </Badge>
        
        <Badge 
          variant="outline" 
          className="glass-dark border-blue-200 text-slate-700 px-4 py-2"
        >
          <Bot className="mr-2 h-4 w-4 text-blue-500" />
          🌱 Powered by protocollo avanzato Nutrizionista Gazzella
        </Badge>
      </div>

      {/* Messaggio motivazionale */}
      <div className="mt-8 text-center">
        <div className="glass-morphism rounded-2xl p-6 bg-gradient-to-r from-pink-50 to-purple-50">
          <p className="text-slate-600 italic text-lg leading-relaxed">
            "Ogni grande cambiamento inizia con un piccolo passo. 
            <br />
            Il tuo viaggio verso il benessere inizia ora! 💪✨"
          </p>
        </div>
      </div>
    </div>
  );
}