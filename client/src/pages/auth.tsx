import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { User, Mail, Lock, UserPlus, LogIn, Sparkles, Heart, Zap, Star, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useLocation, Link } from "wouter";
import logoGazzella from "@/immagini/Logo-gazzella.jpg";

const loginSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "Password deve essere almeno 6 caratteri"),
});

const signupSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "Password deve essere almeno 6 caratteri"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export default function Auth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
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
        description: `Accesso effettuato con successo come ${user.email}`,
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

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormData) => {
      const { confirmPassword, ...signupData } = data;
      console.log('Dati inviati per registrazione:', signupData);
      
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
        credentials: "include",
      });
      
      console.log('Risposta registrazione status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Errore registrazione:', errorText);
        let errorMessage = "Errore di registrazione";
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      return response.json();
    },
    onSuccess: (user) => {
      toast({
        title: "Registrazione Completata!",
        description: `Account creato con successo per ${user.email}. Scegli ora il tuo piano di abbonamento per iniziare!`,
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

  const onSignup = (data: SignupFormData) => {
    signupMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-emerald-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-red-200/30 to-pink-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="relative w-28 h-28 mb-6 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-green-400 rounded-full blur-md opacity-40 animate-pulse"></div>
            <img 
              src={logoGazzella} 
              alt="Logo Gazzella" 
              className="relative w-full h-full object-contain rounded-full shadow-2xl bg-white/80 backdrop-blur-sm p-2 border-2 border-white/50" 
            />
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-6 h-6 text-yellow-500 animate-bounce" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-red-600 via-pink-500 to-green-600 bg-clip-text text-transparent mb-3 leading-tight">
            La Mia Gazzella
          </h1>
          <p className="text-lg text-slate-700 font-medium">
            🦌 Il tuo assistente nutrizionale personale
          </p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm text-slate-600 ml-2">Valutazione 5 stelle</span>
          </div>
        </div>

        <Card className="backdrop-blur-xl bg-white/30 border border-white/50 shadow-2xl rounded-3xl overflow-hidden">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-red-100/50 to-green-100/50 backdrop-blur-sm border-0 h-14 rounded-2xl m-2">
              <TabsTrigger 
                value="login" 
                data-testid="tab-login"
                className="rounded-xl font-semibold data-[state=active]:bg-white/80 data-[state=active]:shadow-lg data-[state=active]:text-green-700 transition-all duration-300"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Accedi
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                data-testid="tab-signup"
                className="rounded-xl font-semibold data-[state=active]:bg-white/80 data-[state=active]:shadow-lg data-[state=active]:text-green-700 transition-all duration-300"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Registrati
              </TabsTrigger>
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                              <Input 
                                type="email"
                                placeholder="La tua email" 
                                className="pl-10"
                                {...field} 
                                data-testid="input-login-email"
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
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
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
                    
                    <div className="text-center mt-4">
                      <Link href="/forgot-password">
                        <button 
                          type="button"
                          className="text-sm text-blue-600 hover:text-blue-800 underline"
                          data-testid="link-forgot-password"
                        >
                          Hai dimenticato la password?
                        </button>
                      </Link>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup">
              <CardHeader className="space-y-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <UserPlus className="h-6 w-6 text-green-600" />
                  Crea un Nuovo Account
                </CardTitle>
                <CardDescription className="text-base">
                  Registrati per iniziare il tuo percorso nutrizionale personalizzato
                </CardDescription>
                
                {/* Motivational Section */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    <h3 className="font-bold text-green-800 text-lg">Trasforma il Tuo Benessere Oggi!</h3>
                  </div>
                  <p className="text-green-700 font-medium leading-relaxed">
                    🎯 <strong>Unisciti a migliaia di donne</strong> che hanno già trasformato la loro vita con La Mia Gazzella!
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-green-700">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>Piani alimentari personalizzati</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-700">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span>Risultati in 3 giorni</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-700">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>Supporto di Consulente Laura</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-700">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span>Trial gratuito 3 giorni</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-red-100 to-pink-100 border border-red-200 rounded-xl p-3 text-center">
                    <p className="text-red-700 font-bold text-sm">
                      ⏰ <strong>Solo chi ha il Manuale della Gazzella può accedere!</strong>
                    </p>
                    <p className="text-red-600 text-xs mt-1">
                      Accesso esclusivo riservato ai nostri clienti
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
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
                      disabled={signupMutation.isPending}
                      className="w-full bg-gradient-to-r from-red-600 via-pink-600 to-green-600 hover:from-red-700 hover:via-pink-700 hover:to-green-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg"
                      data-testid="button-signup"
                    >
                      {signupMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Registrando...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Registrati
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Enhanced Footer */}
        <div className="text-center mt-8 space-y-4">
          <div className="flex items-center justify-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Migliaia di donne soddisfatte</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Risultati garantiti</span>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Accedendo accetti i nostri{" "}
            <Link href="/terms-of-service">
              <span className="text-green-600 hover:text-green-800 hover:underline cursor-pointer font-medium">
                Termini di Servizio
              </span>
            </Link>{" "}
            e{" "}
            <Link href="/privacy-policy">
              <span className="text-green-600 hover:text-green-800 hover:underline cursor-pointer font-medium">
                Privacy Policy
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}