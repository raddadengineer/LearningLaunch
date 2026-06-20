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

export function VoiceSettingsForm() {
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

  return (
    <div className="space-y-4">
      {user && (
        <p className="text-sm font-medium text-indigo-700 bg-indigo-50 rounded-xl px-4 py-2">
          Settings for: <span className="font-bold">{user.name}</span>
        </p>
      )}

      <p className="text-gray-600 text-sm">
        High-quality Kokoro voices route through the app server at <code className="text-xs">/api/speech</code>.
        Phonics sounds use pre-recorded clips with TTS fallback. Preferences sync per child profile.
      </p>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
        <Label htmlFor="enableKokoro" className="text-gray-800 font-medium cursor-pointer flex-1">
          Enable Kokoro High-Quality Voices
        </Label>
        <Switch
          id="enableKokoro"
          checked={kokoroEnabled}
          onCheckedChange={setKokoroEnabled}
        />
      </div>

      <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="enableAiCoach" className="text-gray-800 font-medium cursor-pointer flex-1">
            Enable AI Reading Coach
          </Label>
          <Switch
            id="enableAiCoach"
            checked={aiCoachEnabled}
            onCheckedChange={setAiCoachEnabled}
          />
        </div>
        <p className="text-xs text-gray-600">
          Guides kids through sounding out letters and words with phoneme sounds
          (buh, sh, oo) instead of letter names.
        </p>
      </div>

      <div className="p-4 bg-green-50 rounded-xl border border-green-100 space-y-3">
        <Label className="text-gray-800 font-medium">Phonics Pace</Label>
        <p className="text-xs text-gray-600">
          Controls pause between letter sounds when sounding out words. Slow is recommended for ages 4–5.
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={phonicsPace === "slow" ? "default" : "outline"}
            onClick={() => setPhonicsPace("slow")}
            className={phonicsPace === "slow" ? "bg-green-600 hover:bg-green-700" : ""}
          >
            Slow
          </Button>
          <Button
            type="button"
            variant={phonicsPace === "normal" ? "default" : "outline"}
            onClick={() => setPhonicsPace("normal")}
            className={phonicsPace === "normal" ? "bg-green-600 hover:bg-green-700" : ""}
          >
            Normal
          </Button>
        </div>
      </div>

      <div className={`space-y-4 transition-opacity duration-200 ${!kokoroEnabled ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="space-y-2">
          <Label htmlFor="kokoroVoiceId">Voice ID</Label>
          <Input
            id="kokoroVoiceId"
            value={kokoroVoiceId}
            onChange={(e) => setKokoroVoiceId(e.target.value)}
            placeholder="af_heart"
          />
          <p className="text-xs text-gray-500">Voice sent to the server proxy (e.g., af_heart, af_bella).</p>
        </div>
      </div>

      <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 space-y-3">
        <Label className="text-gray-800 font-medium">Phoneme clip library</Label>
        <p className="text-xs text-gray-600">
          Generate isolated letter sounds (buh, sh, ay, …) from your Kokoro server.
          Used when kids tap Sound It Out.
        </p>
        {phonemeStatus && (
          <div className="text-xs text-gray-700 space-y-1">
            <p>
              Clips on disk: <span className="font-bold">{phonemeStatus.clips.total}</span> / {phonemeStatus.expected}
              {phonemeStatus.clips.human > 0 && ` (${phonemeStatus.clips.human} human`}
              {phonemeStatus.clips.mp3 > 0 && `${phonemeStatus.clips.human > 0 ? ", " : " ("}${phonemeStatus.clips.mp3} synthesized mp3`}
              {phonemeStatus.clips.wav > 0 && `, ${phonemeStatus.clips.wav} wav`}
              {(phonemeStatus.clips.human > 0 || phonemeStatus.clips.mp3 > 0) && ")"}
            </p>
            <p>
              Kokoro:{" "}
              <span className={phonemeStatus.kokoroAvailable ? "text-green-700 font-bold" : "text-red-600 font-bold"}>
                {phonemeStatus.kokoroAvailable ? "connected" : "unreachable"}
              </span>
              {" · "}
              <span className="font-mono text-[10px]">{phonemeStatus.upstream}</span>
            </p>
          </div>
        )}
        <div className="flex items-center justify-between">
          <Label htmlFor="forceRegenerate" className="text-sm cursor-pointer flex-1">
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
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          {generating ? "Generating… (may take a minute)" : "Generate phoneme clips"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button onClick={saveSettings} className="bg-indigo-500 hover:bg-indigo-600 text-white">
          Save Settings
        </Button>
        <Button
          onClick={testVoice}
          variant="outline"
          className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
        >
          Test Voice Setup
        </Button>
      </div>
    </div>
  );
}
