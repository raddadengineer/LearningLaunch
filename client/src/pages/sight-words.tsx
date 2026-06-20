import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SightWord, UserProgress } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import ProgressBar from "@/components/progress-bar";
import { KidPageHeader, KidBigAction } from "@/components/kid-ui";
import { speakSightWord, speak, isAiCoachEnabled } from "@/lib/speech";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

const LEVEL_LABELS: Record<number, { emoji: string; name: string }> = {
  1: { emoji: "🌱", name: "Start" },
  2: { emoji: "🌿", name: "More" },
  3: { emoji: "🌳", name: "Super" },
};

export default function SightWords() {
  const preSelectedLevel = localStorage.getItem("selectedSightWordLevel");
  const [currentLevel, setCurrentLevel] = useState(preSelectedLevel ? parseInt(preSelectedLevel) : 1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();
  const currentUserId = localStorage.getItem("currentUserId");

  useEffect(() => {
    if (preSelectedLevel) localStorage.removeItem("selectedSightWordLevel");
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
    if (words && words.length > 0 && currentIndex < words.length) {
      const w = words[currentIndex];
      const t = setTimeout(() => {
        speakSightWord(w.word, w.sentence, { rate: 0.8, pitch: 1.1 });
      }, 600);
      return () => clearTimeout(t);
    }
  }, [currentIndex, words]);

  if (!currentUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 rounded-3xl kid-shadow text-center">
          <Link href="/select-user"><Button className="bg-coral text-white rounded-2xl">Select User</Button></Link>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-fredoka text-purple-600">Loading sight words...</div>
      </div>
    );
  }

  if (!words || words.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 rounded-3xl kid-shadow text-center">
          <div className="text-4xl mb-4">👁️</div>
          <h2 className="text-2xl font-fredoka mb-4">No sight words for this level yet</h2>
          <Link href="/"><Button className="bg-coral text-white rounded-2xl">Back to Home</Button></Link>
        </Card>
      </div>
    );
  }

  const currentWord = words[currentIndex];
  const currentProgress = progress?.find(p => p.level === currentLevel);
  const completed = Array.isArray(currentProgress?.completedItems) ? currentProgress.completedItems as number[] : [];
  const isCompleted = completed.includes(currentWord.id);

  const handleKnowWord = () => {
    if (!isCompleted) {
      const newCompleted = [...completed, currentWord.id];
      const stars = Math.min(5, Math.floor(newCompleted.length / 2));
      updateProgressMutation.mutate({ completedItems: newCompleted, stars });
    }
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      toast({ title: "Level Complete! 🎉", description: "You know all the sight words!" });
      setTimeout(() => { window.location.href = "/"; }, 2000);
    }
  };

  return (
    <div className="min-h-screen pb-28">
      <KidPageHeader
        title="Sight Words"
        emoji="👁️"
        stars={currentProgress?.stars || 0}
      >
        <ProgressBar current={currentIndex + 1} total={words.length} color="funpink" />
      </KidPageHeader>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
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
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
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

            {isCompleted && (
              <p className="text-green-600 font-bold text-lg mb-4">✅ You know this word!</p>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
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

        <Card className="rounded-[2.5rem] p-6 kid-shadow">
          <h3 className="text-xl font-fredoka text-gray-800 mb-4 text-center">Pick a Level</h3>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((level) => (
              <Button
                key={level}
                onClick={() => {
                  setCurrentLevel(level);
                  setCurrentIndex(0);
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
        </Card>
      </main>
    </div>
  );
}
