import { useState, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KidPageHeader } from "@/components/kid-ui";
import { getPhonicsForWord } from "@shared/phonics";
import { speak, speakPhonics } from "@/lib/speech";
import {
  MAGIC_E_PAIRS,
  VOWEL_TEAM_PAIRS,
  SOUND_SORT_WORDS,
  STRETCH_PAIRS,
  NAME_RULE_TIP,
  type VowelPair,
} from "@shared/phonics/short-long-a";

function speakWord(word: string, rate = 0.75) {
  const chunks = getPhonicsForWord(word);
  speakPhonics(chunks, { rate, pitch: 1.15 }, word);
}

function PairRow({ pair, onWordClick }: { pair: VowelPair; onWordClick: (word: string) => void }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center bg-white rounded-2xl p-3 kid-shadow">
      <button
        type="button"
        onClick={() => onWordClick(pair.short.word)}
        className="text-left rounded-xl p-2 hover:bg-yellow-50 transition-colors"
      >
        <span className="text-xl font-fredoka text-yellow-700">{pair.short.word}</span>
        <p className="text-xs font-bold text-gray-500">{pair.short.meaning}</p>
      </button>
      <span className="text-2xl text-gray-300">→</span>
      <button
        type="button"
        onClick={() => onWordClick(pair.long.word)}
        className="text-right rounded-xl p-2 hover:bg-green-50 transition-colors"
      >
        <span className="text-xl font-fredoka text-green-700">{pair.long.word}</span>
        <p className="text-xs font-bold text-gray-500">{pair.long.meaning}</p>
      </button>
    </div>
  );
}

function MagicWandGame() {
  const [pairIndex, setPairIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const pair = MAGIC_E_PAIRS[pairIndex];

  const handleMakeLong = () => {
    setRevealed(true);
    speakWord(pair.short.word, 0.85);
    setTimeout(() => speakWord(pair.long.word, 0.7), 900);
  };

  const handleNext = () => {
    setRevealed(false);
    setPairIndex((i) => (i + 1) % MAGIC_E_PAIRS.length);
  };

  return (
    <Card className="rounded-2xl p-5 bg-purple-50 border-2 border-purple-200">
      <h4 className="text-lg font-fredoka text-purple-800 mb-1 text-center">✨ Game A: Magic Wand</h4>
      <p className="text-xs font-bold text-gray-600 text-center mb-4">
        Point your wand and say &quot;Make it long!&quot; Then tap to add the silent E.
      </p>
      <div className="text-center mb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${pairIndex}-${revealed}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block"
          >
            <span className="text-5xl font-fredoka text-gray-800 tracking-widest">
              {pair.short.word.toUpperCase()}
              {revealed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-green-600"
                >
                  E
                </motion.span>
              )}
            </span>
          </motion.div>
        </AnimatePresence>
        {revealed && (
          <p className="text-sm font-bold text-green-700 mt-2">
            {pair.short.word} → {pair.long.word}!
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {!revealed ? (
          <Button
            onClick={handleMakeLong}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-2xl font-bold py-4 text-lg"
          >
            🪄 Make it long!
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="w-full bg-coral hover:bg-coral/90 text-white rounded-2xl font-bold py-4"
          >
            Next word →
          </Button>
        )}
      </div>
    </Card>
  );
}

function SoundSortGame() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const current = SOUND_SORT_WORDS[index % SOUND_SORT_WORDS.length];

  const handleGuess = (sound: "short" | "long") => {
    const correct = sound === current.sound;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      setFeedback(null);
      setIndex((i) => i + 1);
    }, 1200);
  };

  const handleHearWord = () => speakWord(current.word);

  return (
    <Card className="rounded-2xl p-5 bg-blue-50 border-2 border-blue-200">
      <h4 className="text-lg font-fredoka text-blue-800 mb-1 text-center">🎩 Game B: Sound Sort</h4>
      <p className="text-xs font-bold text-gray-600 text-center mb-4">
        Which column does this word belong in?
      </p>
      <div className="text-center mb-4">
        <motion.p
          key={index}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-4xl font-fredoka text-gray-800 mb-2"
        >
          {current.word}
        </motion.p>
        <Button size="sm" variant="outline" onClick={handleHearWord} className="rounded-xl font-bold">
          🔊 Hear word
        </Button>
        {feedback === "correct" && (
          <p className="text-green-600 font-bold mt-2">✓ Great job!</p>
        )}
        {feedback === "wrong" && (
          <p className="text-orange-600 font-bold mt-2">
            Try again — {current.sound === "short" ? "Short A (ah)" : "Long A (Aaa)"}!
          </p>
        )}
        <p className="text-xs font-bold text-gray-500 mt-2">Score: {score}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => handleGuess("short")}
          disabled={feedback !== null}
          className="flex flex-col h-auto py-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-2 border-yellow-300 rounded-2xl"
        >
          <span className="text-3xl mb-1">🎩</span>
          <span className="font-fredoka text-sm">Short A</span>
          <span className="text-xs font-bold">ah</span>
        </Button>
        <Button
          onClick={() => handleGuess("long")}
          disabled={feedback !== null}
          className="flex flex-col h-auto py-4 bg-green-100 hover:bg-green-200 text-green-800 border-2 border-green-300 rounded-2xl"
        >
          <span className="text-3xl mb-1">🎂</span>
          <span className="font-fredoka text-sm">Long A</span>
          <span className="text-xs font-bold">Aaa</span>
        </Button>
      </div>
    </Card>
  );
}

