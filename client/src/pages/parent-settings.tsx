import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { VoiceSettingsForm } from "@/components/voice-settings-form";
import { AdminWordManagement } from "@/components/admin-word-management";
import { ParentProgressSummary } from "@/components/parent-progress-summary";

type SettingsTab = "voice" | "progress" | "words";

const GROWNUPS_SESSION_KEY = "grownUpsConfirmed";

function tabFromSearch(): SettingsTab {
  const tab = new URLSearchParams(window.location.search).get("tab");
  if (tab === "progress" || tab === "words") return tab;
  return "voice";
}

export default function ParentSettings() {
  const [, setLocation] = useLocation();
  const [confirmed, setConfirmed] = useState(
    () => sessionStorage.getItem(GROWNUPS_SESSION_KEY) === "true"
  );
  const [showGate, setShowGate] = useState(
    () => sessionStorage.getItem(GROWNUPS_SESSION_KEY) !== "true"
  );
  const [activeTab, setActiveTab] = useState<SettingsTab>(tabFromSearch);

  useEffect(() => {
    setActiveTab(tabFromSearch());
  }, []);

  const handleGoBack = () => {
    setShowGate(false);
    setLocation("/");
  };

  const handleContinue = () => {
    sessionStorage.setItem(GROWNUPS_SESSION_KEY, "true");
    setShowGate(false);
    setConfirmed(true);
  };

  const handleTabChange = (value: string) => {
    const tab = value as SettingsTab;
    setActiveTab(tab);
    const url = tab === "voice" ? "/parent-settings" : `/parent-settings?tab=${tab}`;
    window.history.replaceState(null, "", url);
  };

  return (
    <>
      <AlertDialog open={showGate} onOpenChange={(open) => { if (!open) handleGoBack(); }}>
        <AlertDialogContent className="rounded-2xl max-w-sm mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-fredoka text-xl">Grown-ups only</AlertDialogTitle>
            <AlertDialogDescription>
              These settings are for grown-ups only. Kids should ask a parent before changing settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={handleGoBack} className="rounded-xl">
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleContinue} className="rounded-xl bg-indigo-500 hover:bg-indigo-600">
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {confirmed && (
        <div className="min-h-screen pb-24 bg-gray-50">
          <div className="flex items-center justify-between p-4 bg-white kid-shadow">
            <h2 className="text-2xl sm:text-3xl font-fredoka text-gray-800">Grown-ups Settings</h2>
            <Link href="/">
              <Button variant="outline" size="sm" className="rounded-full touch-friendly">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </Link>
          </div>

          <main className="container mx-auto px-4 py-6 max-w-4xl">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="voice" className="font-fredoka">🎙️ Voice</TabsTrigger>
                <TabsTrigger value="progress" className="font-fredoka">📊 Progress</TabsTrigger>
                <TabsTrigger value="words" className="font-fredoka">📝 Words</TabsTrigger>
              </TabsList>

              <TabsContent value="voice">
                <Card className="rounded-3xl kid-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-fredoka text-xl">
                      Voice & Reading Coach
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VoiceSettingsForm />
                    <p className="text-xs text-gray-500 mt-4 pt-4 border-t">
                      Voice settings are saved per child profile and sync when you switch users.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="progress">
                <Card className="rounded-3xl kid-shadow">
                  <CardHeader>
                    <CardTitle className="font-fredoka text-xl">Progress Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ParentProgressSummary />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="words">
                <Card className="rounded-3xl kid-shadow">
                  <CardHeader>
                    <CardTitle className="font-fredoka text-xl">Word Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AdminWordManagement />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      )}
    </>
  );
}
