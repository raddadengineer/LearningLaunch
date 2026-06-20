import { execSync } from "child_process";
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from "fs";
import path from "path";
import {
  ALL_PHONEME_SOUNDS,
  getPhonemeGenerationPrompt,
  getPhonemeGenerationSpeed,
  getPhonemeMaxDurationSec,
  HUMAN_CORE_PHONEME_SOUNDS,
  isHumanCorePhoneme,
} from "@shared/phoneme-sounds";

export type PhonemeGenerateResult = {
  backend: "Kokoro" | "macOS say" | "none";
  upstream: string;
  generated: string[];
  skipped: string[];
  failed: { sound: string; error: string }[];
  outputDir: string;
};

export type HumanPhonemeGenerateResult = {
  generated: string[];
  skipped: string[];
  failed: { sound: string; error: string }[];
  outputDir: string;
};

let ffmpegAvailable: boolean | null = null;

export function getPhonemeOutputDir(): string {
  const root = path.resolve(import.meta.dirname, "..");
  if (process.env.NODE_ENV === "production") {
    return path.join(root, "dist", "public", "audio", "phonemes");
  }
  return path.join(root, "client", "public", "audio", "phonemes");
}

export function getPhonemeHumanOutputDir(): string {
  return path.join(getPhonemeOutputDir(), "human");
}

function hasFfmpeg(): boolean {
  if (ffmpegAvailable !== null) return ffmpegAvailable;
  try {
    execSync("ffmpeg -version", { stdio: "pipe" });
    ffmpegAvailable = true;
  } catch {
    ffmpegAvailable = false;
  }
  return ffmpegAvailable;
}

function postProcessMp3(filePath: string, maxDurationSec: number): void {
  if (!hasFfmpeg()) return;

  const tmp = `${filePath}.tmp.mp3`;
  try {
    execSync(
      [
        "ffmpeg -y -hide_banner -loglevel error",
        `-i ${JSON.stringify(filePath)}`,
        "-af silenceremove=start_periods=1:start_silence=0.01:start_threshold=-40dB:detection=peak,",
        "silenceremove=stop_periods=1:stop_silence=0.01:stop_threshold=-40dB:detection=peak,",
        "loudnorm=I=-16:TP=-1.5:LRA=11",
        `-t ${maxDurationSec}`,
        "-ar 44100",
        JSON.stringify(tmp),
      ].join(" "),
      { stdio: "pipe" },
    );
    execSync(`mv ${JSON.stringify(tmp)} ${JSON.stringify(filePath)}`, { stdio: "pipe" });
  } catch {
    if (existsSync(tmp)) unlinkSync(tmp);
  }
}

export function countPhonemeClips(): { mp3: number; wav: number; human: number; total: number } {
  const dir = getPhonemeOutputDir();
  if (!existsSync(dir)) return { mp3: 0, wav: 0, human: 0, total: 0 };

  const files = readdirSync(dir).filter((f) => !f.startsWith("."));
  const mp3 = files.filter((f) => f.endsWith(".mp3")).length;
  const wav = files.filter((f) => f.endsWith(".wav")).length;

  const humanDir = getPhonemeHumanOutputDir();
  const humanFiles = existsSync(humanDir)
    ? readdirSync(humanDir).filter((f) => f.endsWith(".mp3") || f.endsWith(".wav"))
    : [];
  const human = humanFiles.length;

  const covered = new Set<string>();
  for (const f of files) {
    if (f.endsWith(".mp3") || f.endsWith(".wav")) {
      covered.add(path.basename(f, path.extname(f)));
    }
  }
  for (const f of humanFiles) {
    covered.add(path.basename(f, path.extname(f)));
  }

  return { mp3, wav, human, total: covered.size };
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
  const input = getPhonemeGenerationPrompt(sound);
  const speed = getPhonemeGenerationSpeed(sound);
  const body = kokoroUrl.includes("/api/speech")
    ? { input, voice: kokoroVoice, response_format: "mp3", speed }
    : {
        model: "kokoro",
        input,
        voice: kokoroVoice,
        response_format: "mp3",
        speed,
      };

  const res = await fetch(kokoroUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Kokoro HTTP ${res.status}`);
  const outPath = path.join(outDir, `${sound}.mp3`);
  writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
  postProcessMp3(outPath, getPhonemeMaxDurationSec(sound));
}

function generateWithMacSay(sound: string, outDir: string, ext: ".mp3" | ".wav" = ".wav"): void {
  const input = getPhonemeGenerationPrompt(sound);
  const aiff = path.join(outDir, `${sound}.aiff`);
  const outPath = path.join(outDir, `${sound}${ext}`);
  execSync(`say -v Samantha -r 130 ${JSON.stringify(input)} -o ${JSON.stringify(aiff)}`, {
    stdio: "pipe",
  });
  if (ext === ".mp3" && hasFfmpeg()) {
    execSync(
      `ffmpeg -y -hide_banner -loglevel error -i ${JSON.stringify(aiff)} -ar 44100 ${JSON.stringify(outPath)}`,
      { stdio: "pipe" },
    );
    postProcessMp3(outPath, getPhonemeMaxDurationSec(sound));
  } else {
    execSync(
      `afconvert -f WAVE -d LEI16@44100 ${JSON.stringify(aiff)} ${JSON.stringify(outPath)}`,
      { stdio: "pipe" },
    );
  }
  execSync(`rm ${JSON.stringify(aiff)}`, { stdio: "pipe" });
}

function humanClipPath(sound: string): string {
  return path.join(getPhonemeHumanOutputDir(), `${sound}.mp3`);
}

export async function generateHumanCorePhonemeClips(options: {
  force?: boolean;
} = {}): Promise<HumanPhonemeGenerateResult> {
  if (process.platform !== "darwin") {
    throw new Error("Human phoneme clip generation requires macOS (say command).");
  }

  const force = options.force ?? false;
  const outDir = getPhonemeHumanOutputDir();
  mkdirSync(outDir, { recursive: true });

  const result: HumanPhonemeGenerateResult = {
    generated: [],
    skipped: [],
    failed: [],
    outputDir: outDir,
  };

  for (const sound of HUMAN_CORE_PHONEME_SOUNDS) {
    const outPath = path.join(outDir, `${sound}.mp3`);
    if (!force && existsSync(outPath)) {
      result.skipped.push(sound);
      continue;
    }
    try {
      generateWithMacSay(sound, outDir, ".mp3");
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

export async function generatePhonemeClips(options: {
  force?: boolean;
  forceHuman?: boolean;
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
  mkdirSync(getPhonemeHumanOutputDir(), { recursive: true });

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
    const hasHuman =
      isHumanCorePhoneme(sound) && existsSync(humanClipPath(sound));
    if (hasHuman) {
      result.skipped.push(sound);
      continue;
    }
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

  if (options.forceHuman || (!force && process.platform === "darwin")) {
    const humanMissing = HUMAN_CORE_PHONEME_SOUNDS.some(
      (s) => !existsSync(path.join(getPhonemeHumanOutputDir(), `${s}.mp3`)),
    );
    if (options.forceHuman || humanMissing) {
      await generateHumanCorePhonemeClips({ force: options.forceHuman });
    }
  }

  return result;
}
