import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export function VoiceSettingsForm() {
  const { toast } = useToast();
  const [kokoroUrl, setKokoroUrl] = useState("");
  const [kokoroVoiceId, setKokoroVoiceId] = useState("");
  const [kokoroEnabled, setKokoroEnabled] = useState(false);
  const [aiCoachEnabled, setAiCoachEnabled] = useState(true);

  useEffect(() => {
    setKokoroUrl(localStorage.getItem("kokoroApiUrl") || "http://localhost:8880/v1/audio/speech");
    setKokoroVoiceId(localStorage.getItem("kokoroVoiceId") || "af_heart");
    setKokoroEnabled(localStorage.getItem("kokoroEnabled") === "true");
    setAiCoachEnabled(localStorage.getItem("aiReadingCoachEnabled") !== "false");
  }, []);

  const saveSettings = () => {
    localStorage.setItem("kokoroApiUrl", kokoroUrl);
    localStorage.setItem("kokoroVoiceId", kokoroVoiceId);
    localStorage.setItem("kokoroEnabled", kokoroEnabled.toString());
    localStorage.setItem("aiReadingCoachEnabled", aiCoachEnabled.toString());

    toast({
      title: "Settings Saved",
      description: "Voice preferences have been updated successfully.",
    });
  };

  const testVoice = async () => {
    if (!kokoroEnabled) {
      toast({
        title: "Kokoro Disabled",
        description: "Please enable Kokoro voice to test it.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(kokoroUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "kokoro",
          input: aiCoachEnabled
            ? "Let's sound it out together! Buh... oo... kuh... Now blend them. The word is book!"
            : "Hello! This is a test of the Kokoro voice system.",
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

      toast({
        title: "Testing Voice",
        description: "You should hear the test message now.",
      });
    } catch (error) {
      console.error("Failed to test Kokoro voice:", error);
      toast({
        title: "Test Failed",
        description: "Could not connect to Kokoro API. Please check the URL.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-600 text-sm">
        Configure a local Kokoro-FastAPI server for high-quality, natural-sounding voices.
        When enabled, this will override the standard browser voice for reading and math activities.
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
            🤖 Enable AI Reading Coach
          </Label>
          <Switch
            id="enableAiCoach"
            checked={aiCoachEnabled}
            onCheckedChange={setAiCoachEnabled}
          />
        </div>
        <p className="text-xs text-gray-600">
          Guides kids through sounding out letters and words with phoneme sounds
          (buh, sh, oo) instead of letter names. Works with Kokoro or browser voice.
        </p>
      </div>

      <div className={`space-y-4 transition-opacity duration-200 ${!kokoroEnabled ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="space-y-2">
          <Label htmlFor="kokoroUrl">API URL</Label>
          <Input
            id="kokoroUrl"
            value={kokoroUrl}
            onChange={(e) => setKokoroUrl(e.target.value)}
            placeholder="http://localhost:8880/v1/audio/speech"
          />
          <p className="text-xs text-gray-500">The full endpoint URL for the speech completions API.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="kokoroVoiceId">Voice ID</Label>
          <Input
            id="kokoroVoiceId"
            value={kokoroVoiceId}
            onChange={(e) => setKokoroVoiceId(e.target.value)}
            placeholder="af_heart"
          />
          <p className="text-xs text-gray-500">The ID of the voice to use (e.g., af_heart, af_bella).</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button onClick={saveSettings} className="bg-indigo-500 hover:bg-indigo-600 text-white">
          Save Settings
        </Button>
        <Button
          onClick={testVoice}
          variant="outline"
          className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
          disabled={!kokoroEnabled}
        >
          Test Voice Setup
        </Button>
      </div>
    </div>
  );
}
