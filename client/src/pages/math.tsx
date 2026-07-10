import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MathActivity, UserProgress } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import ProgressBar from "@/components/progress-bar";
import { KidPageHeader, KidBigAction } from "@/components/kid-ui";
import { speak } from "@/lib/speech";
import { HELP_MATH_SETUP, HELP_MATH_PLAY } from "@/lib/page-help";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MATH_OVERVIEWS } from "@/lib/math-overviews";

type MathPhase = "setup" | "overview" | "play";

export default function MathPage() {
  const [phase, setPhase] = useState<MathPhase>("setup");
  const [overviewFinished, setOverviewFinished] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [activityType, setActivityType] = useState<"counting" | "addition" | "subtraction" | "mixed" | "shapes" | "story" | "place_value" | "geometry" | "measurement">("counting");
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [playSessionId, setPlaySessionId] = useState(0);
  const { toast } = useToast();

  const currentUserId = localStorage.getItem("currentUserId");

  useEffect(() => {
    if (!currentUserId) {
      const t = setTimeout(() => {
        window.location.href = "/select-user";
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [currentUserId]);

  const { data: rawActivities, isLoading: activitiesLoading } = useQuery<MathActivity[]>({
    queryKey: ["/api/math/activities", activityType, currentLevel],
    queryFn: () => fetch(`/api/math/activities?type=${activityType}&level=${currentLevel}`).then(res => res.json()),
    enabled: !!currentUserId,
  });

  const activities = useMemo(() => {
    if (!rawActivities) return [];
    return [...rawActivities].sort(() => Math.random() - 0.5);
  }, [rawActivities, playSessionId]);

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
        stars,
        totalItems: activities?.length ?? 5,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/progress/math"] });
      toast({
        title: activityType === "counting" ? "Great counting!" : 
               activityType === "addition" ? "Awesome addition!" : 
               activityType === "subtraction" ? "Super subtraction!" : 
               activityType === "shapes" ? "Super shapes!" : 
               activityType === "story" ? "Super story math!" : 
               activityType === "place_value" ? "Perfect place value!" : 
               activityType === "geometry" ? "Great geometry!" : 
               activityType === "measurement" ? "Marvelous measurement!" : "Marvelous math!",
        description: "Your progress has been saved!",
      });
    }
  });

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && activities && currentActivityIndex < activities.length - 1) {
      setCurrentActivityIndex(currentActivityIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setCountdown(null);
    }
  }, [countdown, currentActivityIndex, activities]);

  useEffect(() => {
    if (phase !== "play") return;
    const currentActivity = activities?.[currentActivityIndex];
    if (currentActivity?.question) {
      const timeoutId = setTimeout(() => {
        speak(currentActivity.question, { rate: 0.8, pitch: 1.1 });
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [activities, currentActivityIndex, phase]);

  useEffect(() => {
    let isActive = true;
    if (phase === "overview") {
      const text = MATH_OVERVIEWS[activityType]?.[currentLevel] || "Let's learn some math!";
      speak(text, { rate: 0.85 }).then(() => {
        if (isActive) setOverviewFinished(true);
      });
    }
    return () => {
      isActive = false;
      if (phase === "overview" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [phase, activityType, currentLevel]);

  const generateAnswerOptions = (correctAnswer: number, activityId: number) => {
    const options = [correctAnswer];

    for (let i = 1; i <= 3; i++) {
      const offset = (activityId + i) % 5 + 1;
      let option = correctAnswer + (i % 2 === 0 ? offset : -offset);
      if (option < 1) option = correctAnswer + offset;
      if (option === correctAnswer) option = correctAnswer + 1;

      while (options.includes(option)) {
        option = option + 1;
        if (option > 10) option = 1;
      }
      options.push(option);
    }

    const seed = activityId % 4;
    for (let i = 0; i < seed; i++) {
      const first = options.shift();
      if (first) options.push(first);
    }

    return options;
  };

  const resetPlayState = () => {
    setCurrentActivityIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setCountdown(null);
    setFeedback("");
  };

  const startChallenge = () => {
    resetPlayState();
    setOverviewFinished(false);
    setPhase("overview");
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

  const screenVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  if (!currentUserId) {
    return (
      <div className="theme-page min-h-screen flex items-center justify-center">
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

  const currentProgress = progress?.find(p => p.level === currentLevel && p.activityType === "math");
  const setupStars = currentProgress?.stars || 0;

  if (phase === "overview") {
    const titleMap = {
      counting: "Counting",
      addition: "Adding",
      subtraction: "Subtracting",
      shapes: "Shapes",
      story: "Story Problems",
      place_value: "Place Value",
      geometry: "Geometry",
      measurement: "Measurement",
      mixed: "Mixed Math"
    };
    
    return (
      <div className="theme-page min-h-screen pb-28">
        <KidPageHeader title={titleMap[activityType]} emoji="🔢" stars={setupStars} helpText={HELP_MATH_PLAY} />
        <motion.div
          key="overview"
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="container mx-auto px-4 mt-8 flex flex-col items-center max-w-2xl"
        >
          <Card className="p-8 rounded-[2.5rem] kid-shadow w-full text-center theme-card mb-8">
            <div className="text-6xl mb-6">👩‍🏫</div>
            <h2 className="text-3xl font-fredoka text-gray-800 mb-6">Lesson Time!</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              {MATH_OVERVIEWS[activityType]?.[currentLevel] || "Let's learn some math!"}
            </p>
          </Card>

          <AnimatePresence mode="popLayout">
            {overviewFinished ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
              >
                <KidBigAction
                  emoji="🎮"
                  label="Let's Play!"
                  onClick={() => {
                    setPhase("play");
                    setPlaySessionId(id => id + 1);
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white text-2xl py-8 w-full"
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => {
                    if ("speechSynthesis" in window) {
                      window.speechSynthesis.cancel();
                    }
                    setPhase("play");
                    setPlaySessionId(id => id + 1);
                  }}
                  className="text-gray-500 hover:text-gray-700 font-bold"
                >
                  Skip to Game
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  if (phase === "play") {
    if (activitiesLoading) {
      return (
        <div className="theme-page min-h-screen pb-28">
          <KidPageHeader
            title={activityType === "counting" ? "Counting" : 
                   activityType === "addition" ? "Adding" : 
                   activityType === "subtraction" ? "Subtracting" : 
                   activityType === "shapes" ? "Shapes" : 
                   activityType === "story" ? "Story Problems" : 
                   activityType === "place_value" ? "Place Value" : 
                   activityType === "geometry" ? "Geometry" : 
                   activityType === "measurement" ? "Measurement" : "Mixed Math"}
            emoji="🔢"
            stars={setupStars}
            helpText={HELP_MATH_PLAY}
          />
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-2xl font-fredoka text-turquoise">Loading math activities...</div>
          </div>
        </div>
      );
    }

    if (!activities || activities.length === 0) {
      return (
        <div className="theme-page min-h-screen pb-28">
          <KidPageHeader title="Math" emoji="🔢" stars={setupStars} helpText={HELP_MATH_PLAY} />
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6 px-4">
            <div className="text-2xl font-fredoka text-red-500 text-center">
              No math activities found. Please try again.
            </div>
            <Button
              onClick={backToSetup}
              className="bg-coral text-white px-8 py-6 rounded-[2rem] font-fredoka font-bold text-xl kid-shadow"
            >
              Change Challenge
            </Button>
          </div>
        </div>
      );
    }

    const currentActivity = activities[currentActivityIndex];
    if (!currentActivity) {
      return (
        <div className="theme-page min-h-screen pb-28">
          <KidPageHeader title="Math" emoji="🔢" stars={setupStars} helpText={HELP_MATH_PLAY} />
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6 px-4">
            <div className="text-2xl font-fredoka text-red-500 text-center">
              Activity not found. Please try again.
            </div>
            <Button
              onClick={backToSetup}
              className="bg-coral text-white px-8 py-6 rounded-[2rem] font-fredoka font-bold text-xl kid-shadow"
            >
              Change Challenge
            </Button>
          </div>
        </div>
      );
    }

    const completedActivities = Array.isArray(currentProgress?.completedItems)
      ? (currentProgress.completedItems as number[])
      : [];
    const isActivityCompleted = completedActivities.includes(currentActivity.id);
    const answerOptions = generateAnswerOptions(currentActivity.answer, currentActivity.id);
    const activityObjects = Array.isArray(currentActivity.objects)
      ? (currentActivity.objects as string[])
      : [];

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

        setTimeout(() => {
          setShowFeedback(false);
          if (currentActivityIndex < activities.length - 1) {
            setCountdown(5);
          }
        }, 2000);
      } else {
        setFeedback("🤔 Try again! Count carefully.");
        speak("Try again! Count carefully.", { rate: 0.8, pitch: 1.1 });

        setTimeout(() => {
          setShowFeedback(false);
          setSelectedAnswer(null);
        }, 3000);
      }
    };

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
              title={activityType === "counting" ? "Counting" : 
                     activityType === "addition" ? "Adding" : 
                     activityType === "subtraction" ? "Subtracting" : 
                     activityType === "shapes" ? "Shapes" : 
                     activityType === "story" ? "Story Problems" : 
                     activityType === "place_value" ? "Place Value" : 
                     activityType === "geometry" ? "Geometry" : 
                     activityType === "measurement" ? "Measurement" : "Mixed Math"}
              emoji="🔢"
              stars={currentProgress?.stars || 0}
              helpText={HELP_MATH_PLAY}
            >
              <ProgressBar current={currentActivityIndex + 1} total={activities.length} color="turquoise" />
            </KidPageHeader>

            <div className="container mx-auto px-4 pt-4">
              <Button
                onClick={backToSetup}
                variant="outline"
                className="kid-tap rounded-2xl font-fredoka font-bold text-sm kid-shadow border-2 mb-4"
              >
                ← Change Challenge
              </Button>
            </div>

            <motion.main
              className="container mx-auto px-4 py-4"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={itemVariants} className="text-center mb-12">
                <div className="flex items-center justify-center gap-4 mb-8">
                  <h3 className="text-4xl font-fredoka text-gray-800">
                    {currentActivity.question}
                  </h3>
                  <Button
                    onClick={() => speak(currentActivity.question, { rate: 0.8, pitch: 1.1 })}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl p-3 touch-friendly"
                    size="sm"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M9 5l6 7-6 7z" />
                    </svg>
                  </Button>
                </div>

                <Card className="rounded-[2.5rem] p-8 kid-shadow max-w-4xl mx-auto mb-8 theme-card">
                  <div className={`grid gap-4 mb-8 justify-items-center ${activityObjects.length <= 5 ? "grid-cols-5" :
                    activityObjects.length <= 8 ? "grid-cols-4" : "grid-cols-5"
                    }`}>
                    {activityObjects.map((object, index) => (
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

                  {activityType === "addition" && currentActivity.question.includes("+") && (
                    <div className="text-lg font-bold text-gray-600 mb-4">
                      Look at the groups and count them all together!
                    </div>
                  )}
                </Card>

                <div className="grid grid-cols-4 gap-4 max-w-md mx-auto mb-8">
                  {answerOptions.map((option, index) => (
                    <motion.div key={option} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => handleAnswerSelect(option)}
                        disabled={showFeedback}
                        className={`
                          w-full h-full text-4xl font-fredoka py-8 rounded-[2rem] transition-colors touch-friendly kid-shadow border-b-4
                          ${index === 0 ? "bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200" :
                            index === 1 ? "bg-green-100 hover:bg-green-200 text-green-700 border-green-200" :
                              index === 2 ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border-yellow-200" :
                                "bg-red-100 hover:bg-red-200 text-red-700 border-red-200"}
                          ${selectedAnswer === option ? "ring-4 ring-gray-400" : ""}
                        `}
                      >
                        {option}
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {showFeedback && (
                  <div className={`text-2xl font-bold mb-4 transition-opacity duration-300 ${feedback.includes("correct") ? "text-green-600" : "text-yellow-600"
                    }`}>
                    {feedback}
                  </div>
                )}

                {isActivityCompleted && !showFeedback && (
                  <div className="text-center text-green-600 font-bold text-lg mb-4">
                    ✅ Activity completed!
                  </div>
                )}
              </motion.div>

              {selectedAnswer === currentActivity.answer && currentActivityIndex < activities.length - 1 && !showFeedback && (
                <div className="flex flex-col items-center mb-8">
                  {countdown !== null ? (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-turquoise mb-4">
                        Next activity in {countdown}...
                      </div>
                      <div className="w-32 h-32 mx-auto relative">
                        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                          <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="8" fill="none" />
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
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => {
                          setCurrentActivityIndex(currentActivityIndex + 1);
                          setSelectedAnswer(null);
                          setShowFeedback(false);
                        }}
                        className="bg-turquoise border-turquoise/80 text-white px-10 py-6 rounded-[2rem] font-bold text-2xl hover:bg-teal-500 transition-colors touch-friendly kid-shadow animate-pulse"
                      >
                        Next Activity →
                      </Button>
                    </motion.div>
                  )}
                </div>
              )}

              {currentActivityIndex === activities.length - 1 && selectedAnswer === currentActivity.answer && !showFeedback && (
                <motion.div variants={itemVariants} className="text-center mb-8">
                  <div className="text-3xl font-fredoka text-turquoise mb-6">
                    🎉 All activities complete!
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => {
                          setCurrentActivityIndex(0);
                          setSelectedAnswer(null);
                          setShowFeedback(false);
                          setPlaySessionId(id => id + 1);
                        }}
                        className="bg-coral border-coral/80 text-white px-8 py-6 rounded-[2rem] font-bold text-xl hover:bg-red-500 transition-colors touch-friendly kid-shadow"
                      >
                        Try Again
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={backToSetup}
                        className="bg-turquoise border-turquoise/80 text-white px-8 py-6 rounded-[2rem] font-bold text-xl hover:bg-teal-500 transition-colors touch-friendly kid-shadow"
                      >
                        Pick New Challenge
                      </Button>
                    </motion.div>
                    <Link href="/">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button className="bg-gray-100 text-gray-700 px-8 py-6 rounded-[2rem] font-bold text-xl hover:bg-gray-200 transition-colors touch-friendly kid-shadow w-full">
                          Back to Home
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </motion.div>
              )}
            </motion.main>
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
          <KidPageHeader title="Math" emoji="🔢" stars={setupStars} helpText={HELP_MATH_SETUP} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-6 kid-shadow max-w-4xl mx-auto mt-6 mb-6"
          >
            <h3 className="text-xl font-fredoka text-gray-800 mb-4 text-center">Choose Your Challenge</h3>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <Button
                onClick={() => {
                  setActivityType("counting");
                  setCurrentLevel(1);
                  resetPlayState();
                  queryClient.invalidateQueries({ queryKey: ["/api/math/activities"] });
                }}
                className={`py-6 rounded-2xl font-bold text-lg transition-colors touch-friendly ${activityType === "counting"
                  ? "bg-turquoise text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                🔢 Counting
              </Button>
              <Button
                onClick={() => {
                  setActivityType("addition");
                  setCurrentLevel(3);
                  resetPlayState();
                  queryClient.invalidateQueries({ queryKey: ["/api/math/activities"] });
                }}
                className={`py-6 rounded-2xl font-bold text-lg transition-colors touch-friendly ${activityType === "addition"
                  ? "bg-turquoise text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                ➕ Addition
              </Button>
              <Button
                onClick={() => {
                  setActivityType("subtraction");
                  setCurrentLevel(1);
                  resetPlayState();
                  queryClient.invalidateQueries({ queryKey: ["/api/math/activities"] });
                }}
                className={`py-6 rounded-2xl font-bold text-lg transition-colors touch-friendly ${activityType === "subtraction"
                  ? "bg-turquoise text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                ➖ Subtraction
              </Button>
              <Button
                onClick={() => {
                  setActivityType("mixed");
                  setCurrentLevel(1);
                  resetPlayState();
                  queryClient.invalidateQueries({ queryKey: ["/api/math/activities"] });
                }}
                className={`py-6 rounded-2xl font-bold text-lg transition-colors touch-friendly ${activityType === "mixed"
                  ? "bg-turquoise text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                🔀 Mixed
              </Button>
              <Button
                onClick={() => {
                  setActivityType("shapes");
                  setCurrentLevel(1);
                  resetPlayState();
                  queryClient.invalidateQueries({ queryKey: ["/api/math/activities"] });
                }}
                className={`py-6 rounded-2xl font-bold text-lg transition-colors touch-friendly ${activityType === "shapes"
                  ? "bg-turquoise text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                🔺 Shapes
              </Button>
              <Button
                onClick={() => {
                  setActivityType("story");
                  setCurrentLevel(1);
                  resetPlayState();
                  queryClient.invalidateQueries({ queryKey: ["/api/math/activities"] });
                }}
                className={`py-6 rounded-2xl font-bold text-lg transition-colors touch-friendly ${activityType === "story"
                  ? "bg-turquoise text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                📖 Story
              </Button>
              <Button
                onClick={() => {
                  setActivityType("place_value");
                  setCurrentLevel(1);
                  resetPlayState();
                  queryClient.invalidateQueries({ queryKey: ["/api/math/activities"] });
                }}
                className={`py-6 rounded-2xl font-bold text-lg transition-colors touch-friendly ${activityType === "place_value"
                  ? "bg-turquoise text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                1️⃣0️⃣ Place Value
              </Button>
              <Button
                onClick={() => {
                  setActivityType("geometry");
                  setCurrentLevel(1);
                  resetPlayState();
                  queryClient.invalidateQueries({ queryKey: ["/api/math/activities"] });
                }}
                className={`py-6 rounded-2xl font-bold text-lg transition-colors touch-friendly ${activityType === "geometry"
                  ? "bg-turquoise text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                🧊 Geometry
              </Button>
              <Button
                onClick={() => {
                  setActivityType("measurement");
                  setCurrentLevel(1);
                  resetPlayState();
                  queryClient.invalidateQueries({ queryKey: ["/api/math/activities"] });
                }}
                className={`py-6 rounded-2xl font-bold text-lg transition-colors touch-friendly ${activityType === "measurement"
                  ? "bg-turquoise text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                📏 Measurement
              </Button>
            </div>

            <div className="text-center">
              <h4 className="text-lg font-bold text-gray-700 mb-3">Level</h4>
              <div className={`grid gap-3 max-w-md mx-auto ${
                activityType === "addition" ? "grid-cols-3" : 
                activityType === "subtraction" ? "grid-cols-3" : 
                activityType === "mixed" ? "grid-cols-2" : 
                activityType === "shapes" ? "grid-cols-2" : 
                activityType === "story" ? "grid-cols-2" : 
                activityType === "place_value" ? "grid-cols-2" : 
                activityType === "geometry" ? "grid-cols-2" : 
                activityType === "measurement" ? "grid-cols-2" : "grid-cols-3"
              }`}>
                {(activityType === "counting" ? [1, 2, 3] : 
                  activityType === "addition" ? [3, 4, 5, 6, 7, 8] : 
                  activityType === "subtraction" ? [1, 2, 3, 4, 5] : 
                  activityType === "shapes" ? [1, 2, 3, 4] : 
                  activityType === "story" ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : 
                  activityType === "place_value" ? [1, 2] : 
                  activityType === "geometry" ? [1, 2] : 
                  activityType === "measurement" ? [1, 2] : [1, 2, 3, 4]
                ).map((level) => (
                  <Button
                    key={level}
                    onClick={() => {
                      setCurrentLevel(level);
                      resetPlayState();
                      queryClient.invalidateQueries({ queryKey: ["/api/math/activities"] });
                    }}
                    className={`py-4 rounded-2xl font-bold text-lg transition-colors touch-friendly ${currentLevel === level
                      ? "bg-coral text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    Level {level}
                  </Button>
                ))}
              </div>
              <div className="mt-3 text-center text-sm text-gray-600">
                {activityType === "counting" ? (
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <span>Count 1-5</span>
                    <span>Count 6-10</span>
                    <span>Count 11-15</span>
                  </div>
                ) : activityType === "addition" ? (
                  <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                    <span>Level 3</span>
                    <span>Level 4</span>
                    <span>Level 5</span>
                    <span>Level 6</span>
                    <span>Level 7</span>
                    <span>Level 8</span>
                  </div>
                ) : activityType === "subtraction" ? (
                  <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                    <span>Level 1</span>
                    <span>Level 2</span>
                    <span>Level 3</span>
                    <span>Level 4</span>
                    <span>Level 5</span>
                    <span></span>
                  </div>
                ) : activityType === "shapes" ? (
                  <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                    <span>Level 1</span>
                    <span>Level 2</span>
                    <span>Level 3</span>
                    <span>Level 4</span>
                  </div>
                ) : activityType === "story" ? (
                  <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                    <span>Kindie (1-5)</span>
                    <span>1st Gr (6-10)</span>
                  </div>
                ) : activityType === "place_value" || activityType === "geometry" || activityType === "measurement" ? (
                  <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                    <span>Level 1</span>
                    <span>Level 2</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                    <span>Level 1</span>
                    <span>Level 2</span>
                    <span>Level 3</span>
                    <span>Level 4</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <div className="container mx-auto px-4 max-w-md">
            <KidBigAction
              emoji="🚀"
              label="Start"
              onClick={startChallenge}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
