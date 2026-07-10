import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SightWord, UserProgress } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import ProgressBar from "@/components/progress-bar";
import { KidPageHeader, KidBigAction } from "@/components/kid-ui";
import { speakSightWord, speak } from "@/lib/speech";
import { HELP_SIGHT_WORDS_SETUP, HELP_SIGHT_WORDS_PLAY } from "@/lib/page-help";
import SpellingGame from "@/components/spelling-game";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type SightWordsPhase = "setup" | "play";

const LEVEL_LABELS: Record<number, { emoji: string; name: string }> = {
  1: { emoji: "🌱", name: "Start" },
  2: { emoji: "🌿", name: "More" },
  3: { emoji: "🌳", name: "Super" },
};

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

function highlightWordInSentence(sentence: string, word: string) {
  const parts = sentence.split(new RegExp(`(${word})`, "gi"));
  return parts.map((part, i) =>
    part.toUpperCase() === word.toUpperCase() ? (
      <span key={i} className="bg-sunnyellow px-2 py-1 rounded-lg font-bold text-coral mx-1">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function SightWords() {
  const preSelectedLevel = localStorage.getItem("selectedSightWordLevel");
  const [phase, setPhase] = useState<SightWordsPhase>("setup");
  const [activityMode, setActivityMode] = useState<"read" | "spell">("read");
  const [currentLevel, setCurrentLevel] = useState(preSelectedLevel ? parseInt(preSelectedLevel) : 1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const { toast } = useToast();
  const currentUserId = localStorage.getItem("currentUserId");

  useEffect(() => {
    if (preSelectedLevel) {
      localStorage.removeItem("selectedSightWordLevel");
      setPhase("play");
    }
  }, [preSelectedLevel]);

  useEffect(() => {
    if (!currentUserId) {
      const t = setTimeout(() => { window.location.href = "/select-user"; }, 3000);
      return () => clearTimeout(t);
    }
  }, [currentUserId]);

  const { data: words, isLoading } = useQuery<SightWord[]>({
    queryKey: ["/api/sight-words", currentLevel],
    queryFn: () => fetch(`/api/sight-words?level=${currentLevel}`).then(res => res.json()),
    enabled: !!currentUserId,
  });

  const { data: progress } = useQuery<UserProgress[]>({
    queryKey: ["/api/user/progress/sight-words", currentUserId, currentLevel],
    queryFn: () => fetch(`/api/user/${currentUserId}/progress/sight-words`).then(res => res.json()),
    enabled: !!currentUserId,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ completedItems, stars }: { completedItems: number[]; stars: number }) => {
      return apiRequest("/api/progress", "POST", {
        userId: parseInt(currentUserId!),
        activityType: "sight-words",
        level: currentLevel,
        completedItems,
        stars,
        totalItems: words?.length ?? 12,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Great job! ⭐", description: "You learned a sight word!" });
    },
  });

  useEffect(() => {
    if (phase !== "play") return;
    if (words && words.length > 0 && currentIndex < words.length) {
      const w = words[currentIndex];
      const t = setTimeout(() => {
        speakSightWord(w.word, w.sentence, { rate: 0.8, pitch: 1.1 });
      }, 600);
      return () => clearTimeout(t);
    }
  }, [currentIndex, words, phase]);

  const resetPlayState = () => {
    setCurrentIndex(0);
    setShowLevelComplete(false);
    setActivityMode("read");
  };

  const startChallenge = () => {
    resetPlayState();
    setPhase("play");
  };

  const backToSetup = () => {
    resetPlayState();
    setPhase("setup");
  };

  if (!currentUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 rounded-3xl kid-shadow text-center">
          <Link href="/select-user"><Button className="bg-coral text-white rounded-2xl">Select User</Button></Link>
        </Card>
      </div>
    );
  }

  const currentProgress = progress?.find(p => p.level === currentLevel);
  const setupStars = currentProgress?.stars || 0;

  if (phase === "play") {
    if (isLoading) {
      return (
        <div className="min-h-screen pb-28">
          <KidPageHeader title="Sight Words" emoji="👁️" stars={setupStars} helpText={HELP_SIGHT_WORDS_PLAY} />
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-2xl font-fredoka text-purple-600">Loading sight words...</div>
          </div>
        </div>
      );
    }

    if (!words || words.length === 0) {
      return (
        <div className="min-h-screen pb-28">
          <KidPageHeader title="Sight Words" emoji="👁️" stars={setupStars} helpText={HELP_SIGHT_WORDS_PLAY} />
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6 px-4">
            <Card className="p-8 rounded-3xl kid-shadow text-center">
              <div className="text-4xl mb-4">👁️</div>
              <h2 className="text-2xl font-fredoka mb-4">No sight words for this level yet</h2>
            </Card>
            <Button
              onClick={backToSetup}
              className="bg-purple-600 text-white px-8 py-6 rounded-[2rem] font-fredoka font-bold text-xl kid-shadow"
            >
              Change Level
            </Button>
          </div>
        </div>
      );
    }

    const currentWord = words[currentIndex];
    const completed = Array.isArray(currentProgress?.completedItems) ? currentProgress.completedItems as number[] : [];
    const isCompleted = completed.includes(currentWord.id);

    const handleKnowWord = () => {
      if (!isCompleted) {
        const newCompleted = [...completed, currentWord.id];
        const stars = Math.min(5, Math.floor(newCompleted.length / 2));
        updateProgressMutation.mutate({ completedItems: newCompleted, stars });
      }
      setActivityMode("read");
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        toast({ title: "Level Complete! 🎉", description: "You know all the sight words!" });
        setShowLevelComplete(true);
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
            <KidPageHeader title="Sight Words" emoji="👁️" stars={currentProgress?.stars || 0} helpText={HELP_SIGHT_WORDS_PLAY}>
              <ProgressBar current={currentIndex + 1} total={words.length} color="funpink" />
            </KidPageHeader>

            <div className="container mx-auto px-4 pt-4 max-w-2xl">
              <Button
                onClick={backToSetup}
                variant="outline"
                className="kid-tap rounded-2xl font-fredoka font-bold text-sm kid-shadow border-2 mb-4"
              >
                ← Change Level
              </Button>
            </div>

            {showLevelComplete ? (
              <div className="text-center mb-8 px-4 max-w-2xl mx-auto">
                <div className="text-3xl font-fredoka text-purple-600 mb-6">
                  🎉 All sight words complete!
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button
                    onClick={() => {
                      setCurrentIndex(0);
                      setShowLevelComplete(false);
                    }}
                    className="bg-purple-600 text-white px-8 py-6 rounded-[2rem] font-fredoka font-bold text-xl kid-shadow"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={backToSetup}
                    className="bg-coral text-white px-8 py-6 rounded-[2rem] font-fredoka font-bold text-xl kid-shadow"
                  >
                    Pick New Level
                  </Button>
                  <Link href="/">
                    <Button className="bg-gray-100 text-gray-700 px-8 py-6 rounded-[2rem] font-fredoka font-bold text-xl kid-shadow w-full">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <main className="container mx-auto px-4 py-4 max-w-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentWord.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center"
                  >
                    {currentWord.imageUrl && (
                      <img
                        src={getImageSrc(currentWord.imageUrl)}
                        alt={`Picture for ${currentWord.word}`}
                        className="w-56 h-40 object-cover rounded-[2rem] mx-auto mb-6 kid-shadow"
                      />
                    )}

                    <Card className="rounded-[2.5rem] p-10 kid-shadow bg-gradient-to-br from-purple-50 to-pink-50 mb-6">
                      {activityMode === "spell" ? (
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
                              setTimeout(() => {
                                setActivityMode("read");
                              }, 2000);
                            }} 
                          />
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-purple-500 mb-4 uppercase tracking-wider">Sight Word</p>
                          <button
                            type="button"
                            onClick={() => speakSightWord(currentWord.word, undefined, { rate: 0.8, pitch: 1.1 })}
                            className="text-7xl font-fredoka font-bold text-purple-700 mb-6 hover:scale-105 transition-transform touch-friendly cursor-pointer"
                          >
                            {currentWord.word}
                          </button>
                          <p className="text-sm text-gray-500 font-bold mb-2">Tap the word to hear it!</p>

                          <div className="bg-white/80 rounded-2xl p-5 mt-4">
                            <p className="text-sm font-bold text-gray-500 mb-2">In a sentence:</p>
                            <p className="text-2xl font-bold text-gray-800 leading-relaxed">
                              {highlightWordInSentence(currentWord.sentence, currentWord.word)}
                            </p>
                          </div>
                        </>
                      )}
                    </Card>

                    {activityMode !== "spell" && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          <KidBigAction
                            emoji="🔊"
                            label="Hear Word"
                            onClick={() => speakSightWord(currentWord.word, undefined, { rate: 0.8, pitch: 1.1 })}
                            className="bg-purple-500 text-white hover:bg-purple-600"
                          />
                          <KidBigAction
                            emoji="📖"
                            label="Hear Sentence"
                            onClick={() => speak(currentWord.sentence, { rate: 0.75, pitch: 1.1 })}
                            className="bg-blue-500 text-white hover:bg-blue-600"
                          />
                        </div>
                        <KidBigAction
                          emoji="🧩"
                          label="Spell it!"
                          onClick={() => setActivityMode("spell")}
                          className="bg-sunnyellow text-gray-800 hover:bg-sunnyellow/90 mb-8"
                        />
                      </>
                    )}

                    {isCompleted && (
                      <p className="text-green-600 font-bold text-lg mb-4">✅ You know this word!</p>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="flex justify-center gap-4 mb-8">
                  <Button
                    onClick={() => {
                      setShowLevelComplete(false);
                      setCurrentIndex(Math.max(0, currentIndex - 1));
                      setActivityMode("read");
                    }}
                    disabled={currentIndex === 0}
                    variant="outline"
                    className="kid-tap px-6 py-6 rounded-2xl font-fredoka font-bold text-lg kid-shadow"
                  >
                    ⬅️ Back
                  </Button>
                  <Button
                    onClick={handleKnowWord}
                    className="kid-tap bg-purple-600 text-white px-10 py-6 rounded-2xl font-fredoka font-bold text-xl kid-shadow btn-pressable hover:bg-purple-700"
                  >
                    {currentIndex === words.length - 1 ? "Done! 🎉" : "Got it! ⭐"}
                  </Button>
                </div>
              </main>
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
          <KidPageHeader title="Sight Words" emoji="👁️" stars={setupStars} helpText={HELP_SIGHT_WORDS_SETUP} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-6 kid-shadow max-w-2xl mx-auto mt-6 mb-6"
          >
            <h3 className="text-xl font-fredoka text-gray-800 mb-4 text-center">Pick a Level</h3>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((level) => (
                <Button
                  key={level}
                  onClick={() => {
                    setCurrentLevel(level);
                    resetPlayState();
                    queryClient.invalidateQueries({ queryKey: ["/api/sight-words"] });
                    queryClient.invalidateQueries({ queryKey: ["/api/user/progress/sight-words"] });
                  }}
                  className={`kid-tap flex flex-col py-5 rounded-2xl font-fredoka font-bold kid-shadow ${
                    currentLevel === level
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="text-2xl">{LEVEL_LABELS[level].emoji}</span>
                  <span className="text-sm">{LEVEL_LABELS[level].name}</span>
                </Button>
              ))}
            </div>
          </motion.div>

          <div className="container mx-auto px-4 max-w-md">
            <KidBigAction
              emoji="🚀"
              label="Start"
              onClick={startChallenge}
              className="bg-purple-600 text-white hover:bg-purple-700 text-2xl py-8"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
