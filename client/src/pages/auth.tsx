import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { User, Mail, Lock, UserPlus, LogIn, Sparkles, Phone, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import logoGazzella from "@/immagini/Logo-gazzella.jpg";

const loginSchema = z.object({
  username: z.string().min(3, "Username deve essere almeno 3 caratteri"),
  password: z.string().min(6, "Password deve essere almeno 6 caratteri"),
});

const signupSchema = z.object({
  username: z.string().min(3, "Username deve essere almeno 3 caratteri"),
  email: z.string().email("Email non valida"),
  phone: z.string().min(10, "Numero di telefono deve essere almeno 10 cifre").max(15, "Numero troppo lungo"),
  password: z.string().min(6, "Password deve essere almeno 6 caratteri"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"],
});

const phoneVerificationSchema = z.object({
  code: z.string().min(4, "Codice deve essere almeno 4 cifre").max(8, "Codice troppo lungo"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;
type PhoneVerificationData = z.infer<typeof phoneVerificationSchema>;

export default function Auth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Stati per la verifica telefonica multi-step
  const [registrationStep, setRegistrationStep] = useState<'form' | 'phone-verification' | 'completed'>('form');
  const [pendingSignupData, setPendingSignupData] = useState<SignupFormData | null>(null);
  const [verificationId, setVerificationId] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const verificationForm = useForm<PhoneVerificationData>({
    resolver: zodResolver(phoneVerificationSchema),
    defaultValues: {
      code: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Errore di login");
      }
      return response.json();
    },
    onSuccess: (user) => {
      toast({
        title: "Benvenuto!",
        description: `Accesso effettuato con successo come ${user.username}`,
      });
      // Invalida e aggiorna la cache dell'autenticazione
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.setQueryData(["/api/auth/user"], user);
      
      // Breve delay per assicurarsi che la cache sia aggiornata e reindirizza alla dashboard
      setTimeout(() => {
        setLocation("/");
      }, 100);
    },
    onError: (error) => {
      toast({
        title: "Errore di Accesso",
        description: error instanceof Error ? error.message : "Credenziali non valide",
        variant: "destructive",
      });
    },
  });

  // Mutation per controllare se il numero è già stato usato
  const checkPhoneMutation = useMutation({
    mutationFn: async (phone: string) => {
      const response = await fetch("/api/phone/check-trial-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Errore nella verifica del numero");
      }
      return response.json();
    },
  });

  // Mutation per inviare il codice di verifica
  const sendVerificationMutation = useMutation({
    mutationFn: async (phone: string) => {
      const response = await fetch("/api/phone/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          method: "whatsapp",
          provider: "mail2whats"
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Errore nell'invio del codice");
      }
      return response.json();
    },
    onSuccess: (response) => {
      setVerificationId(response.verificationId);
      setRegistrationStep('phone-verification');
      toast({
        title: "Codice Inviato!",
        description: `Abbiamo inviato un codice di verifica via WhatsApp al numero ${phoneNumber}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Errore Invio Codice",
        description: error instanceof Error ? error.message : "Impossibile inviare il codice di verifica",
        variant: "destructive",
      });
    },
  });

  // Mutation per verificare il codice OTP
  const verifyCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch("/api/phone/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationId,
          code
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Errore nella verifica del codice");
      }
      return response.json();
    },
    onSuccess: () => {
      // Ora possiamo procedere con la registrazione
      if (pendingSignupData) {
        signupMutation.mutate(pendingSignupData);
      }
    },
    onError: (error) => {
      toast({
        title: "Codice Non Valido",
        description: error instanceof Error ? error.message : "Il codice inserito non è corretto",
        variant: "destructive",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormData) => {
      const { confirmPassword, ...signupData } = data;
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Errore di registrazione");
      }
      return response.json();
    },
    onSuccess: (user) => {
      setRegistrationStep('completed');
      toast({
        title: "Registrazione Completata!",
        description: `Account creato con successo per ${user.username}. Scegli ora il tuo piano di abbonamento per iniziare!`,
      });
      
      // Invalida e aggiorna la cache dell'autenticazione
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.setQueryData(["/api/auth/user"], user);
      
      // Breve delay per assicurarsi che la cache sia aggiornata e reindirizza alla pagina degli abbonamenti
      setTimeout(() => {
        setLocation("/piani-abbonamento");
      }, 100);
    },
    onError: (error) => {
      toast({
        title: "Errore di Registrazione",
        description: error instanceof Error ? error.message : "Errore durante la registrazione",
        variant: "destructive",
      });
    },
  });

  const onLogin = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onSignup = async (data: SignupFormData) => {
    // Step 1: Controllo anti-abuso del numero
    try {
      setPhoneNumber(data.phone);
      const checkResult = await checkPhoneMutation.mutateAsync(data.phone);
      
      if (checkResult.alreadyUsed) {
        toast({
          title: "Numero già utilizzato",
          description: "Questo numero di telefono è già stato utilizzato per una prova gratuita. Ogni numero può essere usato solo una volta.",
          variant: "destructive",
        });
        return;
      }

      // Step 2: Salva i dati di registrazione e invia codice OTP
      setPendingSignupData(data);
      sendVerificationMutation.mutate(data.phone);
      
    } catch (error) {
      toast({
        title: "Errore di verifica",
        description: error instanceof Error ? error.message : "Errore durante la verifica del numero",
        variant: "destructive",
      });
    }
  };

  const onVerifyCode = (data: PhoneVerificationData) => {
    verifyCodeMutation.mutate(data.code);
  };

  const onResendCode = () => {
    if (phoneNumber) {
      sendVerificationMutation.mutate(phoneNumber);
    }
  };

  const onBackToForm = () => {
    setRegistrationStep('form');
    setPendingSignupData(null);
    setVerificationId('');
    setPhoneNumber('');
    verificationForm.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mb-4 mx-auto">
            <img src={logoGazzella} alt="Logo Gazzella" className="w-full h-full object-contain rounded-full" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent mb-2">
            La Mia Gazzella
          </h1>
          <p className="text-slate-600">
            Il tuo assistente nutrizionale personale
          </p>
        </div>

        <Card className="glass-morphism">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Accedi</TabsTrigger>
              <TabsTrigger value="signup" data-testid="tab-signup">Registrati</TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  Accedi al tuo Account
                </CardTitle>
                <CardDescription>
                  Inserisci le tue credenziali per accedere alla piattaforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                              <Input 
                                placeholder="Il tuo username" 
                                className="pl-10"
                                {...field} 
                                data-testid="input-login-username"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                              <Input 
                                type="password" 
                                placeholder="La tua password"
                                className="pl-10"
                                {...field}
                                data-testid="input-login-password"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={loginMutation.isPending}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                      data-testid="button-login"
                    >
                      {loginMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Accedendo...
                        </>
                      ) : (
                        <>
                          <LogIn className="mr-2 h-4 w-4" />
                          Accedi
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup">
              {registrationStep === 'form' && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Crea un Nuovo Account
                    </CardTitle>
                    <CardDescription>
                      Registrati per iniziare il tuo percorso nutrizionale personalizzato
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                              <Input 
                                placeholder="Scegli un username" 
                                className="pl-10"
                                {...field}
                                data-testid="input-signup-username"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                              <Input 
                                type="email" 
                                placeholder="tua@email.com"
                                className="pl-10"
                                {...field}
                                data-testid="input-signup-email"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              Numero di Telefono
                              <Shield className="h-3 w-3 text-green-600" />
                            </div>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                              <Input 
                                type="tel" 
                                placeholder="320 123 4567"
                                className="pl-10"
                                {...field}
                                data-testid="input-signup-phone"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-slate-600 mt-1">
                            🛡️ Proteggiamo la tua prova gratuita: un numero = un trial
                          </p>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                              <Input 
                                type="password" 
                                placeholder="Crea una password sicura"
                                className="pl-10"
                                {...field}
                                data-testid="input-signup-password"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conferma Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                              <Input 
                                type="password" 
                                placeholder="Ripeti la password"
                                className="pl-10"
                                {...field}
                                data-testid="input-signup-confirm-password"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={checkPhoneMutation.isPending || sendVerificationMutation.isPending}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                      data-testid="button-signup"
                    >
                      {(checkPhoneMutation.isPending || sendVerificationMutation.isPending) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Verificando numero...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Verifica Numero e Registrati
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
                </CardContent>
                </>
              )}

              {/* Step 2: Verifica Codice OTP */}
              {registrationStep === 'phone-verification' && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      Verifica Numero di Telefono
                    </CardTitle>
                    <CardDescription>
                      Abbiamo inviato un codice di verifica via WhatsApp al numero <strong>{phoneNumber}</strong>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...verificationForm}>
                      <form onSubmit={verificationForm.handleSubmit(onVerifyCode)} className="space-y-4">
                        <FormField
                          control={verificationForm.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Codice di Verifica</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Shield className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                  <Input 
                                    type="text" 
                                    placeholder="Inserisci il codice"
                                    className="pl-10 text-center text-lg font-mono"
                                    maxLength={6}
                                    {...field}
                                    data-testid="input-verification-code"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-3">
                          <Button
                            type="submit"
                            disabled={verifyCodeMutation.isPending}
                            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                            data-testid="button-verify-code"
                          >
                            {verifyCodeMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Verificando...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Verifica e Completa Registrazione
                              </>
                            )}
                          </Button>

                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={onResendCode}
                              disabled={sendVerificationMutation.isPending}
                              className="flex-1"
                              data-testid="button-resend-code"
                            >
                              {sendVerificationMutation.isPending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2" />
                              ) : (
                                <Phone className="mr-2 h-4 w-4" />
                              )}
                              Reinvia Codice
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              onClick={onBackToForm}
                              className="flex-1"
                              data-testid="button-back-to-form"
                            >
                              ← Indietro
                            </Button>
                          </div>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </>
              )}

              {/* Step 3: Registrazione in corso */}
              {registrationStep === 'completed' && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Registrazione Completata!
                    </CardTitle>
                    <CardDescription>
                      Account creato con successo. Verrai reindirizzato a breve...
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4" />
                      <p className="text-slate-600">Preparando il tuo profilo nutrizionale...</p>
                    </div>
                  </CardContent>
                </>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-slate-500">
            Accedendo accetti i nostri{" "}
            <a href="#" className="text-primary hover:underline">
              Termini di Servizio
            </a>{" "}
            e{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}