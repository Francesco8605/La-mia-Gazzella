import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";
import Auth from "@/pages/auth";
import Home from "@/pages/home";
import SubscriptionPlans from "@/pages/subscription-plans";
import SubscriptionSuccess from "@/pages/subscription-success";
import NotFound from "@/pages/not-found";
import "./index.css";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/auth" component={Auth} />
          <Route path="/piani-abbonamento" component={SubscriptionPlans} />
          <Route path="/" component={Home} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/auth" component={Auth} />
          <Route path="/piani-abbonamento" component={SubscriptionPlans} />
          <Route path="/subscription-success" component={SubscriptionSuccess} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}