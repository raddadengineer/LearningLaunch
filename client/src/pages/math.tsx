import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MathActivity, UserProgress } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import ProgressBar from "@/components/progress-bar";
import { speak } from "@/lib/speech";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MathPage() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [activityType, setActivityType] = useState<"counting" | "addition">("counting");
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const { toast } = useToast();

  const currentUserId = localStorage.getItem("currentUserId");

  const { data: activities, isLoading: activitiesLoading } = useQuery<MathActivity[]>({
    queryKey: ["/api/math/activities", activityType, currentLevel],
    queryFn: () => fetch(`/api/math/activities?type=${activityType}&level=${currentLevel}`).then(res => res.json()),
  });
  
  const { data: progress } = useQuery<UserProgress[]>({
    queryKey: ["/api/user/progress/math", currentUserId],
    queryFn: () => currentUserId ? fetch(`/api/user/${currentUserId}/progress/math`).then(res => res.json()) : [],
    enabled: !!currentUserId,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ completedItems, stars }: { completedItems: number[], stars: number }) => {
      return apiRequest("/api/progress", "POST", {
        userId: parseInt(currentUserId!),
        activityType: "math",
        level: currentLevel,
        completedItems,
        stars
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/progress/math"] });
      toast({
        title: activityType === "counting" ? "Great counting!" : "Awesome addition!",
        description: "Your progress has been saved!",
      });
    }
  });

  // Countdown timer effect - always call this hook
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && activities && currentActivityIndex < activities.length - 1) {
      // Auto-advance to next activity
      setCurrentActivityIndex(currentActivityIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setCountdown(null);
    }
  }, [countdown, currentActivityIndex, activities]);

  // Generate answer options using useMemo - must be called before any early returns
  const generateAnswerOptions = (correctAnswer: number, activityId: number) => {
    // Use activity ID as seed for consistent options
    const options = [correctAnswer];
    const seed = activityId * 1000;
    
    while (options.length < 4) {
      const randomValue = Math.sin(seed + options.length) * 10000;
      const option = Math.max(1, correctAnswer + Math.floor((randomValue - Math.floor(randomValue)) * 6) - 3);
      if (!options.includes(option)) {
        options.push(option);
      }
    }
    
    // Deterministic shuffle based on activity ID
    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const randomValue = Math.sin(seed + i) * 10000;
      const j = Math.floor((randomValue - Math.floor(randomValue)) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  };

  const answerOptions = useMemo(() => {
    if (!activities || activities.length === 0 || !activities[currentActivityIndex]) {
      return [];
    }
    return generateAnswerOptions(activities[currentActivityIndex].answer, activities[currentActivityIndex].id);
  }, [activities, currentActivityIndex]);

  if (!currentUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-fredoka text-red-500">Please select a user first!</div>
      </div>
    );
  }

  if (activitiesLoading || !activities || activities.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-fredoka text-turquoise">Loading math activities...</div>
      </div>
    );
  }

  const currentActivity = activities[currentActivityIndex];
  const currentProgress = progress?.find(p => p.level === currentLevel && p.activityType === "math");
  const completedActivities = Array.isArray(currentProgress?.completedItems) 
    ? currentProgress.completedItems 
    : [];
  const isActivityCompleted = completedActivities.includes(currentActivity.id);



  const handleAnswerSelect = (answer: number) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);

    if (answer === currentActivity.answer) {
      setFeedback("🎉 Great job! That's correct!");
      speak("Great job! That's correct!", { rate: 0.8, pitch: 1.2 });
      
      if (!isActivityCompleted) {
        const newCompletedItems = [...completedActivities, currentActivity.id];
        const stars = Math.min(5, newCompletedItems.length);
        setTimeout(() => {
          updateProgressMutation.mutate({ completedItems: newCompletedItems, stars });
        }, 2000);
      }

      // Start countdown for auto-advance
      setTimeout(() => {
        setShowFeedback(false);
        if (currentActivityIndex < activities.length - 1) {
          setCountdown(5); // 5 second countdown
        }
      }, 2000);
    } else {
      setFeedback("🤔 Try again! Count carefully.");
      speak("Try again! Count carefully.", { rate: 0.8, pitch: 1.1 });
      
      // For wrong answers, clear everything after 3 seconds
      setTimeout(() => {
        setShowFeedback(false);
        setSelectedAnswer(null);
      }, 3000);
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
          <h2 className="text-2xl font-fredoka text-turquoise">
            {activityType === "counting" ? "Counting Fun" : "Addition Adventures"}
          </h2>
          <ProgressBar 
            current={currentActivityIndex + 1} 
            total={activities.length} 
            color="turquoise"
          />
        </div>
        
        <div className="bg-sunnyellow px-4 py-2 rounded-full">
          <span className="text-lg font-bold text-gray-800">⭐ {currentProgress?.stars || 0}</span>
        </div>
      </div>

      {/* Level and Type Selection */}
      <div className="bg-white rounded-3xl p-6 kid-shadow max-w-4xl mx-auto mt-6 mb-6">
        <h3 className="text-xl font-fredoka text-gray-800 mb-4 text-center">Choose Your Challenge</h3>
        
        {/* Activity Type Selector */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            onClick={() => {
              setActivityType("counting");
              setCurrentActivityIndex(0);
              queryClient.invalidateQueries({ queryKey: ["/api/math/activities"] });
            }}
            className={`py-6 rounded-2xl font-bold text-lg transition-colors touch-friendly ${
              activityType === "counting" 
                ? 'bg-turquoise text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔢 Counting
          </Button>
          <Button
            onClick={() => {
              setActivityType("addition");
              setCurrentLevel(3); // Addition starts at level 3
              setCurrentActivityIndex(0);
              queryClient.invalidateQueries({ queryKey: ["/api/math/activities"] });
            }}
            className={`py-6 rounded-2xl font-bold text-lg transition-colors touch-friendly ${
              activityType === "addition" 
                ? 'bg-turquoise text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ➕ Addition
          </Button>
        </div>

        {/* Level Selector */}
        <div className="text-center">
          <h4 className="text-lg font-bold text-gray-700 mb-3">Level</h4>
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            {activityType === "counting" ? [1, 2].map((level) => (
              <Button
                key={level}
                onClick={() => {
                  setCurrentLevel(level);
                  setCurrentActivityIndex(0);
                  queryClient.invalidateQueries({ queryKey: ["/api/math/activities"] });
                }}
                className={`py-4 rounded-2xl font-bold text-lg transition-colors touch-friendly ${
                  currentLevel === level 
                    ? 'bg-coral text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Level {level}
              </Button>
            )) : [3].map((level) => (
              <Button
                key={level}
                onClick={() => {
                  setCurrentLevel(level);
                  setCurrentActivityIndex(0);
                  queryClient.invalidateQueries({ queryKey: ["/api/math/activities"] });
                }}
                className={`py-4 rounded-2xl font-bold text-lg transition-colors touch-friendly ${
                  currentLevel === level 
                    ? 'bg-coral text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Level {level}
              </Button>
            ))}
          </div>
          <div className="mt-3 text-center text-sm text-gray-600">
            {activityType === "counting" ? (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <span>Count 1-5</span>
                <span>Count 6-10</span>
              </div>
            ) : (
              <span>Simple addition with pictures</span>
            )}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Math Activity */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-8">
            <h3 className="text-3xl font-fredoka text-gray-800">
              {currentActivity.question}
            </h3>
            <Button
              onClick={() => speak(currentActivity.question, { rate: 0.8, pitch: 1.1 })}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 touch-friendly"
              size="sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M9 5l6 7-6 7z" />
              </svg>
            </Button>
          </div>
          
          {/* Objects Display */}
          <Card className="rounded-3xl p-8 kid-shadow max-w-4xl mx-auto mb-8">
            <div className={`grid gap-4 mb-8 justify-items-center ${
              currentActivity.objects.length <= 5 ? 'grid-cols-5' : 
              currentActivity.objects.length <= 8 ? 'grid-cols-4' : 'grid-cols-5'
            }`}>
              {currentActivity.objects.map((object, index) => (
                <div 
                  key={index} 
                  className="cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => speak((index + 1).toString())}
                >
                  <div className="w-16 h-16 flex items-center justify-center text-3xl">
                    {object}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Visual grouping for addition */}
            {activityType === "addition" && currentActivity.question.includes("+") && (
              <div className="text-lg font-bold text-gray-600 mb-4">
                Look at the groups and count them all together!
              </div>
            )}
          </Card>

          {/* Answer Options */}
          <div className="grid grid-cols-4 gap-4 max-w-md mx-auto mb-8">
            {answerOptions.map((option, index) => (
              <Button
                key={option}
                onClick={() => handleAnswerSelect(option)}
                disabled={showFeedback}
                className={`
                  text-3xl font-fredoka py-6 rounded-2xl transition-colors touch-friendly
                  ${index === 0 ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' : 
                    index === 1 ? 'bg-green-100 hover:bg-green-200 text-green-700' :
                    index === 2 ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' :
                    'bg-red-100 hover:bg-red-200 text-red-700'}
                  ${selectedAnswer === option ? 'ring-4 ring-gray-400' : ''}
                `}
              >
                {option}
              </Button>
            ))}
          </div>

          {/* Feedback Area */}
          {showFeedback && (
            <div className={`text-2xl font-bold mb-4 transition-opacity duration-300 ${
              feedback.includes('correct') ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {feedback}
            </div>
          )}

          {isActivityCompleted && !showFeedback && (
            <div className="text-center text-green-600 font-bold text-lg mb-4">
              ✅ Activity completed!
            </div>
          )}
        </div>

        {/* Auto-advance countdown or manual next button */}
        {selectedAnswer === currentActivity.answer && currentActivityIndex < activities.length - 1 && !showFeedback && (
          <div className="flex flex-col items-center mb-8">
            {countdown !== null ? (
              <div className="text-center">
                <div className="text-3xl font-bold text-turquoise mb-4">
                  Next activity in {countdown}...
                </div>
                <div className="w-32 h-32 mx-auto relative">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#0891b2"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={351.86}
                      strokeDashoffset={351.86 * (1 - (5 - countdown) / 5)}
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-turquoise">{countdown}</span>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    setCurrentActivityIndex(currentActivityIndex + 1);
                    setSelectedAnswer(null);
                    setShowFeedback(false);
                    setCountdown(null);
                  }}
                  className="bg-coral text-white px-6 py-3 rounded-2xl font-bold text-lg hover:bg-red-500 transition-colors touch-friendly mt-4"
                >
                  Skip to Next →
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => {
                  setCurrentActivityIndex(currentActivityIndex + 1);
                  setSelectedAnswer(null);
                  setShowFeedback(false);
                }}
                className="bg-turquoise text-white px-8 py-4 rounded-2xl font-bold text-xl hover:bg-teal-500 transition-colors touch-friendly animate-pulse"
              >
                Next Activity →
              </Button>
            )}
          </div>
        )}

        {currentActivityIndex === activities.length - 1 && selectedAnswer === currentActivity.answer && !showFeedback && (
          <div className="text-center mb-8">
            <div className="text-2xl font-fredoka text-turquoise mb-4">
              🎉 All activities complete!
            </div>
            <div className="mb-4">
              <Button 
                onClick={() => {
                  setCurrentActivityIndex(0);
                  setSelectedAnswer(null);
                  setShowFeedback(false);
                }}
                className="bg-coral text-white px-6 py-3 rounded-2xl font-bold text-lg hover:bg-red-500 transition-colors touch-friendly mr-4"
              >
                Try Again
              </Button>
              <Link href="/">
                <Button className="bg-turquoise text-white px-6 py-3 rounded-2xl font-bold text-lg hover:bg-teal-500 transition-colors touch-friendly">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
