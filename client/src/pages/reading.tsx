import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ReadingWord, UserProgress } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import LetterBox from "@/components/letter-box";
import ProgressBar from "@/components/progress-bar";
import { speak, speakWord, speakLetters } from "@/lib/speech";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Reading() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const { toast } = useToast();

  const { data: words, isLoading: wordsLoading } = useQuery<ReadingWord[]>({
    queryKey: ["/api/reading/words", { level: currentLevel }],
  });

  const { data: progress } = useQuery<UserProgress[]>({
    queryKey: ["/api/user/1/progress/reading"],
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ completedItems, stars }: { completedItems: number[], stars: number }) => {
      return apiRequest("POST", "/api/progress", {
        userId: 1,
        activityType: "reading",
        level: currentLevel,
        completedItems,
        stars
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/1/progress"] });
      toast({
        title: "Great job! 🌟",
        description: "Your progress has been saved!",
      });
    }
  });

  if (wordsLoading || !words || words.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-fredoka text-coral">Loading words...</div>
      </div>
    );
  }

  const currentWord = words[currentWordIndex];
  const currentProgress = progress?.find(p => p.level === currentLevel);
  const completedWords = currentProgress?.completedItems || [];
  const isWordCompleted = completedWords.includes(currentWord.id);

  const handleLetterClick = (letter: string) => {
    speak(letter.toLowerCase(), { rate: 0.6, pitch: 1.1 });
  };

  const handleSpellWord = () => {
    speakLetters(currentWord.word, { rate: 0.6, pitch: 1.2 });
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
    } else {
      toast({
        title: "Level Complete! 🎉",
        description: "You've finished all words in this level!",
      });
      // Navigate back to home after completing the level
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }
  };

  const handlePreviousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Activity Header */}
      <div className="flex items-center justify-between p-4 bg-white kid-shadow">
        <Link href="/">
          <Button variant="outline" size="sm" className="rounded-full touch-friendly">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
        </Link>
        
        <div className="text-center">
          <h2 className="text-2xl font-fredoka text-coral">
            Level {currentLevel}: {
              currentLevel === 1 ? "Three Letter Words" :
              currentLevel === 2 ? "Four Letter Words" :
              currentLevel === 3 ? "Five Letter Words" :
              currentLevel === 4 ? "Complex Words" :
              "Advanced Words"
            }
          </h2>
          <ProgressBar 
            current={currentWordIndex + 1} 
            total={words.length} 
            color="coral"
          />
        </div>
        
        <div className="bg-sunnyellow px-4 py-2 rounded-full">
          <span className="text-lg font-bold text-gray-800">⭐ {currentProgress?.stars || 0}</span>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Word Display */}
        <div className="text-center mb-12">
          <img 
            src={`${currentWord.imageUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300`}
            alt={`Image for the word ${currentWord.word}`}
            className="w-64 h-48 object-cover rounded-3xl mx-auto mb-8 kid-shadow"
          />
          
          <Card className="rounded-3xl p-8 kid-shadow max-w-md mx-auto">
            <div className="flex justify-center space-x-4 mb-8">
              {currentWord.word.split('').map((letter, index) => (
                <LetterBox
                  key={index}
                  letter={letter}
                  color={index === 0 ? 'coral' : index === 1 ? 'turquoise' : 'sunnyellow'}
                  onClick={() => handleLetterClick(letter)}
                />
              ))}
            </div>
            
            {/* Audio Controls */}
            <div className="flex justify-center space-x-4 mb-6">
              <Button 
                onClick={handleSpellWord}
                className="bg-green-500 text-white px-6 py-3 rounded-2xl font-bold text-lg hover:bg-green-600 transition-colors touch-friendly"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Spell It
              </Button>
              <Button 
                onClick={handleSayWord}
                className="bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold text-lg hover:bg-blue-600 transition-colors touch-friendly"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M13 16a3 3 0 01-6 0V8a3 3 0 016 0v8z" />
                </svg>
                Say Word
              </Button>
            </div>

            {isWordCompleted && (
              <div className="text-center text-green-600 font-bold text-lg mb-4">
                ✅ Word completed!
              </div>
            )}
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <Button 
            onClick={handlePreviousWord}
            disabled={currentWordIndex === 0}
            variant="outline"
            className="px-8 py-4 rounded-2xl font-bold text-xl transition-colors touch-friendly"
          >
            ← Previous
          </Button>
          <Button 
            onClick={handleNextWord}
            className="bg-coral text-white px-8 py-4 rounded-2xl font-bold text-xl hover:bg-red-500 transition-colors touch-friendly"
          >
            {currentWordIndex === words.length - 1 ? "Finish!" : "Next →"}
          </Button>
        </div>

        {/* Level Selection */}
        <div className="bg-white rounded-3xl p-6 kid-shadow max-w-2xl mx-auto">
          <h3 className="text-xl font-fredoka text-gray-800 mb-4 text-center">Choose Your Level</h3>
          <div className="grid grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((level) => (
              <Button
                key={level}
                onClick={() => {
                  setCurrentLevel(level);
                  setCurrentWordIndex(0);
                }}
                className={`
                  py-6 rounded-2xl font-bold text-lg transition-colors touch-friendly
                  ${currentLevel === level 
                    ? 'bg-coral text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                Level {level}
              </Button>
            ))}
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            <div className="grid grid-cols-5 gap-3 text-xs">
              <span>3-letter words</span>
              <span>4-letter words</span>
              <span>5-letter words</span>
              <span>Complex words</span>
              <span>Advanced words</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
