import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { VoiceSettingsForm } from "@/components/voice-settings-form";
import { AdminWordManagement } from "@/components/admin-word-management";
import { ParentProgressSummary } from "@/components/parent-progress-summary";
import { ThemePicker } from "@/components/theme-picker";
import { motion } from "framer-motion";

type SettingsTab = "voice" | "progress" | "words" | "theme";
const GROWNUPS_SESSION_KEY = "grownUpsConfirmed";

function tabFromSearch(): SettingsTab {
  const tab = new URLSearchParams(window.location.search).get("tab");
  if (tab === "progress" || tab === "words" || tab === "theme") return tab;
  return "voice";
}

export default function ParentSettings() {
  const [, setLocation] = useLocation();
  const [confirmed, setConfirmed] = useState(() => sessionStorage.getItem(GROWNUPS_SESSION_KEY) === "true");
  const [showGate, setShowGate] = useState(() => sessionStorage.getItem(GROWNUPS_SESSION_KEY) !== "true");
  const [activeTab, setActiveTab] = useState<SettingsTab>(tabFromSearch);

  useEffect(() => { setActiveTab(tabFromSearch()); }, []);

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

  const TAB_CONFIG: Record<SettingsTab, { icon: string; label: string; gradient: string }> = {
    theme:    { icon: "🎨", label: "Theme",    gradient: "from-pink-500 to-rose-500"    },
    voice:    { icon: "🎙️", label: "Voice",    gradient: "from-violet-500 to-purple-600" },
    progress: { icon: "📊", label: "Progress", gradient: "from-emerald-500 to-teal-500"  },
    words:    { icon: "📝", label: "Words",    gradient: "from-sky-500 to-blue-600"      },
  };

  return (
    <>
      {/* ── Gate ── */}
      <AlertDialog open={showGate} onOpenChange={(open) => { if (!open) setLocation("/"); }}>
        <AlertDialogContent className="rounded-3xl max-w-sm mx-4 border-0 shadow-2xl">
          <AlertDialogHeader className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-4xl shadow-xl">🦉</div>
            <AlertDialogTitle className="font-fredoka text-2xl text-center">Grown-ups only!</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-gray-500">
              These settings are for parents and guardians.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-2">
            <AlertDialogCancel onClick={() => setLocation("/")} className="rounded-2xl border-2 font-bold">
              ← Go Back
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleContinue}
              className="rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 font-bold shadow-md">
              I'm a Grown-up ✓
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Main ── */}
      {confirmed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="parent-page min-h-screen pb-24">
          {/* Header */}
          <div className="parent-header px-5 py-4 flex items-center justify-between sticky top-0 z-50">
            <div>
              <h2 className="text-2xl font-fredoka gradient-text-purple">Grown-ups Settings</h2>
              <p className="text-xs text-gray-400 font-bold">Manage your child's experience</p>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="rounded-full w-10 h-10 p-0 border-2 bg-white/70 hover:bg-white">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </Link>
          </div>

          <main className="container mx-auto px-4 py-6 max-w-4xl">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 bg-white/70 backdrop-blur-sm rounded-2xl p-1.5 h-auto shadow-sm border border-white/80">
                {(["theme","voice","progress","words"] as SettingsTab[]).map((tab) => {
                  const { icon, label, gradient } = TAB_CONFIG[tab];
                  return (
                    <TabsTrigger key={tab} value={tab}
                      className={`font-fredoka text-sm rounded-xl py-2.5 transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:${gradient} data-[state=active]:text-white data-[state=active]:shadow-md`}>
                      {icon} {label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Theme tab */}
              <TabsContent value="theme">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="rounded-3xl kid-shadow border-0">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 font-fredoka text-xl">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-xl shadow-sm">🎨</div>
                        App Theme
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 mb-5">
                        Choose the look and feel of the app. Your child will see the theme you pick across all screens!
                      </p>
                      <ThemePicker />
                      <p className="text-xs text-gray-400 mt-5 pt-4 border-t border-gray-100">
                        Theme is saved automatically and syncs across all devices on this browser.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Voice tab */}
              <TabsContent value="voice">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="rounded-3xl kid-shadow border-0">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 font-fredoka text-xl">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl shadow-sm">🎙️</div>
                        Voice & Reading Coach
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <VoiceSettingsForm />
                      <p className="text-xs text-gray-400 mt-5 pt-4 border-t border-gray-100">
                        Voice settings are saved per child profile.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Progress tab */}
              <TabsContent value="progress">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="rounded-3xl kid-shadow border-0">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 font-fredoka text-xl">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xl shadow-sm">📊</div>
                        Progress Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent><ParentProgressSummary /></CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Words tab */}
              <TabsContent value="words">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="rounded-3xl kid-shadow border-0">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 font-fredoka text-xl">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-xl shadow-sm">📝</div>
                        Word Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent><AdminWordManagement /></CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </main>
        </motion.div>
      )}
    </>
  );
}
