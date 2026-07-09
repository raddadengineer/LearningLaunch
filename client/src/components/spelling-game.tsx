import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { speakFeedback } from "@/lib/speech";
import { playChunkSound } from "@/lib/speech";

interface SpellingGameProps {
  word: string;
  onComplete: () => void;
}

interface LetterItem {
  id: string; // unique ID so React/Framer can track duplicates
  char: string;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function SpellingGame({ word, onComplete }: SpellingGameProps) {
  const [bank, setBank] = useState<LetterItem[]>([]);
  const [slots, setSlots] = useState<(LetterItem | null)[]>([]);
  const [isError, setIsError] = useState(false);

  // Initialize the game
  useEffect(() => {
    const cleanWord = word.replace(/[^A-Za-z]/g, "").toUpperCase();
    const wordLetters = cleanWord.split("");
    
    // Create initial slots (all null)
    setSlots(new Array(wordLetters.length).fill(null));

    // Generate letters (word + 3 random decoys)
    const letters: LetterItem[] = wordLetters.map((char, index) => ({
      id: `correct-${index}-${char}`,
      char,
    }));

    for (let i = 0; i < 3; i++) {
      const randomChar = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      letters.push({
        id: `decoy-${i}-${randomChar}`,
        char: randomChar,
      });
    }

    // Shuffle
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    setBank(shuffled);
    setIsError(false);
  }, [word]);

  const handleBankClick = (letter: LetterItem) => {
    const firstEmptyIndex = slots.findIndex(s => s === null);
    if (firstEmptyIndex === -1) return; // slots full

    playChunkSound(letter.char, { rate: 0.8 }, true); // Give feedback for the letter clicked

    // Move from bank to slot
    setBank(prev => prev.filter(l => l.id !== letter.id));
    setSlots(prev => {
      const newSlots = [...prev];
      newSlots[firstEmptyIndex] = letter;
      return newSlots;
    });
  };

  const handleSlotClick = (letter: LetterItem | null, index: number) => {
    if (!letter) return;

    // Move from slot to bank
    setSlots(prev => {
      const newSlots = [...prev];
      newSlots[index] = null;
      return newSlots;
    });
    setBank(prev => [...prev, letter]);
  };

  // Check correctness when slots are full
  useEffect(() => {
    const isFull = slots.length > 0 && slots.every(s => s !== null);
    if (!isFull) return;

    const cleanWord = word.replace(/[^A-Za-z]/g, "").toUpperCase();
    const currentSpelling = slots.map(s => s?.char).join("");

    if (currentSpelling === cleanWord) {
      speakFeedback(true);
      setTimeout(() => {
        onComplete();
      }, 1500);
    } else {
      setIsError(true);
      speakFeedback(false);
      setTimeout(() => {
        // Send all letters back to bank after 1s
        setBank(prev => {
          // get letters currently in slots
          const slottedLetters = slots.filter(s => s !== null) as LetterItem[];
          return [...prev, ...slottedLetters];
        });
        setSlots(new Array(slots.length).fill(null));
        setIsError(false);
      }, 1000);
    }
  }, [slots, word, onComplete]);

  return (
    <div className="flex flex-col items-center gap-12 w-full max-w-2xl mx-auto py-8">
      {/* Slots */}
      <motion.div 
        className="flex gap-4 flex-wrap justify-center"
        animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {slots.map((slot, index) => (
          <div 
            key={`slot-${index}`}
            className="w-16 h-20 sm:w-20 sm:h-24 bg-gray-100 rounded-2xl border-4 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden"
          >
            {slot && (
              <motion.button
                layoutId={slot.id}
                onClick={() => handleSlotClick(slot, index)}
                className="absolute inset-0 bg-coral text-white text-4xl font-fredoka font-bold rounded-xl kid-shadow flex items-center justify-center z-10 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                {slot.char}
              </motion.button>
            )}
          </div>
        ))}
      </motion.div>

      {/* Bank */}
      <div className="flex flex-wrap gap-4 justify-center min-h-[120px] bg-white/50 p-6 rounded-[2.5rem] kid-shadow w-full">
        {bank.map(letter => (
          <motion.button
            key={letter.id}
            layoutId={letter.id}
            onClick={() => handleBankClick(letter)}
            className="w-16 h-20 sm:w-20 sm:h-24 bg-turquoise text-white text-4xl font-fredoka font-bold rounded-xl kid-shadow flex items-center justify-center z-10 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            whileHover={{ scale: 1.1, rotate: Math.random() * 10 - 5 }}
            whileTap={{ scale: 0.9 }}
          >
            {letter.char}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
