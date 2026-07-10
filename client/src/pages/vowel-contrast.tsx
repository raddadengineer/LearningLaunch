import { useState, useCallback } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KidPageHeader, KidBigAction } from "@/components/kid-ui";
import { getPhonicsForWord } from "@shared/phonics";
import { speak, speakPhonics, speakPhonemeSound, speakLetters } from "@/lib/speech";
import { HELP_VOWEL_SETUP, getVowelContrastHelp } from "@/lib/page-help";
import { SHORT_A_LONG_A } from "@shared/phonics/short-long-a";
import { SHORT_I_LONG_I } from "@shared/phonics/short-long-i";
import type { VowelContrastContent, VowelPair } from "@shared/phonics/vowel-contrast-types";
import SpellingGame from "@/components/spelling-game";

type VowelPhase = "setup" | "play";
type ActiveTab = "pairs" | "games";

const VOWEL_CONTENT: Record<"a" | "i", VowelContrastContent> = {
  a: SHORT_A_LONG_A,
  i: SHORT_I_LONG_I,
};

const screenVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

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

function MagicWandGame({ content }: { content: VowelContrastContent }) {
  const [pairIndex, setPairIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const pair = content.magicEPairs[pairIndex];

  const handleMakeLong = () => {
    setRevealed(true);
    speakWord(pair.short.word, 0.85);
    setTimeout(() => speakWord(pair.long.word, 0.7), 900);
  };

  const handleNext = () => {
    setRevealed(false);
    setPairIndex((i) => (i + 1) % content.magicEPairs.length);
  };

  return (
    <Card className="rounded-2xl p-5 theme-card">
      <h4 className="text-lg font-fredoka text-purple-800 mb-1 text-center">✨ Game A: Magic Wand</h4>
      <p className="text-xs font-bold text-gray-600 text-center mb-4">
        Zap the word with your wand — then tap to add the silent E!
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

function SoundSortGame({ content }: { content: VowelContrastContent }) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [isSpelling, setIsSpelling] = useState(false);
  const current = content.soundSortWords[index % content.soundSortWords.length];

  const handleGuess = (sound: "short" | "long") => {
    const correct = sound === current.sound;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      setFeedback(null);
      setIndex((i) => i + 1);
      setIsSpelling(false);
    }, 1200);
  };

  return (
    <Card className="rounded-2xl p-5 theme-card">
      {isSpelling ? (
        <div className="mb-4">
          <div className="text-center mb-4">
            <Button variant="ghost" onClick={() => setIsSpelling(false)} className="mb-2">
              ← Back to Sort
            </Button>
            <h4 className="text-lg font-fredoka text-blue-800">Spell the word!</h4>
          </div>
          <SpellingGame 
            word={current.word} 
            onComplete={() => {
              setTimeout(() => setIsSpelling(false), 2000);
            }} 
          />
        </div>
      ) : (
        <>
          <h4 className="text-lg font-fredoka text-blue-800 mb-1 text-center">🪣 Game B: Sound Sort</h4>
          <p className="text-xs font-bold text-gray-600 text-center mb-4">
            Which bucket does this word go in?
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
            <div className="flex justify-center gap-2">
              <Button size="sm" variant="outline" onClick={() => speakWord(current.word)} className="rounded-xl font-bold">
                🔊 Hear word
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsSpelling(true)} className="rounded-xl font-bold">
                🧩 Spell it
              </Button>
            </div>
            {feedback === "correct" && <p className="text-green-600 font-bold mt-2">✓ Great job!</p>}
            {feedback === "wrong" && (
              <p className="text-orange-600 font-bold mt-2">
                Try again — {current.sound === "short" ? `${content.shortLabel} (${content.shortSound})` : `${content.longLabel} (${content.longSound})`}!
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
              <span className="text-3xl mb-1">{content.shortEmoji}</span>
              <span className="font-fredoka text-sm">{content.shortLabel}</span>
              <span className="text-xs font-bold">{content.shortSound}</span>
            </Button>
            <Button
              onClick={() => handleGuess("long")}
              disabled={feedback !== null}
              className="flex flex-col h-auto py-4 bg-green-100 hover:bg-green-200 text-green-800 border-2 border-green-300 rounded-2xl"
            >
              <span className="text-3xl mb-1">{content.longEmoji}</span>
              <span className="font-fredoka text-sm">{content.longLabel}</span>
              <span className="text-xs font-bold">{content.longSound}</span>
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}

function StretchTestGame({ content }: { content: VowelContrastContent }) {
  const [pairIndex, setPairIndex] = useState(0);
  const [activeStretch, setActiveStretch] = useState<"short" | "long" | null>(null);
  const pair = content.stretchPairs[pairIndex % content.stretchPairs.length];

  const playShort = async () => {
    setActiveStretch("short");
    try {
      await speakPhonemeSound(content.shortSound, { rate: 1.0, pitch: 1.2 });
    } finally {
      setActiveStretch(null);
    }
  };

  const playLong = async () => {
    setActiveStretch("long");
    try {
      await speakPhonemeSound(content.longClipKey, { rate: 0.75, pitch: 1.0 });
    } finally {
      setActiveStretch(null);
    }
  };

  return (
    <Card className="rounded-2xl p-5 theme-card">
      <h4 className="text-lg font-fredoka text-orange-800 mb-1 text-center">😁 Game C: Sound Stretch</h4>
      <p className="text-xs font-bold text-gray-600 text-center mb-4">{content.stretchIntro}</p>
      <div className="text-center mb-4">
        <p className="text-sm font-bold text-gray-600 mb-2">Try this pair:</p>
        <p className="text-2xl font-fredoka text-gray-800">
          {pair.short.word} / {pair.long.word}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Button
          onClick={playShort}
          className={`flex flex-col h-auto py-4 bg-yellow-400 hover:bg-yellow-500 text-white rounded-2xl font-bold transition-all ${
            activeStretch === "short" ? "ring-4 ring-white scale-105 animate-pulse" : ""
          }`}
        >
          <span className="text-lg">{content.stretchShortCue}</span>
          <span className="text-xs">Quick squeak</span>
        </Button>
        <Button
          onClick={playLong}
          className={`flex flex-col h-auto py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold transition-all ${
            activeStretch === "long" ? "ring-4 ring-white scale-105 animate-pulse" : ""
          }`}
        >
          <span className="text-lg">{content.stretchLongCue}</span>
          <span className="text-xs">Big smile stretch</span>
        </Button>
      </div>
      <Button onClick={() => setPairIndex((i) => i + 1)} variant="outline" className="w-full rounded-2xl font-bold">
        Next pair →
      </Button>
    </Card>
  );
}

function PairsContent({ content, onWordClick }: { content: VowelContrastContent; onWordClick: (word: string) => void }) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-xl font-fredoka text-purple-700 mb-1 text-center">✨ Magic E Pairs (CVCe)</h3>
        <p className="text-xs font-bold text-gray-500 text-center mb-4">{content.magicEIntro}</p>
        <div className="space-y-2">
          {content.magicEPairs.map((pair) => (
            <PairRow key={pair.short.word} pair={pair} onWordClick={onWordClick} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-fredoka text-blue-700 mb-1 text-center">🤝 Vowel Team Pairs</h3>
        <p className="text-xs font-bold text-gray-500 text-center mb-4">{content.vowelTeamIntro}</p>
        <div className="space-y-2">
          {content.vowelTeamPairs.map((pair) => (
            <PairRow key={pair.short.word} pair={pair} onWordClick={onWordClick} />
          ))}
        </div>
        {content.vowelTeamNote && (
          <p className="text-xs font-bold text-gray-500 text-center mt-3 italic">{content.vowelTeamNote}</p>
        )}
      </section>
    </div>
  );
}

function GamesContent({ content }: { content: VowelContrastContent }) {
  return (
    <div className="space-y-6">
      <MagicWandGame content={content} />
      <SoundSortGame content={content} />
      <StretchTestGame content={content} />
    </div>
  );
}

export default function VowelContrast() {
  const [, params] = useRoute("/vowel-contrast/:vowel?");
  const [, setLocation] = useLocation();
  const vowelKey = params?.vowel === "i" ? "i" : "a";
  const content = VOWEL_CONTENT[vowelKey];

  const [phase, setPhase] = useState<VowelPhase>("setup");
  const [activeTab, setActiveTab] = useState<ActiveTab>("pairs");
  const handleWordClick = useCallback((word: string) => speakWord(word), []);

  const switchVowel = (v: "a" | "i") => {
    setLocation(`/vowel-contrast/${v}`);
  };

  const startChallenge = () => {
    setPhase("play");
  };

  const backToSetup = () => {
    setPhase("setup");
  };

  if (phase === "play") {
    return (
      <div className="theme-page min-h-screen pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key="play"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            <KidPageHeader
              title={content.title}
              emoji={content.emoji}
              helpText={getVowelContrastHelp("play", activeTab)}
            />

            <main className="container mx-auto px-4 py-4 max-w-2xl">
              <Button
                onClick={backToSetup}
                variant="outline"
                className="kid-tap rounded-2xl font-fredoka font-bold text-sm kid-shadow border-2 mb-4"
              >
                ← Change Challenge
              </Button>

              {activeTab === "pairs" ? (
                <PairsContent content={content} onWordClick={handleWordClick} />
              ) : (
                <GamesContent content={content} />
              )}

              <Card className="mt-8 rounded-2xl p-4 theme-card kid-shadow text-center">
                <p className="text-sm font-bold text-gray-600 mb-3">{content.storyHint}</p>
                <Link href="/books">
                  <Button className="bg-coral text-white rounded-2xl font-bold">Go to Story Books 📖</Button>
                </Link>
              </Card>
            </main>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="theme-page min-h-screen pb-28">
      <AnimatePresence mode="wait">
        <motion.div
          key="setup"
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25 }}
        >
          <KidPageHeader title="Vowel Sounds" emoji="🔊" helpText={HELP_VOWEL_SETUP} />

          <main className="container mx-auto px-4 py-6 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-6 kid-shadow mb-6"
            >
              <h3 className="text-xl font-fredoka text-gray-800 mb-4 text-center">Choose Your Challenge</h3>

              <p className="text-sm font-bold text-gray-600 mb-3 text-center">Vowel</p>
              <div className="flex gap-2 mb-6">
                <Button
                  onClick={() => switchVowel("a")}
                  className={`flex-1 kid-tap rounded-2xl font-fredoka font-bold text-lg ${vowelKey === "a" ? "bg-coral text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  ✨ A Sounds
                </Button>
                <Button
                  onClick={() => switchVowel("i")}
                  className={`flex-1 kid-tap rounded-2xl font-fredoka font-bold text-lg ${vowelKey === "i" ? "bg-coral text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  🪁 I Sounds
                </Button>
              </div>

              <p className="text-sm font-bold text-gray-600 mb-3 text-center">Activity</p>
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={() => setActiveTab("pairs")}
                  className={`flex-1 kid-tap rounded-2xl font-fredoka font-bold text-lg ${activeTab === "pairs" ? "bg-coral text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  📚 Word Pairs
                </Button>
                <Button
                  onClick={() => setActiveTab("games")}
                  className={`flex-1 kid-tap rounded-2xl font-fredoka font-bold text-lg ${activeTab === "games" ? "bg-coral text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  🎮 Games
                </Button>
              </div>
            </motion.div>

            <Card className="rounded-2xl p-4 mb-6 theme-card kid-shadow">
              <p className="text-sm font-bold text-gray-700 text-center">
                💡 <span className="text-orange-700">Name Rule:</span> {content.nameRuleTip}
              </p>
            </Card>

            <KidBigAction
              emoji="🚀"
              label="Start"
              onClick={() => {
                setPhase("play");
              }}
            />
          </main>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
