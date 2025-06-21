interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function speak(text: string, options: SpeechOptions = {}) {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 0.7;
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
