import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import Home from "@/pages/home";
import MealPlan from "@/pages/meal-plan";
import RecipeDetail from "@/pages/recipe-detail";
import Personalization from "@/pages/personalization";
import RecipeGenerator from "@/pages/recipe-generator";
import MealPlanGenerator from "@/pages/meal-plan-generator";
import SavedMealPlan from "@/pages/saved-meal-plan";
import MyMealPlans from "@/pages/my-meal-plans";
import UpdateProfile from "@/pages/update-profile";
import Auth from "@/pages/auth";
import NotFound from "@/pages/not-found";

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

  // Se non autenticato, mostra solo la pagina di auth
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/auth" component={Auth} />
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
        <Route path="/personalization" component={Personalization} />
        <Route path="/profilo" component={Personalization} />
        <Route path="/recipe-generator" component={RecipeGenerator} />
        <Route path="/genera-piano" component={MealPlanGenerator} />
        <Route path="/meal-plan-generator" component={MealPlanGenerator} />
        <Route path="/piani-personalizzati" component={MyMealPlans} />
        <Route path="/piano-salvato/:id" component={SavedMealPlan} />
        <Route path="/aggiorna-profilo">
          {() => {
            const AggiornaProfiloPage = React.lazy(() => import("./pages/aggiorna-profilo"));
            return (
              <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>}>
                <AggiornaProfiloPage />
              </React.Suspense>
            );
          }}
        </Route>
        <Route path="/meal-plan/:id" component={MealPlan} />
        <Route path="/recipe/:id" component={RecipeDetail} />
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
