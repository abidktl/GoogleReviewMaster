import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";

// Pages
import Dashboard from "@/pages/dashboard";
import Reviews from "@/pages/reviews";
import Templates from "@/pages/templates";
import GMBIntegration from "@/pages/gmb-integration";
import NotFound from "@/pages/not-found";

// Layout
import AppLayout from "@/components/layout/app-layout";

// PWA utilities
import { initializePWA } from "./lib/pwa";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/reviews" component={Reviews} />
        <Route path="/templates" component={Templates} />
        <Route path="/integrations/gmb" component={GMBIntegration} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  useEffect(() => {
    // Initialize PWA features
    initializePWA();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
