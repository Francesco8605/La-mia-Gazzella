import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";

export default function EmailVerification() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'already_verified'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Token di verifica mancante. Assicurati di aver cliccato sul link corretto dall\'email.');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
          credentials: 'include'
        });

        const result = await response.json();
        
        if (response.ok) {
          setStatus('success');
          setMessage(result.message || 'Email verificata con successo!');
          
          // Redirect to home after 3 seconds
          setTimeout(() => {
            setLocation("/");
          }, 3000);
        } else {
          if (result.message?.includes('già verificata')) {
            setStatus('already_verified');
            setMessage('La tua email è già stata verificata');
          } else {
            setStatus('error');
            setMessage(result.message || 'Errore durante la verifica');
          }
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Errore di connessione durante la verifica');
      }
    };

    verifyEmail();
  }, [setLocation]);

  const getIcon = () => {
    switch (status) {
      case 'verifying':
        return <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-600" />;
      case 'already_verified':
        return <CheckCircle className="h-16 w-16 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-red-600" />;
      default:
        return <Mail className="h-16 w-16 text-gray-600" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'verifying':
        return 'Verifica in corso...';
      case 'success':
        return 'Email Verificata!';
      case 'already_verified':
        return 'Email Già Verificata';
      case 'error':
        return 'Errore di Verifica';
      default:
        return 'Verifica Email';
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case 'success':
        return 'bg-gradient-to-br from-green-50 via-blue-50 to-purple-50';
      case 'already_verified':
        return 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50';
      case 'error':
        return 'bg-gradient-to-br from-red-50 via-pink-50 to-purple-50';
      default:
        return 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50';
    }
  };

  return (
    <div className={`min-h-screen ${getBackgroundColor()} py-8`}>
      <div className="container mx-auto px-4 max-w-md">
        <Card className="glass-effect" data-testid="email-verification-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getIcon()}
            </div>
            <CardTitle className="text-2xl text-green-800 mb-2">
              {getTitle()}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-700 mb-6 text-lg" data-testid="verification-message">
              {message}
            </p>

            {status === 'success' && (
              <div className="space-y-4">
                <div className="bg-green-100 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-700 text-sm">
                    🎉 Benvenuto in La Mia Gazzella! Sarai reindirizzato alla dashboard tra pochi secondi.
                  </p>
                </div>
                <Button
                  onClick={() => setLocation("/")}
                  className="w-full bg-green-700 hover:bg-green-800"
                  data-testid="button-go-to-dashboard"
                >
                  Vai alla Dashboard
                </Button>
              </div>
            )}

            {status === 'already_verified' && (
              <div className="space-y-4">
                <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-yellow-700 text-sm">
                    La tua email è già stata verificata in precedenza. Puoi accedere al tuo account.
                  </p>
                </div>
                <Button
                  onClick={() => setLocation("/login")}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                  data-testid="button-go-to-login"
                >
                  Accedi al tuo Account
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-700 text-sm">
                    Se il problema persiste, contattaci per assistenza o richiedi una nuova email di verifica.
                  </p>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => setLocation("/register")}
                    className="w-full bg-red-600 hover:bg-red-700"
                    data-testid="button-back-to-register"
                  >
                    Torna alla Registrazione
                  </Button>
                  <Button
                    onClick={() => setLocation("/login")}
                    variant="outline"
                    className="w-full"
                    data-testid="button-try-login"
                  >
                    Prova ad Accedere
                  </Button>
                </div>
              </div>
            )}

            {status === 'verifying' && (
              <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-700 text-sm">
                  Stiamo verificando la tua email, attendere prego...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}