import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiRequest('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      setIsSubmitted(true);
      toast({
        title: "Email inviata",
        description: "Se l'email esiste, riceverai la password a breve.",
        duration: 5000,
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Errore durante il recupero della password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <Card className="w-full max-w-md glass-effect" data-testid="success-card">
          <CardHeader className="text-center">
            <div className="text-4xl mb-4">📧</div>
            <CardTitle className="text-2xl text-green-800">
              Email Inviata!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              Se l'email inserita è registrata nel nostro sistema, riceverai a breve 
              la tua password temporanea.
            </p>
            <p className="text-center text-sm text-gray-500">
              Controlla anche la cartella spam se non vedi l'email.
            </p>
            <div className="flex justify-center pt-4">
              <Link href="/login">
                <Button 
                  variant="outline" 
                  className="w-full"
                  data-testid="button-back-to-login"
                >
                  Torna al Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
      <Card className="w-full max-w-md glass-effect" data-testid="forgot-password-card">
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">🦌</div>
          <CardTitle className="text-2xl text-green-800 mb-2">
            La Mia Gazzella
          </CardTitle>
          <p className="text-gray-600">
            Recupera la tua Password
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className="text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Inserisci la tua email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                data-testid="input-email"
                className="w-full"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-green-700 hover:bg-green-800" 
              disabled={isLoading}
              data-testid="button-submit"
            >
              {isLoading ? "Invio in corso..." : "Invia Password"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Ti sei ricordato la password?{" "}
              <Link href="/login">
                <button 
                  className="text-green-700 hover:text-green-800 font-medium underline"
                  data-testid="link-back-to-login"
                >
                  Accedi qui
                </button>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}