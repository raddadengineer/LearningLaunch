import {
  chunkToPhonemeSound,
  getPhonemeAudioUrls,
  phonemeSoundForTts,
} from "@shared/phoneme-sounds";

interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  kokoroVoice?: string;
}

export type PhonicsPace = "slow" | "normal";

let currentAudio: HTMLAudioElement | null = null;
let speechGeneration = 0;

export function isAiCoachEnabled(): boolean {
  return localStorage.getItem("aiReadingCoachEnabled") !== "false";
}

export function isKokoroEnabled(): boolean {
  return localStorage.getItem("kokoroEnabled") === "true";
}

export function getPhonicsPace(): PhonicsPace {
  return localStorage.getItem("phonicsPace") === "normal" ? "normal" : "slow";
}

function getChunkPauseMs(): number {
  return getPhonicsPace() === "slow" ? 700 : 450;
}

function getBlendGaps(chunkCount: number): number[] {
  if (chunkCount <= 1) return [300];
  const start = getPhonicsPace() === "slow" ? 500 : 350;
  const end = getPhonicsPace() === "slow" ? 120 : 80;
  const step = (start - end) / (chunkCount - 1);
  return Array.from({ length: chunkCount }, (_, i) =>
    Math.round(start - step * i),
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stopCurrentAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

export async function speak(text: string, options: SpeechOptions = {}): Promise<void> {
  const generation = ++speechGeneration;

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  stopCurrentAudio();

  const kokoroEnabled = localStorage.getItem("kokoroEnabled") === "true";
  const kokoroVoiceId = options.kokoroVoice || localStorage.getItem("kokoroVoiceId") || "af_heart";

  if (kokoroEnabled) {
    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: text,
          voice: kokoroVoiceId,
          response_format: "mp3",
          speed: options.rate || 1.0,
        }),
      });

      if (!response.ok) throw new Error(`Kokoro API error: ${response.status}`);

      if (generation !== speechGeneration) return;

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      currentAudio = new Audio(url);
      if (options.volume !== undefined) currentAudio.volume = options.volume;

      await new Promise<void>((resolve, reject) => {
        if (!currentAudio) return resolve();
        currentAudio.onended = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
        currentAudio.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("Audio playback failed"));
        };
        currentAudio!.play().catch(reject);
      });
      return;
    } catch (error) {
      console.warn("Kokoro speech failed, falling back to browser synthesis:", error);
    }
  }

  if (generation !== speechGeneration) return;

  if ("speechSynthesis" in window) {
    await new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || 0.8;
      utterance.pitch = options.pitch || 1.1;
      utterance.volume = options.volume || 1.0;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoices = [
        voices.find((v) => v.name.toLowerCase().includes("natural")),
        voices.find((v) => v.name.toLowerCase().includes("neural")),
        voices.find((v) => v.name.toLowerCase().includes("samantha")),
        voices.find((v) => v.name.toLowerCase().includes("karen")),
        voices.find((v) => v.lang.startsWith("en-")),
        voices[0],
      ];
      const selectedVoice = preferredVoices.find((v) => v);
      if (selectedVoice) utterance.voice = selectedVoice;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }
}

export async function playPhonemeClip(url: string, options: SpeechOptions = {}): Promise<void> {
  const generation = ++speechGeneration;

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  stopCurrentAudio();

  await new Promise<void>((resolve, reject) => {
    const audio = new Audio(url);
    currentAudio = audio;
    if (options.volume !== undefined) audio.volume = options.volume;
    if (options.rate !== undefined && options.rate !== 1) audio.playbackRate = options.rate;

    audio.onended = () => {
      if (generation === speechGeneration) currentAudio = null;
      resolve();
    };
    audio.onerror = () => {
      if (generation === speechGeneration) currentAudio = null;
      reject(new Error(`Phoneme clip failed: ${url}`));
    };
    audio.play().catch(reject);
  });

  if (generation !== speechGeneration) {
    stopCurrentAudio();
  }
}

