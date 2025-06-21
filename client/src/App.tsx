import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Reading from "@/pages/reading";
import Math from "@/pages/math";
import ParentDashboard from "@/pages/parent-dashboard";
import Navigation from "@/components/navigation";

function Router() {
  return (
    <div className="min-h-screen relative">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/reading" component={Reading} />
        <Route path="/math" component={Math} />
        <Route path="/parent-dashboard" component={ParentDashboard} />
        <Route component={NotFound} />
      </Switch>
      <Navigation />
    </div>
  );
}

function App() {
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
