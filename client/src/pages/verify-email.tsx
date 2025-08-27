import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Leaf, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Link } from "wouter";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string>("");
  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    // Estrai il token dall'URL
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setVerificationStatus("error");
    }
  }, []);

  const verifyMutation = useMutation({
    mutationFn: async (verificationToken: string) => {
      return await apiRequest("POST", "/api/auth/verify-email", {
        token: verificationToken,
      });
    },
    onSuccess: () => {
      setVerificationStatus("success");
      setTimeout(() => {
        setLocation("/login");
      }, 3000);
    },
    onError: (error: any) => {
      console.error("Verification error:", error);
      setVerificationStatus("error");
    },
  });

  useEffect(() => {
    if (token && verificationStatus === "loading") {
      verifyMutation.mutate(token);
    }
  }, [token, verificationStatus]);

  if (verificationStatus === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader className="text-primary text-6xl animate-spin" />
            </div>
            <CardTitle className="text-2xl text-gray-700">Verificando email...</CardTitle>
            <CardDescription>
              Attendere mentre verifichiamo il tuo account
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (verificationStatus === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="text-green-500 text-6xl" />
            </div>
            <CardTitle className="text-2xl text-green-700">Email verificata!</CardTitle>
            <CardDescription>
              Il tuo account è stato verificato con successo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Account attivato!</h3>
              <p className="text-sm text-green-700">
                Ora puoi accedere alla piattaforma La Mia Gazzella e iniziare a creare 
                i tuoi piani nutrizionali personalizzati.
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Verrai reindirizzato alla pagina di accesso tra pochi secondi...
              </p>
              
              <Link href="/login">
                <Button className="bg-primary hover:bg-primary/90">
                  Accedi Ora
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="text-red-500 text-6xl" />
          </div>
          <CardTitle className="text-2xl text-red-700">Errore di verifica</CardTitle>
          <CardDescription>
            Non è stato possibile verificare il tuo account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">Possibili cause:</h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Il link di verifica è scaduto (24 ore)</li>
              <li>• Il link è già stato utilizzato</li>
              <li>• Il link non è valido</li>
            </ul>
          </div>
          
          <div className="text-center space-y-3">
            <Link href="/signup">
              <Button variant="outline" className="w-full">
                Registrati Nuovamente
              </Button>
            </Link>
            
            <Link href="/login">
              <Button variant="link">
                Hai già un account? Accedi
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}