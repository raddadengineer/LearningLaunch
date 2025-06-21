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
    utterance.rate = options.rate || 0.8;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    
    // Use a child-friendly voice if available
    const voices = window.speechSynthesis.getVoices();
    const childVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('child') ||
      voice.name.toLowerCase().includes('female') ||
      voice.gender === 'female'
    );
    
    if (childVoice) {
      utterance.voice = childVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('Speech synthesis not supported in this browser');
  }
}

export function speakWord(word: string, options: SpeechOptions = {}) {
  speak(word, options);
}

export function speakLetters(word: string, options: SpeechOptions = {}) {
  const letters = word.split('');
  let delay = 0;
  
  letters.forEach((letter, index) => {
    setTimeout(() => {
      speak(letter, options);
    }, delay);
    delay += 800; // 800ms delay between letters
  });
  
  // Say the whole word after spelling
  setTimeout(() => {
    speak(word, { ...options, rate: (options.rate || 0.8) + 0.2 });
  }, delay + 500);
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
  
  speak(randomPhrase, { rate: 0.9, pitch: 1.2 });
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
