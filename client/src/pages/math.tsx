import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MathActivity, UserProgress } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import ProgressBar from "@/components/progress-bar";
import { speak } from "@/lib/speech";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Math() {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState(false);
  const { toast } = useToast();

  const { data: activities, isLoading: activitiesLoading } = useQuery<MathActivity[]>({
    queryKey: ["/api/math/activities", { type: "counting", level: 1 }],
  });

  const { data: progress } = useQuery<UserProgress[]>({
    queryKey: ["/api/user/1/progress/math"],
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ completedItems, stars }: { completedItems: number[], stars: number }) => {
      return apiRequest("POST", "/api/progress", {
        userId: 1,
        activityType: "math",
        level: 1,
        completedItems,
        stars
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/1/progress"] });
      toast({
        title: "Great counting! 🌟",
        description: "Your progress has been saved!",
      });
    }
  });

  if (activitiesLoading || !activities || activities.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-fredoka text-turquoise">Loading math activities...</div>
      </div>
    );
  }

  const currentActivity = activities[currentActivityIndex];
  const currentProgress = progress?.find(p => p.level === 1 && p.activityType === "math");
  const completedActivities = currentProgress?.completedItems || [];
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
    } else {
      setFeedback("🤔 Try again! Count carefully.");
      speak("Try again! Count carefully.", { rate: 0.8, pitch: 1.1 });
    }

    setTimeout(() => {
      setShowFeedback(false);
      if (answer === currentActivity.answer && currentActivityIndex < activities.length - 1) {
        setCurrentActivityIndex(currentActivityIndex + 1);
        setSelectedAnswer(null);
      }
    }, 3000);
  };

  const generateAnswerOptions = (correctAnswer: number) => {
    const options = [correctAnswer];
    while (options.length < 4) {
      const option = Math.max(1, correctAnswer + Math.floor(globalThis.Math.random() * 6) - 3);
      if (!options.includes(option)) {
        options.push(option);
      }
    }
    return options.sort(() => globalThis.Math.random() - 0.5);
  };

  const answerOptions = generateAnswerOptions(currentActivity.answer);

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
          <h2 className="text-2xl font-fredoka text-turquoise">Counting Fun</h2>
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

      <main className="container mx-auto px-4 py-8">
        {/* Counting Activity */}
        <div className="text-center mb-12">
          <h3 className="text-3xl font-fredoka text-gray-800 mb-8">
            {currentActivity.question}
          </h3>
          
          {/* Counting Objects */}
          <Card className="rounded-3xl p-8 kid-shadow max-w-2xl mx-auto mb-8">
            <div className="grid grid-cols-3 gap-6 mb-8 justify-items-center">
              {currentActivity.objects.map((object, index) => (
                <div 
                  key={index} 
                  className="cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => speak((index + 1).toString())}
                >
                  <div className="w-20 h-20 bg-red-400 rounded-full flex items-center justify-center text-4xl">
                    {object}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Answer Options */}
          <div className="grid grid-cols-4 gap-4 max-w-md mx-auto mb-8">
            {answerOptions.map((option) => (
              <Button
                key={option}
                onClick={() => handleAnswerSelect(option)}
                disabled={showFeedback}
                className={`
                  text-3xl font-fredoka py-6 rounded-2xl transition-colors touch-friendly
                  ${option % 4 === 0 ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' : 
                    option % 4 === 1 ? 'bg-green-100 hover:bg-green-200 text-green-700' :
                    option % 4 === 2 ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' :
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

        {/* Next Activity Button */}
        {selectedAnswer === currentActivity.answer && currentActivityIndex < activities.length - 1 && (
          <div className="flex justify-center">
            <Button 
              onClick={() => {
                setCurrentActivityIndex(currentActivityIndex + 1);
                setSelectedAnswer(null);
                setShowFeedback(false);
              }}
              className="bg-turquoise text-white px-8 py-4 rounded-2xl font-bold text-xl hover:bg-teal-500 transition-colors touch-friendly"
            >
              Next Activity →
            </Button>
          </div>
        )}

        {currentActivityIndex === activities.length - 1 && selectedAnswer === currentActivity.answer && (
          <div className="text-center">
            <div className="text-2xl font-fredoka text-turquoise mb-4">
              🎉 All activities complete!
            </div>
            <Link href="/">
              <Button className="bg-turquoise text-white px-8 py-4 rounded-2xl font-bold text-xl hover:bg-teal-500 transition-colors touch-friendly">
                Back to Home
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
