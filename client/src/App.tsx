import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionGuard } from "@/components/subscription-guard";
import Navigation from "@/components/navigation";
import Home from "@/pages/home";
import MealPlan from "@/pages/meal-plan";
import RecipeDetail from "@/pages/recipe-detail";

import RecipeGenerator from "@/pages/recipe-generator";
import Recipes from "@/pages/recipes";
import MealPlanGenerator from "@/pages/meal-plan-generator";
import SavedMealPlan from "@/pages/saved-meal-plan";
import MyMealPlans from "@/pages/my-meal-plans";
import UpdateProfile from "@/pages/update-profile";
import Auth from "@/pages/auth";
import NotFound from "@/pages/not-found";
import AIChat from "@/pages/ai-chat";
import CancelSubscription from "@/pages/cancel-subscription";
import VerifyEmail from "@/pages/verify-email";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostra loading durante il controllo dell'autenticazione
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Se non autenticato, mostra solo la pagina di auth e pagine pubbliche
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/auth" component={Auth} />
        <Route path="/login" component={Auth} />
        <Route path="/register" component={Auth} />
        <Route path="/verifica-email/:token" component={VerifyEmail} />
        <Route path="/password-dimenticata" component={ForgotPassword} />
        <Route path="/reset-password/:token" component={ResetPassword} />
        <Route component={Auth} />
      </Switch>
    );
  }

  // Se autenticato, mostra l'app completa
  return (
    <div className="min-h-screen">
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/auth" component={() => { 
          // Se l'utente autenticato prova ad accedere a /auth, reindirizza alla home
          window.location.href = "/";
          return null;
        }} />

        {/* Protected Routes - Require Active Subscription */}
        <Route path="/recipe-generator">
          {() => (
            <SubscriptionGuard>
              <RecipeGenerator />
            </SubscriptionGuard>
          )}
        </Route>
        <Route path="/recipes">
          {() => (
            <SubscriptionGuard>
              <Recipes />
            </SubscriptionGuard>
          )}
        </Route>
        <Route path="/ricette">
          {() => (
            <SubscriptionGuard>
              <Recipes />
            </SubscriptionGuard>
          )}
        </Route>
        <Route path="/genera-piano">
          {() => (
            <SubscriptionGuard>
              <MealPlanGenerator />
            </SubscriptionGuard>
          )}
        </Route>
        <Route path="/meal-plan-generator">
          {() => (
            <SubscriptionGuard>
              <MealPlanGenerator />
            </SubscriptionGuard>
          )}
        </Route>
        <Route path="/piani-personalizzati">
          {() => (
            <SubscriptionGuard>
              <MyMealPlans />
            </SubscriptionGuard>
          )}
        </Route>
        <Route path="/piano-salvato/:id">
          {() => (
            <SubscriptionGuard>
              <SavedMealPlan />
            </SubscriptionGuard>
          )}
        </Route>
        <Route path="/aggiorna-profilo">
          {() => {
            const AggiornaProfiloPage = React.lazy(() => import("./pages/aggiorna-profilo"));
            return (
              <SubscriptionGuard>
                <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>}>
                  <AggiornaProfiloPage />
                </React.Suspense>
              </SubscriptionGuard>
            );
          }}
        </Route>
        <Route path="/meal-plan/:id">
          {() => (
            <SubscriptionGuard>
              <MealPlan />
            </SubscriptionGuard>
          )}
        </Route>
        <Route path="/recipe/:id">
          {() => (
            <SubscriptionGuard>
              <RecipeDetail />
            </SubscriptionGuard>
          )}
        </Route>
        <Route path="/ai-chat">
          {() => (
            <SubscriptionGuard>
              <AIChat />
            </SubscriptionGuard>
          )}
        </Route>
        <Route path="/assistente-ia">
          {() => (
            <SubscriptionGuard>
              <AIChat />
            </SubscriptionGuard>
          )}
        </Route>
        
        {/* Subscription Pages */}
        <Route path="/piani-abbonamento">
          {() => {
            const SubscriptionPlansPage = React.lazy(() => import("./pages/subscription-plans"));
            return (
              <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>}>
                <SubscriptionPlansPage />
              </React.Suspense>
            );
          }}
        </Route>
        
        <Route path="/cancella-abbonamento" component={CancelSubscription} />
        <Route path="/cancel-subscription" component={CancelSubscription} />
        
        <Route path="/subscription-success">
          {() => {
            const SubscriptionSuccessPage = React.lazy(() => import("./pages/subscription-success"));
            return (
              <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>}>
                <SubscriptionSuccessPage />
              </React.Suspense>
            );
          }}
        </Route>
        
        <Route path="/subscription-canceled">
          {() => {
            const SubscriptionCanceledPage = React.lazy(() => import("./pages/subscription-canceled"));
            return (
              <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>}>
                <SubscriptionCanceledPage />
              </React.Suspense>
            );
          }}
        </Route>
        
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
