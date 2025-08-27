import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import { InstallPWABanner } from "@/components/install-pwa-banner";
import Home from "@/pages/home";
import MealPlan from "@/pages/meal-plan";
import RecipeDetail from "@/pages/recipe-detail";
import RecipeGenerator from "@/pages/recipe-generator";
import Recipes from "@/pages/recipes";
import MealPlanGenerator from "@/pages/meal-plan-generator";
import SavedMealPlan from "@/pages/saved-meal-plan";
import MyMealPlans from "@/pages/my-meal-plans";
import NotFound from "@/pages/not-found";
import AIChat from "@/pages/ai-chat";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";

function Router() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/recipe-generator" component={RecipeGenerator} />
        <Route path="/recipes" component={Recipes} />
        <Route path="/ricette" component={Recipes} />
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
        <Route path="/ai-chat" component={AIChat} />
        <Route path="/assistente-nutrizionale" component={AIChat} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms-of-service" component={TermsOfService} />
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
        <InstallPWABanner />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;