import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { testPhonemeClips, type PhonicsPace } from "@/lib/speech";
import {
  loadPreferencesFromLocalStorage,
  normalizePreferences,
  savePreferences,
} from "@/lib/voice-preferences";
import type { User } from "@shared/schema";
import { useTheme } from "@/lib/theme";

export function VoiceSettingsForm() {
  const { theme } = useTheme();
  const { toast } = useToast();
  const currentUserId = localStorage.getItem("currentUserId");
  const [kokoroVoiceId, setKokoroVoiceId] = useState("af_heart");
  const [kokoroEnabled, setKokoroEnabled] = useState(false);
  const [aiCoachEnabled, setAiCoachEnabled] = useState(true);
  const [phonicsPace, setPhonicsPace] = useState<PhonicsPace>("slow");
  const [forceRegenerate, setForceRegenerate] = useState(true);
  const [generating, setGenerating] = useState(false);

  const { data: phonemeStatus, refetch: refetchPhonemeStatus } = useQuery<{
    clips: { mp3: number; wav: number; human: number; total: number };
    expected: number;
    kokoroAvailable: boolean;
    upstream: string;
  }>({
    queryKey: ["/api/phonemes/status"],
    queryFn: () => fetch("/api/phonemes/status").then((res) => res.json()),
  });

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user", currentUserId],
    queryFn: () => fetch(`/api/user/${currentUserId}`).then((res) => res.json()),
    enabled: !!currentUserId,
  });

  useEffect(() => {
    const prefs = user?.preferences
      ? normalizePreferences(user.preferences)
      : loadPreferencesFromLocalStorage();
    setKokoroVoiceId(prefs.kokoroVoiceId);
    setKokoroEnabled(prefs.kokoroEnabled);
    setAiCoachEnabled(prefs.aiReadingCoachEnabled);
    setPhonicsPace(prefs.phonicsPace);
  }, [user]);

  const saveSettings = async () => {
    if (!currentUserId) {
      toast({
        title: "No child selected",
        description: "Select a child profile first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await savePreferences(parseInt(currentUserId), {
        kokoroEnabled,
        aiReadingCoachEnabled: aiCoachEnabled,
        phonicsPace,
        kokoroVoiceId,
      });
      toast({
        title: "Settings Saved",
        description: `Voice preferences saved for ${user?.name ?? "this child"}.`,
      });
    } catch (error) {
      console.error("Failed to save voice preferences:", error);
      toast({
        title: "Save Failed",
        description: "Could not save voice preferences.",
        variant: "destructive",
      });
    }
  };

  const testVoice = async () => {
    try {
      if (kokoroEnabled) {
        const response = await fetch("/api/speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: "Hello! This is a test of the Kokoro voice system.",
            voice: kokoroVoiceId,
            response_format: "mp3",
            speed: 1.0,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
      }

      await testPhonemeClips({ rate: 0.8, pitch: 1.1 });

      toast({
        title: "Testing Voice",
        description: kokoroEnabled
          ? "Kokoro test via server proxy, then phoneme clips (buh → oo → kuh → book)."
          : "Playing phoneme clips for book (buh → oo → kuh → book).",
      });
    } catch (error) {
      console.error("Failed to test voice:", error);
      toast({
        title: "Test Failed",
        description: kokoroEnabled
          ? "Could not reach /api/speech. Phoneme clips may still play if available."
          : "Could not play phoneme test sequence.",
        variant: "destructive",
      });
    }
  };

  const generatePhonemes = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/phonemes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: forceRegenerate, voice: kokoroVoiceId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "Generation failed");
      }
      await refetchPhonemeStatus();
      toast({
        title: "Phoneme clips generated",
        description: `${data.generated?.length ?? 0} created, ${data.skipped?.length ?? 0} skipped via ${data.backend}.`,
      });
      if (data.failed?.length) {
        toast({
          title: "Some clips failed",
          description: data.failed.map((f: { sound: string }) => f.sound).join(", "),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Phoneme generation failed:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Could not generate phoneme clips.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  // Theme styling helpers
  const isSpace = theme === "space";
  const isForest = theme === "forest";
  const isArcade = theme === "arcade";

  const userBannerClass = isSpace
    ? "text-sm font-semibold text-violet-300 bg-violet-950/40 border border-violet-500/20 rounded-xl px-4 py-2.5"
    : isForest
    ? "text-sm font-semibold text-[#78350F] bg-[#FEF3C7] border border-[#D97706]/35 rounded-xl px-4 py-2.5"
    : "text-sm font-bold text-[#12082E] bg-slate-100 border-2 border-[#12082E] rounded-xl px-4 py-2.5";

  const textMuted = isSpace ? "text-violet-200/80 text-sm" : isForest ? "text-[#78350F]/80 text-sm" : "text-gray-600 text-sm";
  const textMutedXs = isSpace ? "text-violet-300/60 text-xs" : isForest ? "text-[#78350F]/60 text-xs" : "text-gray-500 text-xs";

  const panelBaseClass = isSpace
    ? "p-4 bg-slate-900/40 rounded-2xl border border-violet-500/20 space-y-2 text-white"
    : isForest
    ? "p-4 bg-[#FFFBEB] rounded-2xl border-3 border-[#D97706] space-y-2 text-[#78350F] shadow-[3px_3px_0_#92400E]"
    : "p-4 bg-white rounded-2xl border-4 border-[#12082E] space-y-2 text-[#12082E] shadow-[4px_4px_0_#12082E]";

  const panelGreenClass = isSpace
    ? "p-4 bg-emerald-950/20 rounded-2xl border border-emerald-500/20 space-y-3 text-white"
    : isForest
    ? "p-4 bg-[#F0FDF4] rounded-2xl border-3 border-[#16A34A] space-y-3 text-[#14532D] shadow-[3px_3px_0_#14532D]"
    : "p-4 bg-white rounded-2xl border-4 border-[#12082E] space-y-3 text-[#12082E] shadow-[4px_4px_0_#12082E]";

  const panelOrangeClass = isSpace
    ? "p-4 bg-orange-950/20 rounded-2xl border border-orange-500/20 space-y-3 text-white"
    : isForest
    ? "p-4 bg-[#FFFBEB] rounded-2xl border-3 border-[#D97706] space-y-3 text-[#78350F] shadow-[3px_3px_0_#92400E]"
    : "p-4 bg-white rounded-2xl border-4 border-[#12082E] space-y-3 text-[#12082E] shadow-[4px_4px_0_#12082E]";

  const saveBtnClass = isSpace
    ? "bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl px-5 py-2.5 shadow-md shadow-violet-500/10"
    : isForest
    ? "bg-[#16A34A] hover:bg-[#15803D] text-white border-3 border-[#14532D] font-bold rounded-2xl px-5 py-2.5 shadow-[2px_2px_0_#14532D]"
    : "bg-[#2ED573] hover:bg-[#27AE60] text-white border-4 border-[#12082E] font-bold rounded-2xl px-5 py-2.5 shadow-[4px_4px_0_#12082E]";

  const testBtnClass = isSpace
    ? "border border-violet-500/35 text-violet-300 hover:bg-violet-950/40 rounded-2xl px-5 py-2.5 bg-transparent"
    : isForest
    ? "bg-[#FFFBEB] border-3 border-[#D97706] text-[#78350F] hover:bg-[#FEF3C7] font-bold rounded-2xl px-5 py-2.5 shadow-[2px_2px_0_#92400E]"
    : "bg-[#FD79A8] hover:bg-[#E84393] text-white border-4 border-[#12082E] font-bold rounded-2xl px-5 py-2.5 shadow-[4px_4px_0_#12082E]";

  const generateBtnClass = isSpace
    ? "w-full bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl py-2.5 shadow-md shadow-orange-500/10"
    : isForest
    ? "w-full bg-[#D97706] hover:bg-[#B45309] border-3 border-[#92400E] text-white font-bold rounded-xl py-2.5 shadow-[2px_2px_0_#92400E]"
    : "w-full bg-[#FFE600] hover:bg-[#E6CE00] border-4 border-[#12082E] text-[#12082E] font-bold rounded-xl py-2.5 shadow-[3px_3px_0_#12082E]";

  const paceBtnClass = (active: boolean) => {
    if (active) {
      return isSpace
        ? "bg-violet-600 text-white font-bold rounded-xl"
        : isForest
        ? "bg-[#D97706] border-2 border-[#92400E] text-white font-bold rounded-xl"
        : "bg-[#12082E] text-white font-bold rounded-xl border-2 border-[#12082E]";
    } else {
      return isSpace
        ? "border border-violet-500/20 text-violet-300 hover:bg-violet-950/30 rounded-xl bg-transparent"
        : isForest
        ? "bg-[#FEF9E7] border-2 border-[#D97706]/40 text-[#78350F] hover:bg-[#FEF3C7] rounded-xl"
        : "bg-white border-2 border-[#12082E] text-[#12082E] hover:bg-slate-100 rounded-xl";
    }
  };

  return (
    <div className="space-y-5">
      {user && (
        <p className={userBannerClass}>
          🧒 Settings for: <span className="font-fredoka text-base ml-1">{user.name}</span>
        </p>
      )}

      <p className={textMuted}>
        High-quality Kokoro voices route through the app server at <code className="text-xs bg-black/10 px-1 py-0.5 rounded">/api/speech</code>.
        Phonics sounds use pre-recorded clips with TTS fallback. Preferences sync per child profile.
      </p>

      {/* Row 1: Enable Kokoro */}
      <div className={panelBaseClass}>
        <div className="flex items-center justify-between">
          <Label htmlFor="enableKokoro" className="font-fredoka text-sm sm:text-base cursor-pointer flex-1 pr-4">
            Enable Kokoro High-Quality Voices
          </Label>
          <Switch
            id="enableKokoro"
            checked={kokoroEnabled}
            onCheckedChange={setKokoroEnabled}
          />
        </div>
      </div>

      {/* Row 2: Enable AI Coach */}
      <div className={panelBaseClass}>
        <div className="flex items-center justify-between">
          <Label htmlFor="enableAiCoach" className="font-fredoka text-sm sm:text-base cursor-pointer flex-1 pr-4">
            Enable AI Reading Coach
          </Label>
          <Switch
            id="enableAiCoach"
            checked={aiCoachEnabled}
            onCheckedChange={setAiCoachEnabled}
          />
        </div>
        <p className={textMutedXs}>
          Guides kids through sounding out letters and words with phoneme sounds
          (buh, sh, oo) instead of letter names.
        </p>
      </div>

      {/* Row 3: Phonics Pace */}
      <div className={panelGreenClass}>
        <Label className="font-fredoka text-sm sm:text-base">Phonics Pace</Label>
        <p className={textMutedXs}>
          Controls pause between letter sounds when sounding out words. Slow is recommended for ages 4–5.
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPhonicsPace("slow")}
            className={paceBtnClass(phonicsPace === "slow")}
          >
            Slow
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setPhonicsPace("normal")}
            className={paceBtnClass(phonicsPace === "normal")}
          >
            Normal
          </Button>
        </div>
      </div>

      {/* Row 4: Voice ID */}
      <div className={`space-y-4 transition-all duration-200 ${!kokoroEnabled ? "opacity-40 pointer-events-none" : ""}`}>
        <div className="space-y-1.5">
          <Label htmlFor="kokoroVoiceId" className="font-fredoka text-sm">Voice ID</Label>
          <Input
            id="kokoroVoiceId"
            value={kokoroVoiceId}
            onChange={(e) => setKokoroVoiceId(e.target.value)}
            placeholder="af_heart"
            className="theme-input font-bold"
          />
          <p className={textMutedXs}>Voice sent to the server proxy (e.g., af_heart, af_bella, am_adam).</p>
        </div>
      </div>

      {/* Row 5: Phoneme clip library */}
      <div className={panelOrangeClass}>
        <Label className="font-fredoka text-sm sm:text-base">Phoneme clip library</Label>
        <p className={textMutedXs}>
          Generate isolated letter sounds (buh, sh, ay, …) from your Kokoro server.
          Used when kids tap Sound It Out.
        </p>
        {phonemeStatus && (
          <div className={`${textMutedXs} bg-black/10 p-3 rounded-xl space-y-1 font-semibold`}>
            <p>
              Clips on disk: <span className="font-bold">{phonemeStatus.clips.total}</span> / {phonemeStatus.expected}
              {phonemeStatus.clips.human > 0 && ` (${phonemeStatus.clips.human} human`}
              {phonemeStatus.clips.mp3 > 0 && `${phonemeStatus.clips.human > 0 ? ", " : " ("}${phonemeStatus.clips.mp3} synthesized mp3`}
              {phonemeStatus.clips.wav > 0 && `, ${phonemeStatus.clips.wav} wav`}
              {(phonemeStatus.clips.human > 0 || phonemeStatus.clips.mp3 > 0) && ")"}
            </p>
            <p>
              Kokoro Status:{" "}
              <span className={phonemeStatus.kokoroAvailable ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                {phonemeStatus.kokoroAvailable ? "connected" : "unreachable"}
              </span>
              {" · "}
              <span className="font-mono text-[10px] opacity-75">{phonemeStatus.upstream}</span>
            </p>
          </div>
        )}
        <div className="flex items-center justify-between pt-1">
          <Label htmlFor="forceRegenerate" className="text-xs sm:text-sm cursor-pointer flex-1">
            Overwrite existing clips
          </Label>
          <Switch
            id="forceRegenerate"
            checked={forceRegenerate}
            onCheckedChange={setForceRegenerate}
          />
        </div>
        <Button
          type="button"
          onClick={generatePhonemes}
          disabled={generating}
          className={generateBtnClass}
        >
          {generating ? "Generating… (may take a minute)" : "Generate phoneme clips"}
        </Button>
      </div>

      {/* Row 6: Submit actions */}
      <div className="flex flex-wrap gap-3 pt-3">
        <Button onClick={saveSettings} className={saveBtnClass}>
          Save Settings
        </Button>
        <Button
          onClick={testVoice}
          variant="outline"
          className={testBtnClass}
        >
          Test Voice Setup
        </Button>
      </div>
    </div>
  );
}
