import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Lock, Eye, EyeOff, Key } from "lucide-react";
import { Link, useLocation } from "wouter";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password corrente è richiesta"),
  newPassword: z.string().min(6, "La nuova password deve essere almeno 6 caratteri"),
  confirmPassword: z.string().min(1, "Conferma la nuova password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
        credentials: 'include'
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Errore nel cambio password');
      }

      toast({
        title: "Successo!",
        description: "Password aggiornata con successo",
      });

      // Redirect to home after successful password change
      setTimeout(() => {
        setLocation("/");
      }, 1500);
      
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Errore durante il cambio password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-md">
        <Card className="glass-effect" data-testid="change-password-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Key className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800 mb-2">
              Cambia Password
            </CardTitle>
            <p className="text-gray-600">
              Aggiorna la tua password per maggiore sicurezza
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password Corrente</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                          <Input 
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="Inserisci la password corrente"
                            className="pl-10 pr-10"
                            {...field}
                            data-testid="input-current-password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            data-testid="toggle-current-password"
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nuova Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                          <Input 
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Inserisci la nuova password"
                            className="pl-10 pr-10"
                            {...field}
                            data-testid="input-new-password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            data-testid="toggle-new-password"
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500 mt-1">
                        Minimo 6 caratteri
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conferma Nuova Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                          <Input 
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Conferma la nuova password"
                            className="pl-10 pr-10"
                            {...field}
                            data-testid="input-confirm-password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            data-testid="toggle-confirm-password"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-700 hover:bg-green-800"
                  data-testid="button-change-password"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Aggiornando...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Cambia Password
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <Link href="/">
                <Button 
                  variant="outline" 
                  className="w-full"
                  data-testid="button-back-home"
                >
                  Torna alla Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}