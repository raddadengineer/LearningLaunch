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
import { useTheme, getThemeIcon, type IconKey, type Theme } from "@/lib/theme";

type SettingsTab = "voice" | "progress" | "words" | "theme";
const GROWNUPS_SESSION_KEY = "grownUpsConfirmed";

function tabFromSearch(): SettingsTab {
  const tab = new URLSearchParams(window.location.search).get("tab");
  if (tab === "progress" || tab === "words" || tab === "theme") return tab;
  return "voice";
}

export default function ParentSettings() {
  const [, setLocation] = useLocation();
  const { theme } = useTheme();
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

  const TAB_CONFIG: Record<SettingsTab, { iconKey: IconKey; label: string; gradient: string }> = {
    theme:    { iconKey: "theme", label: "Theme",    gradient: "from-pink-500 to-rose-500"    },
    voice:    { iconKey: "voice", label: "Voice",    gradient: "from-violet-500 to-purple-600" },
    progress: { iconKey: "progress", label: "Progress", gradient: "from-emerald-500 to-teal-500"  },
    words:    { iconKey: "words", label: "Words",    gradient: "from-sky-500 to-blue-600"      },
  };

  // Theme-aware design tokens
  const isSpace = theme === "space";
  const isForest = theme === "forest";
  const isArcade = theme === "arcade";

  const pageBgClass = "theme-page min-h-screen pb-24";
  const headerClass = "theme-header px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-50 transition-all duration-200";

  const titleClass = isSpace
    ? "text-xl sm:text-2xl font-fredoka text-violet-300"
    : isForest
    ? "text-xl sm:text-2xl font-fredoka text-[#78350F]"
    : "text-xl sm:text-2xl font-fredoka text-[#12082E]";

  const subtitleClass = isSpace
    ? "text-[10px] sm:text-xs text-violet-400 font-bold"
    : isForest
    ? "text-[10px] sm:text-xs text-[#78350F]/70 font-bold"
    : "text-[10px] sm:text-xs text-[#12082E]/70 font-bold";

  const textMutedClass = isSpace
    ? "text-xs sm:text-sm text-slate-300"
    : isForest
    ? "text-xs sm:text-sm text-[#78350F]/80"
    : "text-xs sm:text-sm text-slate-600";

  const labelClass = isSpace
    ? "text-xs text-violet-400 font-bold uppercase tracking-wider"
    : isForest
    ? "text-xs text-[#78350F]/75 font-bold uppercase tracking-wider"
    : "text-xs text-[#12082E]/75 font-bold uppercase tracking-wider";

  const cardTitleClass = "flex items-center gap-2 font-fredoka text-lg sm:text-xl";

  const tabsListClass = isSpace
    ? "grid w-full grid-cols-4 mb-6 bg-slate-950/40 backdrop-blur-sm rounded-2xl p-1 h-auto border border-violet-500/20"
    : isForest
    ? "grid w-full grid-cols-4 mb-6 bg-[#FEF3C7]/80 backdrop-blur-sm rounded-2xl p-1.5 h-auto border-3 border-[#D97706]"
    : "grid w-full grid-cols-4 mb-6 bg-[#F8F9FA] rounded-2xl p-1.5 h-auto border-4 border-[#12082E] shadow-[4px_4px_0_#12082E]";

  const tabTriggerBase = "font-fredoka text-xs sm:text-sm rounded-xl py-2 sm:py-2.5 transition-all duration-200 flex flex-col xs:flex-row items-center justify-center gap-1 sm:gap-1.5";
  const activeTabClass = isSpace
    ? "data-[state=active]:bg-gradient-to-br data-[state=active]:from-violet-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 hover:text-white"
    : isForest
    ? "data-[state=active]:bg-[#D97706] data-[state=active]:text-white data-[state=active]:shadow-md text-[#78350F] hover:bg-[#FEF3C7]"
    : "data-[state=active]:bg-[#12082E] data-[state=active]:text-white text-[#12082E] hover:bg-slate-200 border-2 border-transparent data-[state=active]:border-[#12082E]";

  const gateContentClass = isSpace
    ? "bg-slate-950/80 backdrop-blur-md text-white border-violet-500/35 border-2 shadow-[0_0_50px_rgba(139,92,246,0.15)] rounded-3xl max-w-sm mx-4"
    : isForest
    ? "bg-[#FFFBEB] text-[#78350F] border-[#D97706] border-4 shadow-[6px_6px_0_#92400E] rounded-3xl max-w-sm mx-4"
    : "bg-white text-[#12082E] border-[#12082E] border-4 shadow-[8px_8px_0_#12082E] rounded-3xl max-w-sm mx-4";

  const gateLogoClass = isSpace
    ? "w-20 h-20 mx-auto mb-3 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-4xl shadow-xl shadow-violet-500/20"
    : isForest
    ? "w-20 h-20 mx-auto mb-3 rounded-3xl bg-[#FEF3C7] border-3 border-[#D97706] flex items-center justify-center text-4xl shadow-[4px_4px_0_#92400E]"
    : "w-20 h-20 mx-auto mb-3 rounded-3xl bg-[#FFE600] border-4 border-[#12082E] flex items-center justify-center text-4xl shadow-[6px_6px_0_#12082E]";

  const cancelBtnClass = isSpace
    ? "rounded-2xl border border-violet-500/40 text-violet-300 hover:bg-violet-950/40 font-bold"
    : isForest
    ? "rounded-2xl border-3 border-[#D97706] bg-[#FFFBEB] text-[#78350F] hover:bg-[#FEF3C7] shadow-[2px_2px_0_#92400E] font-bold"
    : "rounded-2xl border-4 border-[#12082E] bg-white text-[#12082E] hover:bg-slate-100 shadow-[4px_4px_0_#12082E] font-bold";

  const actionBtnClass = isSpace
    ? "rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold shadow-md shadow-violet-500/20"
    : isForest
    ? "rounded-2xl bg-[#16A34A] border-3 border-[#14532D] text-white hover:bg-[#15803D] shadow-[2px_2px_0_#14532D] font-bold"
    : "rounded-2xl bg-[#FFE600] border-4 border-[#12082E] text-[#12082E] hover:bg-[#E6CE00] shadow-[4px_4px_0_#12082E] font-bold";

  return (
    <>
      {/* ── Gate ── */}
      <AlertDialog open={showGate} onOpenChange={(open) => { if (!open) setLocation("/"); }}>
        <AlertDialogContent className={gateContentClass}>
          <AlertDialogHeader className="text-center">
            <div className={gateLogoClass}>
              {getThemeIcon(theme, "gate")}
            </div>
            <AlertDialogTitle className="font-fredoka text-2xl text-center">Grown-ups only!</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm opacity-80">
              These settings are for parents and guardians.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <AlertDialogCancel onClick={() => setLocation("/")} className={cancelBtnClass}>
              ← Go Back
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleContinue} className={actionBtnClass}>
              I'm a Grown-up ✓
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Main ── */}
      {confirmed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={pageBgClass}>
          {/* Header */}
          <div className={headerClass}>
            <div>
              <h2 className={titleClass}>
                {getThemeIcon(theme, "settings")} Grown-ups Settings
              </h2>
              <p className={subtitleClass}>Manage your child's experience</p>
            </div>
            <Link href="/">
              <Button size="sm" className="rounded-full w-10 h-10 p-0 theme-back-btn border-2 bg-transparent flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </Link>
          </div>

          <main className="container mx-auto px-4 py-6 max-w-4xl">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className={tabsListClass}>
                {(["theme","voice","progress","words"] as SettingsTab[]).map((tab) => {
                  const { iconKey, label } = TAB_CONFIG[tab];
                  return (
                    <TabsTrigger key={tab} value={tab} className={`${tabTriggerBase} ${activeTabClass}`}>
                      <span className="text-base sm:text-lg">{getThemeIcon(theme, iconKey)}</span>
                      <span className="hidden xs:inline">{label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Theme tab */}
              <TabsContent value="theme">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="theme-card border-0 overflow-hidden shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className={cardTitleClass}>
                        <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-xl shrink-0">
                          {getThemeIcon(theme, "theme")}
                        </div>
                        App Theme
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`${textMutedClass} mb-5`}>
                        Choose the look and feel of the app. Your child will see the theme you pick across all screens!
                      </p>
                      <ThemePicker />
                      <p className="text-[11px] opacity-60 mt-5 pt-4 border-t border-gray-100/10">
                        Theme is saved automatically and syncs across all devices on this browser.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Voice tab */}
              <TabsContent value="voice">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="theme-card border-0 overflow-hidden shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className={cardTitleClass}>
                        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-xl shrink-0">
                          {getThemeIcon(theme, "voice")}
                        </div>
                        Voice & Reading Coach
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <VoiceSettingsForm />
                      <p className="text-[11px] opacity-60 mt-5 pt-4 border-t border-gray-100/10">
                        Voice settings are saved per child profile.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Progress tab */}
              <TabsContent value="progress">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="theme-card border-0 overflow-hidden shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className={cardTitleClass}>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl shrink-0">
                          {getThemeIcon(theme, "progress")}
                        </div>
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
                  <Card className="theme-card border-0 overflow-hidden shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className={cardTitleClass}>
                        <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center text-xl shrink-0">
                          {getThemeIcon(theme, "words")}
                        </div>
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
