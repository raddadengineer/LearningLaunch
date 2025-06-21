import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Reading from "@/pages/reading";
import MathPage from "@/pages/math";
import ParentDashboard from "@/pages/parent-dashboard";
import Admin from "@/pages/admin";
import UserManagement from "@/pages/user-management";
import UserSelection from "@/pages/user-selection";
import Navigation from "@/components/navigation";

function Router() {
  // Simplify the user selection logic to avoid React state issues
  const currentUserId = localStorage.getItem("currentUserId");
  
  return (
    <div className="min-h-screen relative">
      <Switch>
        {/* Admin route always available */}
        <Route path="/admin" component={Admin} />
        
        {/* User management always available */}
        <Route path="/users" component={UserManagement} />
        
        {/* If no user selected, show user selection page for all other routes */}
        {!currentUserId ? (
          <Route component={UserSelection} />
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/reading" component={Reading} />
            <Route path="/math" component={MathPage} />
            <Route path="/parent-dashboard" component={ParentDashboard} />
            <Route path="/select-user" component={UserSelection} />
            <Route component={Home} />
          </>
        )}
      </Switch>
      {currentUserId && <Navigation />}
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
