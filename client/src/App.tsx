import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { SubscriptionGuard } from "@/components/subscription-guard";
import { ProfileGuard } from "@/components/profile-guard";
import Navigation from "@/components/navigation";
import { InstallPWABanner } from "@/components/install-pwa-banner";

// Pages - Authentication required for most features
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
import SubscriptionPlans from "@/pages/subscription-plans";
import SubscriptionSuccess from "@/pages/subscription-success";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Temporarily bypass authentication - show app directly
  return (
    <div className="min-h-screen">
      <Navigation />
      <Switch>
        {/* Home page - accessible to all authenticated users */}
        <Route path="/" component={Home} />
        
        {/* Subscription and Auth Management */}
        <Route path="/auth" component={() => { 
          // If authenticated user tries to access /auth, redirect to home
          window.location.href = "/";
          return null;
        }} />
        <Route path="/subscription-plans" component={SubscriptionPlans} />
        <Route path="/subscription-success" component={SubscriptionSuccess} />

        {/* All Routes - Temporarily accessible without subscription */}
        <Route path="/recipe-generator" component={RecipeGenerator} />
        <Route path="/recipes" component={Recipes} />
        <Route path="/ricette" component={Recipes} />
        <Route path="/genera-piano" component={MealPlanGenerator} />
        <Route path="/meal-plan-generator" component={MealPlanGenerator} />
        <Route path="/piani-personalizzati" component={MyMealPlans} />
        <Route path="/piano-salvato/:id" component={SavedMealPlan} />
        <Route path="/consulente-nutrizionale" component={AIChat} />
        <Route path="/ai-chat" component={AIChat} />
        
        {/* Profile Management - Requires Auth but not necessarily subscription */}
        <Route path="/aggiorna-profilo" component={UpdateProfile} />
        <Route path="/update-profile" component={UpdateProfile} />

        {/* Individual content pages - temporarily accessible */}
        <Route path="/recipe/:id" component={RecipeDetail} />
        <Route path="/meal-plan/:id" component={MealPlan} />

        {/* Legal pages - accessible to all */}
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