import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Mail, Lock, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const loginSchema = z.object({
  email: z.string().email("Inserisci un indirizzo email valido"),
  password: z.string().min(1, "Inserisci la password"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      return await apiRequest("POST", "/api/auth/login", data);
    },
    onSuccess: () => {
      // Ricarica la pagina per aggiornare lo stato di autenticazione
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({
        title: "Errore durante l'accesso",
        description: error.message || "Email o password non corretti.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Leaf className="text-primary text-4xl mr-2" />
            <CardTitle className="text-2xl">La Mia Gazzella</CardTitle>
          </div>
          <CardDescription>
            Accedi al tuo account per continuare
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  placeholder="La tua password"
                  data-testid="input-password"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loginMutation.isPending}
              data-testid="button-login"
            >
              {loginMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Accedendo...</span>
                </div>
              ) : (
                "Accedi"
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
                Non hai un account?{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  Registrati qui
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}