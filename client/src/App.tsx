import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import { InstallPWABanner } from "@/components/install-pwa-banner";

// Pages - All publicly accessible
import Home from "@/pages/home";
import MealPlan from "@/pages/meal-plan";
import RecipeDetail from "@/pages/recipe-detail";
import RecipeGenerator from "@/pages/recipe-generator";
import Recipes from "@/pages/recipes";
import MealPlanGenerator from "@/pages/meal-plan-generator";
import SavedMealPlan from "@/pages/saved-meal-plan";
import MyMealPlans from "@/pages/my-meal-plans";
import UpdateProfile from "@/pages/update-profile";
import NotFound from "@/pages/not-found";
import AIChat from "@/pages/ai-chat";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";

function Router() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Switch>
        {/* Home page */}
        <Route path="/" component={Home} />

        {/* Recipe pages */}
        <Route path="/recipe-generator" component={RecipeGenerator} />
        <Route path="/recipes" component={Recipes} />
        <Route path="/ricette" component={Recipes} />
        <Route path="/recipe/:id" component={RecipeDetail} />

        {/* Meal plan pages */}
        <Route path="/genera-piano" component={MealPlanGenerator} />
        <Route path="/meal-plan-generator" component={MealPlanGenerator} />
        <Route path="/meal-plan/:id" component={MealPlan} />
        <Route path="/piani-personalizzati" component={MyMealPlans} />
        <Route path="/piano-salvato/:id" component={SavedMealPlan} />

        {/* Profile management */}
        <Route path="/aggiorna-profilo" component={UpdateProfile} />
        <Route path="/update-profile" component={UpdateProfile} />

        {/* AI Assistant */}
        <Route path="/consulente-nutrizionale" component={AIChat} />
        <Route path="/ai-chat" component={AIChat} />

        {/* Legal pages */}
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms-of-service" component={TermsOfService} />

        {/* 404 page */}
        <Route component={NotFound} />
      </Switch>
      <InstallPWABanner />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}