export async function playChunkSound(
  chunk: string,
  options: SpeechOptions = {},
  usePhoneme = true,
): Promise<void> {
  if (usePhoneme) {
    const sound = chunkToPhonemeSound(chunk);
    const urls = getPhonemeAudioUrls(sound);
    for (const url of urls) {
      try {
        await playPhonemeClip(url, options);
        return;
      } catch {
        // try next format
      }
    }
  }

  const sound = usePhoneme ? phonemeSoundForTts(chunkToPhonemeSound(chunk)) : chunk.toLowerCase();
  await speak(sound, { ...options, rate: options.rate ?? 0.45, pitch: options.pitch ?? 1.2 });
}

/** Play a phoneme clip by sound key (e.g. "ah", "ay") */
export async function speakPhonemeSound(sound: string, options: SpeechOptions = {}) {
  const urls = getPhonemeAudioUrls(sound);
  for (const url of urls) {
    try {
      await playPhonemeClip(url, options);
      return;
    } catch {
      // try next format
    }
  }
  await speak(phonemeSoundForTts(sound), { ...options, rate: options.rate ?? 0.5, pitch: options.pitch ?? 1.2 });
}

/** Isolated short then long vowel stretch using phoneme clips */
export async function speakVowelStretch(
  shortSound: string,
  longClipKey: string,
  options: SpeechOptions = {},
) {
  const shortUrls = getPhonemeAudioUrls(shortSound);
  let playedShort = false;
  for (const url of shortUrls) {
    try {
      await playPhonemeClip(url, options);
      playedShort = true;
      break;
    } catch {
      // try next format
    }
  }
  if (!playedShort) {
    await speak(phonemeSoundForTts(shortSound), { ...options, rate: 0.5, pitch: 1.2 });
  }

  await sleep(400);

  const longUrls = getPhonemeAudioUrls(longClipKey);
  let playedLong = false;
  for (const url of longUrls) {
    try {
      await playPhonemeClip(url, { ...options, rate: 0.75 });
      playedLong = true;
      break;
    } catch {
      // try next format
    }
  }
  if (!playedLong) {
    await speak(phonemeSoundForTts(longClipKey), { ...options, rate: 0.4, pitch: 1.0 });
  }
}

export function speakWord(word: string, options: SpeechOptions = {}) {
  return speak(word.toLowerCase(), options);
}

export async function speakLetters(
  word: string,
  options: SpeechOptions = {},
  onChunkIndex?: (index: number) => void,
) {
  const letters = word.toLowerCase().split("");
  const useCoach = isAiCoachEnabled();
  const pauseMs = getChunkPauseMs();

  if (useCoach) {
    await speak("Let's spell it letter by letter.", { ...options, rate: 0.85 });
    await sleep(200);
  }

  try {
    for (let i = 0; i < letters.length; i++) {
      onChunkIndex?.(i);
      await playChunkSound(letters[i], options, useCoach);
      await sleep(pauseMs);
    }

    if (useCoach) {
      await speak("Now say the whole word.", { ...options, rate: 0.85 });
      await sleep(200);
    }
    await speak(word.toLowerCase(), { ...options, rate: 0.8, pitch: 1.0 });
  } finally {
    onChunkIndex?.(-1);
  }
}

