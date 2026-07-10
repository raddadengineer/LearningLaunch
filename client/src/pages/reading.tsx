import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ReadingWord, UserProgress } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import LetterBox from "@/components/letter-box";
import PhonicsBox from "@/components/phonics-box";
import ProgressBar from "@/components/progress-bar";
import { KidPageHeader, KidBigAction } from "@/components/kid-ui";
import SpellingGame from "@/components/spelling-game";
import { speak, speakWord, speakLetters, speakPhonics, speakLetterCoach, speakChunkCoach } from "@/lib/speech";
import { HELP_READING_SETUP, HELP_READING_PLAY } from "@/lib/page-help";
import { getPhonicsForWord } from "@shared/phonics";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type ReadingPhase = "setup" | "play";

const LEVELS = [
  { n: 1, emoji: "🌱", name: "Start" },
  { n: 2, emoji: "🌿", name: "Easy" },
  { n: 3, emoji: "🌳", name: "Good" },
  { n: 4, emoji: "⭐", name: "Super" },
  { n: 5, emoji: "🚀", name: "Wow" },
  { n: 6, emoji: "📖", name: "Read" },
];

const screenVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

function getImageSrc(imageUrl: string | null | undefined): string {
  if (!imageUrl) return "";
  return imageUrl.includes("unsplash.com")
    ? `${imageUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300`
    : imageUrl;
}

function UserNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coral via-turquoise to-sunnyellow">
      <Card className="p-8 max-w-md mx-auto rounded-3xl kid-shadow">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-fredoka text-gray-800 mb-4">User not found</h2>
          <p className="text-gray-600 mb-6">Please select a user first.</p>
          <p className="text-sm text-gray-500 mb-4">Redirecting in 3 seconds...</p>
          <Link href="/select-user">
            <Button className="bg-coral hover:bg-coral/90 text-white px-6 py-3 rounded-2xl">
              Select User Now
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function Reading() {
  const preSelectedLevel = localStorage.getItem("selectedReadingLevel");
  const [phase, setPhase] = useState<ReadingPhase>("setup");
  const [activityMode, setActivityMode] = useState<"read" | "spell">("read");
  const [currentLevel, setCurrentLevel] = useState(preSelectedLevel ? parseInt(preSelectedLevel) : 1);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showMoreLevels, setShowMoreLevels] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [activeChunkIndex, setActiveChunkIndex] = useState(-1);
  const [playSessionId, setPlaySessionId] = useState(0);
  const { toast } = useToast();

  const currentUserId = localStorage.getItem("currentUserId");

  useEffect(() => {
    if (preSelectedLevel) {
      localStorage.removeItem("selectedReadingLevel");
      setPhase("play");
    }
  }, [preSelectedLevel]);

  useEffect(() => {
    if (!currentUserId) {
      const t = setTimeout(() => {
        window.location.href = "/select-user";
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [currentUserId]);

  const { data: rawWords, isLoading: wordsLoading } = useQuery<ReadingWord[]>({
    queryKey: ["/api/reading/words", currentLevel],
    queryFn: () => fetch(`/api/reading/words?level=${currentLevel}`).then(res => res.json()),
    enabled: !!currentUserId,
  });

  const words = useMemo(() => {
    if (!rawWords) return [];
    return [...rawWords].sort(() => Math.random() - 0.5);
  }, [rawWords, playSessionId]);

  const { data: progress } = useQuery<UserProgress[]>({
    queryKey: ["/api/user/progress/reading", currentUserId, currentLevel],
    queryFn: () => fetch(`/api/user/${currentUserId}/progress/reading`).then(res => res.json()),
    enabled: !!currentUserId,
  });

  const { data: allWords } = useQuery<ReadingWord[]>({
    queryKey: ["/api/reading/words/all"],
    queryFn: () => fetch("/api/reading/words/all").then(res => res.json()),
    enabled: !!currentUserId && phase === "play" && currentLevel === 6,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ completedItems, stars }: { completedItems: number[], stars: number }) => {
      return apiRequest("/api/progress", "POST", {
        userId: parseInt(currentUserId!),
        activityType: "reading",
        level: currentLevel,
        completedItems,
        stars,
        totalItems: words?.length ?? 12,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Great job! 🌟",
        description: "Your progress has been saved!",
      });
    }
  });

  useEffect(() => {
    if (phase !== "play") return;
    if (words && words.length > 0 && currentWordIndex < words.length) {
      setActiveChunkIndex(-1);
      const word = words[currentWordIndex].word;
      const timeoutId = setTimeout(() => {
        speakWord(word, { rate: 0.8, pitch: 1.1 });
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [currentWordIndex, words, phase]);

  const resetPlayState = () => {
    setCurrentWordIndex(0);
    setShowLevelComplete(false);
    setActivityMode("read");
  };

  const startChallenge = () => {
    resetPlayState();
    setPhase("play");
    setPlaySessionId(id => id + 1);
  };

  const backToSetup = () => {
    resetPlayState();
    setPhase("setup");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } }
  };

  if (!currentUserId) {
    return <UserNotFound />;
  }

  const currentProgress = progress?.find(p => p.level === currentLevel);
  const setupStars = currentProgress?.stars || 0;

  const levelPicker = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2.5rem] p-6 kid-shadow max-w-2xl mx-auto mt-6 mb-6"
    >
      <h3 className="text-xl font-fredoka text-gray-800 mb-4 text-center">Pick a Level</h3>
      <div className="grid grid-cols-3 gap-3">
        {LEVELS.filter(l => l.n <= 3).map(({ n, emoji, name }) => (
          <Button
            key={n}
            onClick={() => {
              setCurrentLevel(n);
              resetPlayState();
              queryClient.invalidateQueries({ queryKey: ["/api/reading/words"] });
              queryClient.invalidateQueries({ queryKey: ["/api/user/progress/reading"] });
            }}
            className={`kid-tap flex flex-col py-5 rounded-2xl font-fredoka font-bold kid-shadow ${
              currentLevel === n ? "bg-coral text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span className="text-2xl">{emoji}</span>
            <span className="text-sm">{name}</span>
          </Button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setShowMoreLevels(!showMoreLevels)}
        className="w-full mt-3 text-xs font-bold text-gray-400 py-2"
      >
        {showMoreLevels ? "Hide harder levels ▲" : "More levels (grown-ups) ▼"}
      </button>
      {showMoreLevels && (
        <div className="grid grid-cols-3 gap-3 mt-2">
          {LEVELS.filter(l => l.n > 3).map(({ n, emoji, name }) => (
            <Button
              key={n}
              onClick={() => {
                setCurrentLevel(n);
                resetPlayState();
                queryClient.invalidateQueries({ queryKey: ["/api/reading/words"] });
                queryClient.invalidateQueries({ queryKey: ["/api/user/progress/reading"] });
              }}
              className={`kid-tap flex flex-col py-5 rounded-2xl font-fredoka font-bold kid-shadow ${
                currentLevel === n ? "bg-coral text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-sm">{name}</span>
            </Button>
          ))}
        </div>
      )}
    </motion.div>
  );

  if (phase === "play") {
    if (wordsLoading) {
      return (
        <div className="min-h-screen pb-28">
          <KidPageHeader title="Words" emoji="🔤" stars={setupStars} helpText={HELP_READING_PLAY} />
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-2xl font-fredoka text-coral">Loading words...</div>
          </div>
        </div>
      );
    }

    if (!words || words.length === 0) {
      return (
        <div className="min-h-screen pb-28">
          <KidPageHeader title="Words" emoji="🔤" stars={setupStars} helpText={HELP_READING_PLAY} />
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6 px-4">
            <Card className="p-8 max-w-md rounded-3xl kid-shadow text-center">
              <div className="text-4xl mb-4">📚</div>
              <h2 className="text-2xl font-fredoka text-gray-800 mb-4">No words for this level yet</h2>
              <p className="text-gray-600 mb-6">Try choosing a different level.</p>
            </Card>
            <Button
              onClick={backToSetup}
              className="bg-coral text-white px-8 py-6 rounded-[2rem] font-fredoka font-bold text-xl kid-shadow"
            >
              Change Level
            </Button>
          </div>
        </div>
      );
    }

    const currentWord = words[currentWordIndex];
    const wordPhonics = (Array.isArray(currentWord.phonics) && currentWord.phonics.length > 0)
      ? currentWord.phonics as string[]
      : getPhonicsForWord(currentWord.word);
    const hasPhonics = wordPhonics.length > 0 && currentLevel !== 6;

    const phonicsLookup = new Map<string, string[]>();
    if (allWords) {
      for (const w of allWords) {
        const chunks = Array.isArray(w.phonics) && w.phonics.length > 0
          ? w.phonics as string[]
          : getPhonicsForWord(w.word);
        if (w.word.includes(" ")) {
          w.word.split(" ").forEach(part => {
            phonicsLookup.set(part.toUpperCase(), getPhonicsForWord(part));
          });
        } else {
          phonicsLookup.set(w.word.toUpperCase(), chunks);
        }
      }
    }

    const handleWordInSentenceClick = (word: string) => {
      const clean = word.replace(/[^A-Za-z]/g, "").toUpperCase();
      const chunks = phonicsLookup.get(clean) ?? getPhonicsForWord(clean);
      speakPhonics(chunks, { rate: 0.6, pitch: 1.2 }, clean, setActiveChunkIndex);
    };

    const completedWords = Array.isArray(currentProgress?.completedItems) ? currentProgress.completedItems as number[] : [];
    const isWordCompleted = completedWords.includes(currentWord.id);

    const handleLetterClick = (letter: string) => {
      speakLetterCoach(letter, { rate: 0.6, pitch: 1.1 });
    };

    const handleSpellWord = () => {
      if (hasPhonics) {
        speakPhonics(wordPhonics, { rate: 0.6, pitch: 1.2 }, currentWord.word, setActiveChunkIndex);
      } else {
        speakLetters(currentWord.word, { rate: 0.6, pitch: 1.2 }, setActiveChunkIndex);
      }
    };

    const handleChunkClick = (chunk: string) => {
      speakChunkCoach(chunk, { rate: 0.6, pitch: 1.1 });
    };

    const handleSayWord = () => {
      speakWord(currentWord.word, { rate: 0.8, pitch: 1.1 });
    };

    const handleNextWord = () => {
      if (!isWordCompleted) {
        const newCompletedItems = [...completedWords, currentWord.id];
        const stars = Math.min(5, Math.floor(newCompletedItems.length / 2));
        updateProgressMutation.mutate({ completedItems: newCompletedItems, stars });
      }

      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
        setActivityMode("read");
      } else {
        toast({
          title: "Level Complete! 🎉",
          description: "You've finished all words in this level!",
        });
        setShowLevelComplete(true);
      }
    };

    const handlePreviousWord = () => {
      if (currentWordIndex > 0) {
        setShowLevelComplete(false);
        setCurrentWordIndex(currentWordIndex - 1);
        setActivityMode("read");
      }
    };

    return (
      <div className="min-h-screen pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key="play"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            <KidPageHeader title="Words" emoji="🔤" stars={currentProgress?.stars || 0} helpText={HELP_READING_PLAY}>
              <ProgressBar current={currentWordIndex + 1} total={words.length} color="coral" />
            </KidPageHeader>

            <div className="container mx-auto px-4 pt-4">
              <Button
                onClick={backToSetup}
                variant="outline"
                className="kid-tap rounded-2xl font-fredoka font-bold text-sm kid-shadow border-2 mb-4"
              >
                ← Change Level
              </Button>
            </div>

            {showLevelComplete ? (
              <motion.div variants={itemVariants} className="text-center mb-8 px-4">
                <div className="text-3xl font-fredoka text-coral mb-6">
                  🎉 All words complete!
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button
                    onClick={() => {
                      setCurrentWordIndex(0);
                      setShowLevelComplete(false);
                      setPlaySessionId(id => id + 1);
                    }}
                    className="bg-coral text-white px-8 py-6 rounded-[2rem] font-fredoka font-bold text-xl kid-shadow"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={backToSetup}
                    className="bg-turquoise text-white px-8 py-6 rounded-[2rem] font-fredoka font-bold text-xl kid-shadow"
                  >
                    Pick New Level
                  </Button>
                  <Link href="/">
                    <Button className="bg-gray-100 text-gray-700 px-8 py-6 rounded-[2rem] font-fredoka font-bold text-xl kid-shadow w-full">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.main
                className="container mx-auto px-4 py-4"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                <motion.div variants={itemVariants} className="text-center mb-12">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentWord.imageUrl}
                      initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      exit={{ scale: 0.8, opacity: 0, rotate: 5 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      src={getImageSrc(currentWord.imageUrl)}
                      alt={`Image for the word ${currentWord.word}`}
                      className="w-64 h-48 object-cover rounded-[2rem] mx-auto mb-8 kid-shadow"
                    />
                  </AnimatePresence>

                  <Card className="rounded-[2.5rem] p-8 kid-shadow max-w-4xl mx-auto bg-white/90 backdrop-blur">
                    {activityMode === "spell" && currentLevel !== 6 ? (
                      <div className="mb-8">
                        <div className="text-center mb-4">
                          <Button variant="ghost" onClick={() => setActivityMode("read")} className="mb-2">
                            ← Back to Reading
                          </Button>
                          <h3 className="text-2xl font-fredoka text-gray-700">Spell the word!</h3>
                        </div>
                        <SpellingGame 
                          word={currentWord.word} 
                          onComplete={() => {
                            // Celebrate and switch back to read mode
                            setTimeout(() => {
                              setActivityMode("read");
                            }, 2000);
                          }} 
                        />
                      </div>
                    ) : (
                      <>
                        {currentLevel === 6 ? (
                          <div className="text-center mb-8">
                            <div className="text-4xl font-bold text-gray-800 mb-6 leading-relaxed">
                              {currentWord.word.split(" ").map((word, wordIndex) => (
                                <button
                                  key={wordIndex}
                                  type="button"
                                  onClick={() => handleWordInSentenceClick(word)}
                                  className="inline-block mx-2 mb-2 cursor-pointer hover:scale-105 transition-transform touch-friendly"
                                >
                                  {word.split("").map((letter, letterIndex) => (
                                    <span
                                      key={letterIndex}
                                      className={`inline-block px-2 py-1 mx-1 rounded-lg text-white font-bold ${
                                        letterIndex % 3 === 0 ? "bg-coral" :
                                          letterIndex % 3 === 1 ? "bg-turquoise" : "bg-sunnyellow"
                                      }`}
                                    >
                                      {letter}
                                    </span>
                                  ))}
                                </button>
                              ))}
                            </div>
                            <p className="text-sm text-gray-500 font-bold">Tap any word to sound it out!</p>
                          </div>
                        ) : hasPhonics ? (
                          <div className="flex justify-center flex-wrap gap-4 mb-8">
                            {wordPhonics.map((chunk, index) => (
                              <PhonicsBox
                                key={index}
                                chunk={chunk}
                                color={index === 0 ? "coral" : index === 1 ? "turquoise" : index === 2 ? "sunnyellow" : index === 3 ? "mintgreen" : "skyblue"}
                                onClick={() => handleChunkClick(chunk)}
                                isActive={activeChunkIndex === index}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="flex justify-center space-x-4 mb-8">
                            {currentWord.word.split("").map((letter, index) => (
                              <LetterBox
                                key={index}
                                letter={letter}
                                color={index === 0 ? "coral" : index === 1 ? "turquoise" : "sunnyellow"}
                                onClick={() => handleLetterClick(letter)}
                                isActive={activeChunkIndex === index}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {activityMode !== "spell" && (
                      <div className={`grid grid-cols-1 ${currentLevel === 6 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-3 mb-6`}>
                        {currentLevel === 6 ? (
                        <>
                          <KidBigAction emoji="🔊" label="Hear Sentence" onClick={() => speak(currentWord.word, { rate: 0.7, pitch: 1.1 })} className="bg-blue-500 text-white hover:bg-blue-600" />
                          <KidBigAction
                            emoji="👆"
                            label="Each Word"
                            onClick={() => {
                              currentWord.word.split(" ").forEach((word, index) => {
                                setTimeout(() => speak(word, { rate: 0.6, pitch: 1.2 }), index * 800);
                              });
                            }}
                            className="bg-green-500 text-white hover:bg-green-600"
                          />
                        </>
                      ) : (
                        <>
                          <KidBigAction emoji="📢" label="Say it!" onClick={handleSayWord} className="bg-coral text-white hover:bg-coral/90" />
                          <KidBigAction emoji="🔤" label="Sound it out!" onClick={handleSpellWord} className="bg-turquoise text-white hover:bg-turquoise/90" />
                          <KidBigAction emoji="🧩" label="Spell it!" onClick={() => setActivityMode("spell")} className="bg-sunnyellow text-gray-800 hover:bg-sunnyellow/90" />
                        </>
                      )}
                    </div>
                  )}

                    {isWordCompleted && (
                      <div className="text-center text-green-600 font-bold text-lg mb-4">
                        ✅ Word completed!
                      </div>
                    )}
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants} className="flex justify-center gap-4 mb-8">
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handlePreviousWord}
                      disabled={currentWordIndex === 0}
                      variant="outline"
                      className="kid-tap px-6 py-6 rounded-2xl font-fredoka font-bold text-lg kid-shadow border-2"
                    >
                      ⬅️ Back
                    </Button>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleNextWord}
                      className="kid-tap bg-coral text-white px-8 py-6 rounded-2xl font-fredoka font-bold text-xl kid-shadow btn-pressable"
                    >
                      {currentWordIndex === words.length - 1 ? "Done! 🎉" : "Next ➡️"}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.main>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      <AnimatePresence mode="wait">
        <motion.div
          key="setup"
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25 }}
        >
          <KidPageHeader title="Words" emoji="🔤" stars={setupStars} helpText={HELP_READING_SETUP} />
          {levelPicker}
          <div className="container mx-auto px-4 max-w-md">
            <KidBigAction
              emoji="🚀"
              label="Start"
              onClick={startChallenge}
              className="bg-coral text-white hover:bg-coral/90 text-2xl py-8"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
