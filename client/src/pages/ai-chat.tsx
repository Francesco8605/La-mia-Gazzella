import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, AlertTriangle, Loader2, MessageCircle, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function AIChat() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    toast({
      title: "Accesso Richiesto",
      description: "Effettua il login per accedere alla consulenza nutrizionale.",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
    return null;
  }

  // Fetch user profile for context
  const { data: userProfile } = useQuery({
    queryKey: ["/api/user-profiles/current"],
    enabled: isAuthenticated,
    retry: false,
    staleTime: 1000 * 60 * 2, // 2 minuti di cache
  });

  const { data: mealPlans } = useQuery({
    queryKey: ["/api/meal-plans/user"],
    enabled: isAuthenticated,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minuti di cache
  });

  const { data: recipes } = useQuery({
    queryKey: ["/api/recipes/user"],
    enabled: isAuthenticated,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minuti di cache
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Consulenza Nutrizionale Personalizzata
          </h1>
          <p className="text-muted-foreground text-lg">
            Contatta direttamente la nostra nutrizionista esperta del Manuale della Gazzella
          </p>
        </div>

        {/* User Context Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Il Tuo Profilo Gazzella
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Dati Personali</p>
                {userProfile ? (
                  <div className="mt-1">
                    <p>Peso: {(userProfile as any).weight}kg</p>
                    <p>Altezza: {(userProfile as any).height}cm</p>
                    <p>Età: {(userProfile as any).age} anni</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground mt-1">Profilo non completato</p>
                )}
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Piani Nutrizionali</p>
                <p className="mt-1">{(mealPlans as any)?.length || 0} piani salvati</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Ricette Personali</p>
                <p className="mt-1">{(recipes as any)?.length || 0} ricette generate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Disclaimer */}
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/10 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                  Importante: Disclaimer Medico
                </p>
                <p className="text-orange-700 dark:text-orange-300">
                  Questa consulenza fornisce informazioni nutrizionali basate sul Manuale della Gazzella. 
                  Non sostituisce il parere medico professionale. Per problemi di salute gravi o condizioni 
                  mediche specifiche, consulta sempre un medico di persona.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Consultation Card */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/10 mb-6">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                Consulenza Nutrizionale Diretta
              </h3>
              <p className="text-green-700 dark:text-green-300 mb-6 max-w-2xl mx-auto">
                Hai bisogno di una consulenza personalizzata? Contatta direttamente la nostra nutrizionista 
                esperta su WhatsApp per un supporto professionale e mirato alle tue esigenze specifiche.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm">Consulenze personalizzate</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm">Supporto per il Manuale della Gazzella</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm">Consigli nutrizionali professionali</span>
                </div>
              </div>
              <Button
                onClick={() => {
                  const whatsappUrl = `https://wa.me/393296180642?text=${encodeURIComponent('Ciao! Sono interessato/a ad una consulenza nutrizionale personalizzata del Manuale della Gazzella.')}`;
                  window.open(whatsappUrl, '_blank');
                }}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 text-lg px-8 py-3 rounded-lg"
                data-testid="button-whatsapp-consultation"
              >
                <Phone className="h-5 w-5" />
                Contatta su WhatsApp
              </Button>
              <p className="text-xs text-green-600 dark:text-green-400 mt-3">
                Risposta entro 24 ore nei giorni lavorativi
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}