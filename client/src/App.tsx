import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { ThemeProvider, useTheme } from "@/lib/theme";
import NotFound from "@/pages/not-found";
import Welcome from "@/pages/welcome";
import Home from "@/pages/home";
import Reading from "@/pages/reading";
import Books from "@/pages/books";
import BookReader from "@/pages/book-reader";
import SightWords from "@/pages/sight-words";
import VowelContrast from "@/pages/vowel-contrast";
import MathPage from "@/pages/math";
import ParentDashboard from "@/pages/parent-dashboard";
import ParentSettings from "@/pages/parent-settings";
import Admin from "@/pages/admin";
import UserManagement from "@/pages/user-management";
import UserSelection from "@/pages/user-selection";
import LetterSounds from "@/pages/letter-sounds";
import Navigation from "@/components/navigation";
import { hydratePreferencesForUser } from "@/lib/voice-preferences";

function PreferencesHydrator() {
  useEffect(() => {
    const userId = localStorage.getItem("currentUserId");
    if (userId) {
      hydratePreferencesForUser(parseInt(userId)).catch(() => {});
    }
  }, []);
  return null;
}

function Router() {
  const currentUserId = localStorage.getItem("currentUserId");
  const { theme } = useTheme();

  return (
    <div className="min-h-screen relative" data-theme={theme}>
      <Switch>
        <Route path="/admin" component={Admin} />
        <Route path="/users" component={UserManagement} />
        {!currentUserId ? (
          <>
            <Route path="/" component={Welcome} />
            <Route path="/select-user" component={UserSelection} />
            <Route component={Welcome} />
          </>
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/reading" component={Reading} />
            <Route path="/books" component={Books} />
            <Route path="/books/:id" component={BookReader} />
            <Route path="/vowel-contrast/:vowel?" component={VowelContrast} />
            <Route path="/sight-words" component={SightWords} />
            <Route path="/letter-sounds" component={LetterSounds} />
            <Route path="/math" component={MathPage} />
            <Route path="/parent-dashboard" component={ParentDashboard} />
            <Route path="/parent-settings" component={ParentSettings} />
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
        <ThemeProvider>
          <Toaster />
          <PreferencesHydrator />
          <Router />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
