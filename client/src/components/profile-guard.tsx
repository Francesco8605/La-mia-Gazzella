import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, AlertTriangle, Sparkles } from "lucide-react";
import { Link } from "wouter";
import type { UserProfile } from "@shared/schema";

interface ProfileGuardProps {
  children: React.ReactNode;
  requiresProfile?: boolean;
}

export function ProfileGuard({ children, requiresProfile = true }: ProfileGuardProps) {
  const { user } = useAuth();
  
  const { data: userProfile, isLoading, error } = useQuery<UserProfile>({
    queryKey: ["/api/user-profile"],
    enabled: !!user && requiresProfile,
    retry: false,
  });

  // Se il profilo non è richiesto, mostra sempre i children
  if (!requiresProfile) {
    return <>{children}</>;
  }

  // Mostra loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Verifico il tuo profilo...</p>
        </div>
      </div>
    );
  }

  // Se c'è un errore nel recupero del profilo (404 = profilo non esiste)
  const profileNotFound = error || !userProfile;
  
  // Verifica se il profilo è completo
  const isProfileComplete = userProfile && 
    userProfile.age && 
    userProfile.weight && 
    userProfile.height &&
    userProfile.breakfastTime &&
    userProfile.lunchTime &&
    userProfile.dinnerTime;

  // Se il profilo non esiste o non è completo, mostra la schermata obbligatoria
  if (profileNotFound || !isProfileComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-orange-900/20 dark:to-red-900/20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto pt-16">
            <Card className="border-2 border-orange-200 dark:border-orange-800 shadow-2xl">
              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-full">
                    <AlertTriangle className="h-16 w-16 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  Completa il Tuo Profilo
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800 dark:text-orange-200">
                    <strong>Accesso bloccato:</strong> Per utilizzare i nostri servizi premium è obbligatorio completare il profilo personale.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                    Perché è necessario il profilo completo?
                  </h3>
                  
                  <div className="grid gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                        🎯 Piani Nutrizionali Personalizzati
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Età, peso e altezza sono essenziali per calcolare il tuo BMI, fabbisogno calorico e grammature precise secondo il Protocollo Gazzella.
                      </p>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                        🍳 Ricette Su Misura
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        I dati personali permettono di adattare porzioni e ingredienti alle tue specifiche esigenze nutrizionali.
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                        🤖 Consulente Nutrizionale Intelligente
                      </h4>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        L'assistente nutrizionale può fornirti consigli accurati solo conoscendo i tuoi dati antropometrici e le tue abitudini alimentari.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    📝 Dati richiesti obbligatori:
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Età, peso e altezza per calcoli BMI e fabbisogno calorico</li>
                    <li>• Orari dei pasti per pianificazione giornaliera</li>
                    <li>• Eventuali problemi di salute (tiroide, intestino)</li>
                    <li>• Preferenze alimentari e allergie</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <Link href="/aggiorna-profilo">
                    <Button 
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3"
                      data-testid="complete-profile-now-button"
                    >
                      <User className="h-5 w-5 mr-2" />
                      Completa il Profilo Ora
                    </Button>
                  </Link>
                  
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    Non potrai accedere ai servizi premium finché il profilo non è completo
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Se tutto è ok, mostra i children
  return <>{children}</>;
}