export async function speakPhonics(
  chunks: string[],
  options: SpeechOptions = {},
  wholeWord?: string,
  onChunkIndex?: (index: number) => void,
) {
  const useCoach = isAiCoachEnabled();
  const pauseMs = getChunkPauseMs();

  try {
    if (useCoach && wholeWord) {
      await speak("Sound it out!", { ...options, rate: 0.85, pitch: 1.1 });
      await sleep(200);
    }

    for (let i = 0; i < chunks.length; i++) {
      onChunkIndex?.(i);
      await playChunkSound(chunks[i], options, useCoach);
      await sleep(pauseMs);
    }

    if (wholeWord) {
      if (useCoach) {
        await speak("Now blend!", { ...options, rate: 0.85, pitch: 1.1 });
        await sleep(250);

        const blendGaps = getBlendGaps(chunks.length);
        for (let i = 0; i < chunks.length; i++) {
          onChunkIndex?.(i);
          await playChunkSound(chunks[i], options, useCoach);
          if (i < chunks.length - 1) {
            await sleep(blendGaps[i] ?? 150);
          }
        }
        onChunkIndex?.(-1);
        await sleep(300);
        await speak(wholeWord.toLowerCase(), { ...options, rate: 0.8, pitch: 1.0 });
      } else {
        await sleep(300);
        await speak(wholeWord.toLowerCase(), { ...options, rate: 0.8, pitch: 1.0 });
      }
    }
  } finally {
    onChunkIndex?.(-1);
  }
}

export async function speakLetterCoach(letter: string, options: SpeechOptions = {}) {
  if (isAiCoachEnabled()) {
    await speak("This sound is", { ...options, rate: 0.85 });
    await sleep(150);
  }
  await playChunkSound(letter, options, isAiCoachEnabled());
}

export async function speakChunkCoach(chunk: string, options: SpeechOptions = {}) {
  await playChunkSound(chunk, options, isAiCoachEnabled());
}

export function speakFeedback(isCorrect: boolean) {
  const correctPhrases = ["Great job!", "Excellent!", "Well done!", "Perfect!", "Amazing!"];
  const encouragingPhrases = ["Try again!", "You're doing great!", "Keep trying!", "Almost there!"];
  const phrases = isCorrect ? correctPhrases : encouragingPhrases;
  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  speak(randomPhrase, { rate: 0.8, pitch: 1.0 });
}

export async function speakSightWord(word: string, sentence?: string, options: SpeechOptions = {}) {
  if (isAiCoachEnabled()) {
    await speak(`Remember this sight word: ${word.toLowerCase()}.`, { ...options, rate: 0.85, pitch: 1.1 });
    await sleep(400);
    await speak(word.toLowerCase(), { ...options, rate: 0.75, pitch: 1.0 });
    if (sentence) {
      await sleep(500);
      await speak(`In a sentence: ${sentence}`, { ...options, rate: 0.8, pitch: 1.1 });
    }
  } else {
    await speak(word.toLowerCase(), { ...options, rate: 0.8, pitch: 1.1 });
    if (sentence) {
      await sleep(600);
      await speak(sentence, { ...options, rate: 0.75, pitch: 1.0 });
    }
  }
}

/** Finger-point reading: highlight each word one at a time with TTS */
export async function speakFingerPoint(
  words: string[],
  onWordIndex: (index: number) => void,
  options: SpeechOptions = {},
) {
  for (let i = 0; i < words.length; i++) {
    onWordIndex(i);
    const clean = words[i].replace(/[^A-Za-z]/g, "");
    if (clean) {
      await speak(clean.toLowerCase(), { ...options, rate: 0.65, pitch: 1.1 });
      await sleep(350);
    }
  }
  onWordIndex(-1);
}

/** Echo technique: adult reads, then prompts child to repeat */
export async function speakEcho(sentence: string, options: SpeechOptions = {}) {
  if (isAiCoachEnabled()) {
    await speak("Listen carefully.", { ...options, rate: 0.85 });
    await sleep(300);
  }
  await speak(sentence, { ...options, rate: 0.7, pitch: 1.1 });
  await sleep(500);
  await speak("Now you try! Read it with your finger.", { ...options, rate: 0.85, pitch: 1.2 });
}

/** Test phoneme clip sequence for parent voice settings */
export async function testPhonemeClips(options: SpeechOptions = {}) {
  const chunks = ["B", "OO", "K"];
  await speakPhonics(chunks, options, "book");
}

if ("speechSynthesis" in window) {
  window.speechSynthesis.getVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
}
