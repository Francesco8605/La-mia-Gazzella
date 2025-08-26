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

  // Show loading during auth check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Temporarily bypass authentication for testing
  // if (!isAuthenticated) {
  //   return (
  //     <Switch>
  //       <Route path="/auth" component={Auth} />
  //       <Route path="/privacy-policy" component={PrivacyPolicy} />
  //       <Route path="/terms-of-service" component={TermsOfService} />
  //       <Route component={Auth} />
  //     </Switch>
  //   );
  // }

  // Authenticated - show full app with navigation
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

        {/* Protected Routes - Require Active Subscription */}
        <Route path="/recipe-generator">
          {() => (
            <SubscriptionGuard>
              <ProfileGuard>
                <RecipeGenerator />
              </ProfileGuard>
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
              <ProfileGuard>
                <MealPlanGenerator />
              </ProfileGuard>
            </SubscriptionGuard>
          )}
        </Route>
        <Route path="/meal-plan-generator">
          {() => (
            <SubscriptionGuard>
              <ProfileGuard>
                <MealPlanGenerator />
              </ProfileGuard>
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
        <Route path="/consulente-nutrizionale">
          {() => (
            <SubscriptionGuard>
              <AIChat />
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
        
        {/* Profile Management - Requires Auth but not necessarily subscription */}
        <Route path="/aggiorna-profilo" component={UpdateProfile} />
        <Route path="/update-profile" component={UpdateProfile} />

        {/* Individual content pages - subscription protected */}
        <Route path="/recipe/:id">
          {() => (
            <SubscriptionGuard>
              <RecipeDetail />
            </SubscriptionGuard>
          )}
        </Route>
        <Route path="/meal-plan/:id">
          {() => (
            <SubscriptionGuard>
              <MealPlan />
            </SubscriptionGuard>
          )}
        </Route>

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