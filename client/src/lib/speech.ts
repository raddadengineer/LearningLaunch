import { chunkToPhonemeSound, chunksToBlendScript } from "@shared/phoneme-sounds";

interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  kokoroVoice?: string;
}

let currentAudio: HTMLAudioElement | null = null;
let speechGeneration = 0;

export function isAiCoachEnabled(): boolean {
  return localStorage.getItem("aiReadingCoachEnabled") !== "false";
}

export function isKokoroEnabled(): boolean {
  return localStorage.getItem("kokoroEnabled") === "true" && !!localStorage.getItem("kokoroApiUrl");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function speak(text: string, options: SpeechOptions = {}): Promise<void> {
  const generation = ++speechGeneration;

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  const kokoroEnabled = localStorage.getItem("kokoroEnabled") === "true";
  const kokoroUrl = localStorage.getItem("kokoroApiUrl");
  const kokoroVoiceId = options.kokoroVoice || localStorage.getItem("kokoroVoiceId") || "af_heart";

  if (kokoroEnabled && kokoroUrl) {
    try {
      const response = await fetch(kokoroUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "kokoro",
          input: text,
          voice: kokoroVoiceId,
          response_format: "mp3",
          speed: options.rate || 1.0
        })
      });

      if (!response.ok) throw new Error(`Kokoro API error: ${response.status}`);

      if (generation !== speechGeneration) return;

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      currentAudio = new Audio(url);
      if (options.volume !== undefined) currentAudio.volume = options.volume;

      await new Promise<void>((resolve, reject) => {
        if (!currentAudio) return resolve();
        currentAudio.onended = () => resolve();
        currentAudio.onerror = () => reject(new Error("Audio playback failed"));
        currentAudio!.play().catch(reject);
      });
      return;
    } catch (error) {
      console.warn("Kokoro speech failed, falling back to browser synthesis:", error);
    }
  }

  if (generation !== speechGeneration) return;

  if ('speechSynthesis' in window) {
    await new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || 0.8;
      utterance.pitch = options.pitch || 1.1;
      utterance.volume = options.volume || 1.0;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoices = [
        voices.find(v => v.name.toLowerCase().includes('natural')),
        voices.find(v => v.name.toLowerCase().includes('neural')),
        voices.find(v => v.name.toLowerCase().includes('samantha')),
        voices.find(v => v.name.toLowerCase().includes('karen')),
        voices.find(v => v.lang.startsWith('en-')),
        voices[0],
      ];
      const selectedVoice = preferredVoices.find(v => v);
      if (selectedVoice) utterance.voice = selectedVoice;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }
}

export function speakWord(word: string, options: SpeechOptions = {}) {
  return speak(word.toLowerCase(), options);
}

export async function speakLetters(word: string, options: SpeechOptions = {}) {
  if (isAiCoachEnabled()) {
    await speak("Let's spell it letter by letter.", { ...options, rate: 0.85 });
    await sleep(200);
  }

  for (const letter of word.toLowerCase().split('')) {
    const sound = isAiCoachEnabled() ? chunkToPhonemeSound(letter) : letter;
    await speak(sound, { ...options, rate: 0.6, pitch: 1.2 });
    await sleep(isAiCoachEnabled() ? 400 : 900);
  }

  if (isAiCoachEnabled()) {
    await speak("Now say the whole word.", { ...options, rate: 0.85 });
    await sleep(200);
  }
  await speak(word.toLowerCase(), { ...options, rate: 0.8, pitch: 1.0 });
}

export async function speakPhonics(chunks: string[], options: SpeechOptions = {}, wholeWord?: string) {
  const useCoach = isAiCoachEnabled();

  if (useCoach) {
    await speak("Let's sound it out together!", { ...options, rate: 0.85, pitch: 1.1 });
    await sleep(300);
  }

  for (const chunk of chunks) {
    const sound = useCoach ? chunkToPhonemeSound(chunk) : chunk.toLowerCase();
    await speak(sound, { ...options, rate: 0.55, pitch: 1.2 });
    await sleep(useCoach ? 500 : 800);
  }

  if (wholeWord) {
    if (useCoach) {
      const blend = chunksToBlendScript(chunks);
      await speak(`Now blend them: ${blend}`, { ...options, rate: 0.75, pitch: 1.1 });
      await sleep(400);
      await speak(`The word is ${wholeWord.toLowerCase()}!`, { ...options, rate: 0.8, pitch: 1.0 });
    } else {
      await sleep(300);
      await speak(wholeWord.toLowerCase(), { ...options, rate: 0.8, pitch: 1.0 });
    }
  }
}

export async function speakLetterCoach(letter: string, options: SpeechOptions = {}) {
  const sound = chunkToPhonemeSound(letter);
  if (isAiCoachEnabled()) {
    await speak(`This sound is`, { ...options, rate: 0.85 });
    await sleep(150);
    await speak(sound, { ...options, rate: 0.55, pitch: 1.2 });
  } else {
    await speak(sound, { ...options, rate: 0.6, pitch: 1.1 });
  }
}

export async function speakChunkCoach(chunk: string, options: SpeechOptions = {}) {
  const sound = chunkToPhonemeSound(chunk);
  if (isAiCoachEnabled()) {
    await speak(sound, { ...options, rate: 0.55, pitch: 1.2 });
  } else {
    await speak(chunk.toLowerCase(), { ...options, rate: 0.6, pitch: 1.1 });
  }
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
  options: SpeechOptions = {}
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

if ('speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
}
