interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  kokoroVoice?: string;
}

// Global variable to keep track of the currently playing Kokoro audio
// so we can cancel it if speak() is called again.
let currentAudio: HTMLAudioElement | null = null;

export async function speak(text: string, options: SpeechOptions = {}) {
  // 1. Cancel any ongoing speech (browser or Kokoro)
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  // 2. Check Kokoro configuration
  const kokoroEnabled = localStorage.getItem("kokoroEnabled") === "true";
  const kokoroUrl = localStorage.getItem("kokoroApiUrl");
  const kokoroVoiceId = options.kokoroVoice || localStorage.getItem("kokoroVoiceId") || "af_heart";

  // 3. Try Kokoro-FastAPI if enabled
  if (kokoroEnabled && kokoroUrl) {
    try {
      const response = await fetch(kokoroUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "kokoro",
          input: text,
          voice: kokoroVoiceId,
          response_format: "mp3",
          speed: options.rate || 1.0
        })
      });

      if (!response.ok) {
        throw new Error(`Kokoro API error: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      currentAudio = new Audio(url);

      // Adjust volume if provided (Kokoro API doesn't have a volume param yet)
      if (options.volume !== undefined) {
        currentAudio.volume = options.volume;
      }

      await currentAudio.play();

      // Successfully played via Kokoro, we are done!
      return;
    } catch (error) {
      console.warn("Kokoro speech failed, falling back to browser synthesis:", error);
      // Fall through to browser synthesis
    }
  }

  // 4. Fallback: Browser Web Speech API
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    // Note: Browser TTS rate/pitch scales differently than Kokoro, so fallback might sound different
    utterance.rate = options.rate || 0.8;
    utterance.pitch = options.pitch || 1.1;
    utterance.volume = options.volume || 1.0;

    // Use the most natural-sounding voice available
    const voices = window.speechSynthesis.getVoices();

    // Priority order for voice selection
    const preferredVoices = [
      // Look for high-quality voices first
      voices.find(voice => voice.name.toLowerCase().includes('natural')),
      voices.find(voice => voice.name.toLowerCase().includes('neural')),
      voices.find(voice => voice.name.toLowerCase().includes('premium')),
      voices.find(voice => voice.name.toLowerCase().includes('enhanced')),
      // Then look for female voices (typically sound friendlier for children)
      voices.find(voice => voice.name.toLowerCase().includes('female')),
      voices.find(voice => voice.name.toLowerCase().includes('woman')),
      voices.find(voice => voice.name.toLowerCase().includes('samantha')),
      voices.find(voice => voice.name.toLowerCase().includes('karen')),
      voices.find(voice => voice.name.toLowerCase().includes('zira')),
      // Look for English voices
      voices.find(voice => voice.lang.startsWith('en-') && voice.localService),
      voices.find(voice => voice.lang.startsWith('en-')),
      // Fallback to default
      voices[0]
    ];

    const selectedVoice = preferredVoices.find(voice => voice);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('Speech synthesis not supported in this browser');
  }
}

export function speakWord(word: string, options: SpeechOptions = {}) {
  speak(word.toLowerCase(), options);
}

export function speakLetters(word: string, options: SpeechOptions = {}) {
  const letters = word.toLowerCase().split('');
  let delay = 0;

  letters.forEach((letter, index) => {
    setTimeout(() => {
      speak(letter, { ...options, rate: 0.6, pitch: 1.2 });
    }, delay);
    delay += 1200; // 1200ms delay between letters for clearer pronunciation
  });

  // Say the whole word after spelling with more natural timing
  setTimeout(() => {
    speak(word.toLowerCase(), { ...options, rate: 0.8, pitch: 1.0 });
  }, delay + 1000);
}

export function speakFeedback(isCorrect: boolean) {
  const correctPhrases = [
    "Great job!",
    "Excellent!",
    "Well done!",
    "Perfect!",
    "Amazing!",
  ];

  const encouragingPhrases = [
    "Try again!",
    "You're doing great!",
    "Keep trying!",
    "Almost there!",
  ];

  const phrases = isCorrect ? correctPhrases : encouragingPhrases;
  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

  speak(randomPhrase, { rate: 0.8, pitch: 1.0 });
}

// Initialize speech synthesis when the module loads
if ('speechSynthesis' in window) {
  // Load voices
  window.speechSynthesis.getVoices();

  // Handle voice loading on some browsers
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
}
