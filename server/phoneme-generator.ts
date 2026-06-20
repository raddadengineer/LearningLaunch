import { execSync } from "child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "fs";
import path from "path";
import { ALL_PHONEME_SOUNDS } from "@shared/phoneme-sounds";

const TTS_INPUT: Record<string, string> = {
  fff: "fff",
  sss: "ssss",
  mmm: "mmm",
  nnn: "nnn",
  lll: "lll",
  rrr: "rrr",
  vvv: "vvv",
  zzz: "zzz",
  eye: "eye",
  ay: "ay",
  shun: "shun",
};

export type PhonemeGenerateResult = {
  backend: "Kokoro" | "macOS say" | "none";
  upstream: string;
  generated: string[];
  skipped: string[];
  failed: { sound: string; error: string }[];
  outputDir: string;
};

export function getPhonemeOutputDir(): string {
  const root = path.resolve(import.meta.dirname, "..");
  if (process.env.NODE_ENV === "production") {
    return path.join(root, "dist", "public", "audio", "phonemes");
  }
  return path.join(root, "client", "public", "audio", "phonemes");
}

export function countPhonemeClips(): { mp3: number; wav: number; total: number } {
  const dir = getPhonemeOutputDir();
  if (!existsSync(dir)) return { mp3: 0, wav: 0, total: 0 };
  const files = readdirSync(dir);
  const mp3 = files.filter((f) => f.endsWith(".mp3")).length;
  const wav = files.filter((f) => f.endsWith(".wav")).length;
  return { mp3, wav, total: mp3 + wav };
}

async function kokoroAvailable(kokoroUrl: string, kokoroVoice: string): Promise<boolean> {
  try {
    const body = kokoroUrl.includes("/api/speech")
      ? { input: "test", voice: kokoroVoice, response_format: "mp3", speed: 0.65 }
      : {
          model: "kokoro",
          input: "test",
          voice: kokoroVoice,
          response_format: "mp3",
          speed: 0.65,
        };

    const res = await fetch(kokoroUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function generateWithKokoro(
  sound: string,
  outDir: string,
  kokoroUrl: string,
  kokoroVoice: string,
): Promise<void> {
  const input = TTS_INPUT[sound] ?? sound;
  const body = kokoroUrl.includes("/api/speech")
    ? { input, voice: kokoroVoice, response_format: "mp3", speed: 0.65 }
    : {
        model: "kokoro",
        input,
        voice: kokoroVoice,
        response_format: "mp3",
        speed: 0.65,
      };

  const res = await fetch(kokoroUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Kokoro HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(path.join(outDir, `${sound}.mp3`), buf);
}

function generateWithMacSay(sound: string, outDir: string): void {
  const input = TTS_INPUT[sound] ?? sound;
  const aiff = path.join(outDir, `${sound}.aiff`);
  const wav = path.join(outDir, `${sound}.wav`);
  execSync(`say -v Samantha -r 130 ${JSON.stringify(input)} -o ${JSON.stringify(aiff)}`, {
    stdio: "pipe",
  });
  execSync(
    `afconvert -f WAVE -d LEI16@44100 ${JSON.stringify(aiff)} ${JSON.stringify(wav)}`,
    { stdio: "pipe" },
  );
  execSync(`rm ${JSON.stringify(aiff)}`, { stdio: "pipe" });
}

export async function generatePhonemeClips(options: {
  force?: boolean;
  kokoroUrl?: string;
  kokoroVoice?: string;
}): Promise<PhonemeGenerateResult> {
  const force = options.force ?? false;
  const kokoroUrl =
    options.kokoroUrl ??
    process.env.KOKORO_URL ??
    "http://192.168.10.7:8880/v1/audio/speech";
  const kokoroVoice = options.kokoroVoice ?? process.env.KOKORO_VOICE ?? "af_heart";
  const outDir = getPhonemeOutputDir();

  mkdirSync(outDir, { recursive: true });

  const useKokoro = await kokoroAvailable(kokoroUrl, kokoroVoice);
  const backend = useKokoro ? "Kokoro" : process.platform === "darwin" ? "macOS say" : "none";

  const result: PhonemeGenerateResult = {
    backend,
    upstream: kokoroUrl,
    generated: [],
    skipped: [],
    failed: [],
    outputDir: outDir,
  };

  if (backend === "none") {
    throw new Error("No audio backend available. Start Kokoro or run on macOS.");
  }

  const ext = useKokoro ? ".mp3" : ".wav";

  for (const sound of ALL_PHONEME_SOUNDS) {
    const outPath = path.join(outDir, `${sound}${ext}`);
    if (!force && existsSync(outPath)) {
      result.skipped.push(sound);
      continue;
    }
    try {
      if (useKokoro) {
        await generateWithKokoro(sound, outDir, kokoroUrl, kokoroVoice);
      } else {
        generateWithMacSay(sound, outDir);
      }
      result.generated.push(sound);
    } catch (error) {
      result.failed.push({
        sound,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return result;
}
