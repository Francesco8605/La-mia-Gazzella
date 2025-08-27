import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function SubscriptionSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // You could add analytics tracking here
    console.log("Subscription successful");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-emerald-800">
            Abbonamento Attivato!
          </CardTitle>
          <CardDescription>
            Benvenuto in La Mia Gazzella! Il tuo abbonamento è stato attivato con successo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Puoi iniziare subito a utilizzare tutte le funzionalità premium.
            Durante il periodo di prova gratuita non verrà addebitato alcun costo.
          </p>
          
          <Button 
            onClick={() => setLocation("/")}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            data-testid="button-go-home"
          >
            Inizia Subito
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}