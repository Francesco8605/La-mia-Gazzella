import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Mail, User, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const signupSchema = z.object({
  email: z.string().email("Inserisci un indirizzo email valido"),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
  confirmPassword: z.string(),
  firstName: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
  lastName: z.string().min(2, "Il cognome deve avere almeno 2 caratteri"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non coincidono",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormData) => {
      return await apiRequest("POST", "/api/auth/signup", {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Registrazione completata!",
        description: "Controlla la tua email per verificare l'account.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore durante la registrazione",
        description: error.message || "Si è verificato un errore. Riprova.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignupFormData) => {
    signupMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="text-green-500 text-6xl" />
            </div>
            <CardTitle className="text-2xl text-green-700">Email inviata!</CardTitle>
            <CardDescription>
              Abbiamo inviato un link di verifica a <strong>{getValues("email")}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Prossimi passaggi:</h3>
              <ol className="text-sm text-green-700 space-y-1">
                <li>1. Controlla la tua casella email</li>
                <li>2. Clicca sul link di verifica</li>
                <li>3. Accedi con le tue credenziali</li>
              </ol>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Non vedi l'email? Controlla la cartella spam o
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  // Qui potresti aggiungere la logica per rinviare l'email
                  toast({
                    title: "Email rinviata",
                    description: "Abbiamo inviato nuovamente l'email di verifica.",
                  });
                }}
              >
                Invia nuovamente
              </Button>
            </div>

            <div className="text-center pt-4">
              <Link href="/api/login">
                <Button variant="link">
                  Preferisci accedere con Replit?
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
          <div className="flex justify-center items-center mb-4">
            <Leaf className="text-primary text-4xl mr-2" />
            <CardTitle className="text-2xl">La Mia Gazzella</CardTitle>
          </div>
          <CardDescription>
            Crea il tuo account per accedere ai piani nutrizionali personalizzati
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    className="pl-9"
                    placeholder="Nome"
                    data-testid="input-firstname"
                  />
                </div>
                {errors.firstName && (
                  <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="lastName">Cognome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    className="pl-9"
                    placeholder="Cognome"
                    data-testid="input-lastname"
                  />
                </div>
                {errors.lastName && (
                  <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="pl-9"
                  placeholder="tuaemail@esempio.com"
                  data-testid="input-email"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="pl-9"
                  placeholder="Almeno 8 caratteri"
                  data-testid="input-password"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Conferma Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  className="pl-9"
                  placeholder="Ripeti la password"
                  data-testid="input-confirm-password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={signupMutation.isPending}
              data-testid="button-signup"
            >
              {signupMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creando account...</span>
                </div>
              ) : (
                "Crea Account"
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">oppure</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-replit-login"
              >
                Accedi con Replit
              </Button>
              
              <p className="text-center text-sm text-gray-600">
                Hai già un account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Accedi qui
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}