function StretchTestGame() {
  const [pairIndex, setPairIndex] = useState(0);
  const pair = STRETCH_PAIRS[pairIndex % STRETCH_PAIRS.length];

  const handleShort = () => {
    speak(pair.short.word, { rate: 1.1, pitch: 1.2 });
  };

  const handleLong = () => {
    speak(pair.long.word, { rate: 0.55, pitch: 1.0 });
  };

  const handleNext = () => setPairIndex((i) => i + 1);

  return (
    <Card className="rounded-2xl p-5 bg-orange-50 border-2 border-orange-200">
      <h4 className="text-lg font-fredoka text-orange-800 mb-1 text-center">🫧 Game C: Stretch Test</h4>
      <p className="text-xs font-bold text-gray-600 text-center mb-4">
        Short A is quick like a drum beat. Long A stretches like bubblegum!
      </p>
      <div className="text-center mb-4">
        <p className="text-sm font-bold text-gray-600 mb-2">Try this pair:</p>
        <p className="text-2xl font-fredoka text-gray-800">
          {pair.short.word} / {pair.long.word}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Button
          onClick={handleShort}
          className="flex flex-col h-auto py-4 bg-yellow-400 hover:bg-yellow-500 text-white rounded-2xl font-bold"
        >
          <span className="text-lg">A-a-a!</span>
          <span className="text-xs">Quick / Flat</span>
        </Button>
        <Button
          onClick={handleLong}
          className="flex flex-col h-auto py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold"
        >
          <span className="text-lg">Aaaaaaa</span>
          <span className="text-xs">Stretched out</span>
        </Button>
      </div>
      <Button onClick={handleNext} variant="outline" className="w-full rounded-2xl font-bold">
        Next pair →
      </Button>
    </Card>
  );
}

export default function VowelContrast() {
  const [activeTab, setActiveTab] = useState<"pairs" | "games">("pairs");
  const handleWordClick = useCallback((word: string) => speakWord(word), []);

  return (
    <div className="min-h-screen pb-28">
      <KidPageHeader title="A Sounds" emoji="✨" />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="rounded-2xl p-4 mb-6 bg-gradient-to-br from-yellow-50 to-green-50 border-2 border-yellow-200 kid-shadow">
          <p className="text-sm font-bold text-gray-700 text-center">
            💡 <span className="text-orange-700">Name Rule:</span> {NAME_RULE_TIP}
          </p>
        </Card>

        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setActiveTab("pairs")}
            className={`flex-1 kid-tap rounded-2xl font-fredoka font-bold text-lg ${activeTab === "pairs" ? "bg-coral text-white" : "bg-white text-gray-600 border-2"}`}
          >
            📚 Words
          </Button>
          <Button
            onClick={() => setActiveTab("games")}
            className={`flex-1 kid-tap rounded-2xl font-fredoka font-bold text-lg ${activeTab === "games" ? "bg-coral text-white" : "bg-white text-gray-600 border-2"}`}
          >
            🎮 Play
          </Button>
        </div>

        {activeTab === "pairs" ? (
          <div className="space-y-6">
            <section>
              <h3 className="text-xl font-fredoka text-purple-700 mb-1 text-center">
                ✨ Magic E Pairs (CVCe)
              </h3>
              <p className="text-xs font-bold text-gray-500 text-center mb-4">
                The silent E is like a magic wand — it makes A say its name!
              </p>
              <div className="space-y-2">
                {MAGIC_E_PAIRS.map((pair) => (
                  <PairRow key={pair.short.word} pair={pair} onWordClick={handleWordClick} />
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xl font-fredoka text-blue-700 mb-1 text-center">
                🤝 Vowel Team Pairs
              </h3>
              <p className="text-xs font-bold text-gray-500 text-center mb-4">
                Sometimes AI or AY work together to make the Long A sound — no E needed!
              </p>
              <div className="space-y-2">
                {VOWEL_TEAM_PAIRS.map((pair) => (
                  <PairRow key={pair.short.word} pair={pair} onWordClick={handleWordClick} />
                ))}
              </div>
              <p className="text-xs font-bold text-gray-500 text-center mt-3 italic">
                Pan can also rhyme with pay (ay team)!
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-6">
            <MagicWandGame />
            <SoundSortGame />
            <StretchTestGame />
          </div>
        )}

        <Card className="mt-8 rounded-2xl p-4 bg-white kid-shadow text-center">
          <p className="text-sm font-bold text-gray-600 mb-3">
            Ready for a story? Read &quot;The Cake at the Lake&quot; to hear Magic E in action!
          </p>
          <Link href="/books">
            <Button className="bg-coral text-white rounded-2xl font-bold">
              Go to Story Books 📖
            </Button>
          </Link>
        </Card>
      </main>
    </div>
  );
}
