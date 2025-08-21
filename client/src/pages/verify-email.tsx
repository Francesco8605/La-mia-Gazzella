import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Link } from "wouter";

type VerificationStatus = 'loading' | 'success' | 'error' | 'expired' | 'already-verified';

export default function VerifyEmail() {
  const [match, params] = useRoute("/verifica-email/:token");
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!match || !params?.token) {
      setStatus('error');
      setMessage("Token di verifica non valido");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await apiRequest("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: params.token })
        });

        if (response.ok) {
          const data = await response.json();
          setStatus('success');
          setMessage(data.message || "Email verificata con successo!");
        } else {
          const errorData = await response.json();
          if (response.status === 410) {
            setStatus('expired');
          } else if (response.status === 409) {
            setStatus('already-verified');
          } else {
            setStatus('error');
          }
          setMessage(errorData.message || "Errore durante la verifica");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus('error');
        setMessage("Errore di connessione. Riprova più tardi.");
      }
    };

    verifyEmail();
  }, [match, params?.token]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p>Verifica email in corso...</p>
          </div>
        );
      
      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Email Verificata!</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link href="/login">
              <Button className="w-full" data-testid="button-login">
                Accedi al tuo Account
              </Button>
            </Link>
          </div>
        );
      
      case 'already-verified':
        return (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Email già Verificata</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link href="/login">
              <Button className="w-full" data-testid="button-login">
                Accedi al tuo Account
              </Button>
            </Link>
          </div>
        );
      
      case 'expired':
        return (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-orange-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Link Scaduto</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link href="/login">
              <Button variant="outline" className="w-full" data-testid="button-login">
                Torna al Login
              </Button>
            </Link>
          </div>
        );
      
      case 'error':
      default:
        return (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Verifica Fallita</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link href="/login">
              <Button variant="outline" className="w-full" data-testid="button-login">
                Torna al Login
              </Button>
            </Link>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Verifica Email</CardTitle>
          <CardDescription>
            La Mia Gazzella - Verifica del tuo account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}