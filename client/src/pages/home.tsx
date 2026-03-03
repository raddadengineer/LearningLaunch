import { useQuery } from "@tanstack/react-query";
import { User, UserProgress, Achievement } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { speak } from "@/lib/speech";

export default function Home() {
  const currentUserId = localStorage.getItem("currentUserId");
  const [, setLocation] = useLocation();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user", currentUserId],
    queryFn: () => currentUserId ? fetch(`/api/user/${currentUserId}`).then(res => res.json()) : null,
    enabled: !!currentUserId,
  });

  const { data: progress, isLoading: progressLoading } = useQuery<UserProgress[]>({
    queryKey: ["/api/user/progress", currentUserId],
    queryFn: () => currentUserId ? fetch(`/api/user/${currentUserId}/progress`).then(res => res.json()) : [],
    enabled: !!currentUserId,
  });

  const { data: achievements, isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/user/achievements", currentUserId],
    queryFn: () => currentUserId ? fetch(`/api/user/${currentUserId}/achievements`).then(res => res.json()) : [],
    enabled: !!currentUserId,
  });

  if (userLoading || progressLoading || achievementsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-fredoka text-coral">Loading...</div>
      </div>
    );
  }

  if (!user) {
    // Show error and redirect after a few seconds
    setTimeout(() => {
      window.location.href = "/select-user";
    }, 3000);

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coral via-turquoise to-sunnyellow">
        <Card className="p-8 max-w-md mx-auto rounded-3xl kid-shadow">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-fredoka text-gray-800 mb-4">User not found</h2>
            <p className="text-gray-600 mb-6 font-bold">Please select a user first.</p>
            <p className="text-sm text-gray-500 mb-4 font-bold">Redirecting in 3 seconds...</p>
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

  const readingProgress = progress?.find(p => p.activityType === "reading");
  const mathProgress = progress?.find(p => p.activityType === "math");

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="bg-white kid-shadow sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-3 cursor-pointer">
                <div className="w-12 h-12 bg-coral rounded-[1rem] flex items-center justify-center text-2xl kid-shadow">
                  🦉
                </div>
                <h1 className="text-3xl font-fredoka text-coral">KidLearn</h1>
              </motion.div>
            </Link>

            <div className="flex items-center space-x-4">
              <motion.div
                className="bg-sunnyellow px-4 py-2 rounded-2xl kid-shadow"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <span className="text-lg font-bold text-gray-800">⭐ {user?.totalStars || 0}</span>
              </motion.div>
              <Link href="/parent-dashboard">
                <Button variant="outline" size="sm" className="rounded-2xl touch-friendly kid-shadow border-gray-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <motion.main
        className="container mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Welcome Section */}
        <motion.section variants={itemVariants} className="text-center mb-12">
          <h2 className="text-5xl font-fredoka text-gray-800 mb-4">
            Hi <span className="text-coral">{user?.name || "Emma"}</span>! 🌟
          </h2>
          <p className="text-2xl font-bold text-gray-600 mb-6">Ready to learn something amazing today?</p>

          {/* Daily Progress */}
          <Card className="rounded-[2.5rem] p-6 kid-shadow max-w-md mx-auto bg-white/90 backdrop-blur">
            <h3 className="text-xl font-bold text-gray-700 mb-4">Today's Progress</h3>

            {readingProgress && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-md font-bold text-gray-600">Reading</span>
                  <span className="text-md font-bold text-coral">{readingProgress.stars}/5 ⭐</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 kid-shadow overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(readingProgress.completedItems.length / readingProgress.totalItems) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-coral h-full rounded-full"
                  />
                </div>
              </div>
            )}

            {mathProgress && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-md font-bold text-gray-600">Math</span>
                  <span className="text-md font-bold text-turquoise">{mathProgress.stars}/5 ⭐</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 kid-shadow overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(mathProgress.completedItems.length / mathProgress.totalItems) * 100}%` }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="bg-turquoise h-full rounded-full"
                  />
                </div>
              </div>
            )}
          </Card>
        </motion.section>

        {/* Activity Selection */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Reading Section */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-[2.5rem] p-8 kid-shadow h-full flex flex-col justify-between">
              <div className="text-center">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                  alt="Colorful alphabet blocks"
                  className="w-full h-48 object-cover rounded-[2rem] mb-6 kid-shadow"
                />

                <div className="flex items-center justify-center mb-4">
                  <motion.div animate={{ rotate: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <svg className="w-12 h-12 text-coral mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </motion.div>
                  <h3
                    className="text-4xl font-fredoka text-coral"
                    onMouseEnter={() => speak("Reading", { rate: 0.9, pitch: 1.2 })}
                  >Reading</h3>
                </div>

                <p className="text-xl font-bold text-gray-600 mb-6">Learn to read with fun words and sounds!</p>

                {/* Reading Levels */}
                <div className="grid grid-cols-6 gap-2 mb-8">
                  <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.9 }}>
                    <div className="bg-green-100 rounded-2xl p-2 text-center cursor-pointer kid-shadow hover:bg-green-200 transition-colors"
                      onClick={() => { localStorage.setItem("selectedReadingLevel", "1"); setLocation("/reading"); }}>
                      <div className="text-2xl mb-1">🌱</div>
                      <span className="text-xs font-bold text-green-700">Lvl 1</span>
                    </div>
                  </motion.div>
                  <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.9 }}>
                    <div className="bg-blue-100 rounded-2xl p-2 text-center cursor-pointer kid-shadow hover:bg-blue-200 transition-colors"
                      onClick={() => { localStorage.setItem("selectedReadingLevel", "2"); setLocation("/reading"); }}>
                      <div className="text-2xl mb-1">🌿</div>
                      <span className="text-xs font-bold text-blue-700">Lvl 2</span>
                    </div>
                  </motion.div>
                  <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.9 }}>
                    <div className="bg-yellow-100 rounded-2xl p-2 text-center cursor-pointer kid-shadow hover:bg-yellow-200 transition-colors"
                      onClick={() => { localStorage.setItem("selectedReadingLevel", "3"); setLocation("/reading"); }}>
                      <div className="text-2xl mb-1">🌳</div>
                      <span className="text-xs font-bold text-yellow-700">Lvl 3</span>
                    </div>
                  </motion.div>
                  <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.9 }}>
                    <div className="bg-purple-100 rounded-2xl p-2 text-center cursor-pointer kid-shadow hover:bg-purple-200 transition-colors"
                      onClick={() => { localStorage.setItem("selectedReadingLevel", "4"); setLocation("/reading"); }}>
                      <div className="text-2xl mb-1">🌲</div>
                      <span className="text-xs font-bold text-purple-700">Lvl 4</span>
                    </div>
                  </motion.div>
                  <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.9 }}>
                    <div className="bg-red-100 rounded-2xl p-2 text-center cursor-pointer kid-shadow hover:bg-red-200 transition-colors"
                      onClick={() => { localStorage.setItem("selectedReadingLevel", "5"); setLocation("/reading"); }}>
                      <div className="text-2xl mb-1">🎯</div>
                      <span className="text-xs font-bold text-red-700">Lvl 5</span>
                    </div>
                  </motion.div>
                  <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.9 }}>
                    <div className="bg-indigo-100 rounded-2xl p-2 text-center cursor-pointer kid-shadow hover:bg-indigo-200 transition-colors"
                      onClick={() => { localStorage.setItem("selectedReadingLevel", "6"); setLocation("/reading"); }}>
                      <div className="text-2xl mb-1">📖</div>
                      <span className="text-xs font-bold text-indigo-700">Lvl 6</span>
                    </div>
                  </motion.div>
                </div>

                <Link href="/reading">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={() => speak("Start Reading!", { rate: 0.9, pitch: 1.2 })}
                  >
                    <Button className="w-full bg-coral border-coral/80 text-white text-2xl font-fredoka py-6 rounded-[2rem] kid-shadow hover:bg-red-500 touch-friendly cursor-pointer">
                      Start Reading! 📚
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </Card>
          </motion.div>

          {/* Math Section */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-[2.5rem] p-8 kid-shadow h-full flex flex-col justify-between">
              <div className="text-center">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  src="https://images.unsplash.com/photo-1509909756405-be0199881695?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                  alt="Colorful counting toys and numbers"
                  className="w-full h-48 object-cover rounded-[2rem] mb-6 kid-shadow"
                />

                <div className="flex items-center justify-center mb-4">
                  <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}>
                    <svg className="w-12 h-12 text-turquoise mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </motion.div>
                  <h3
                    className="text-4xl font-fredoka text-turquoise"
                    onMouseEnter={() => speak("Math", { rate: 0.9, pitch: 1.2 })}
                  >Math</h3>
                </div>

                <p className="text-xl font-bold text-gray-600 mb-6">Count, add and have fun with numbers!</p>

                {/* Math Activities */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <motion.div whileHover={{ y: -5 }}>
                    <div className="bg-blue-100 rounded-[2rem] p-4 text-center kid-shadow">
                      <div className="text-4xl mb-2">🔢</div>
                      <span className="text-md font-bold text-blue-700">Counting</span>
                    </div>
                  </motion.div>
                  <motion.div whileHover={{ y: -5 }}>
                    <div className="bg-purple-100 rounded-[2rem] p-4 text-center kid-shadow">
                      <div className="text-4xl mb-2">➕</div>
                      <span className="text-md font-bold text-purple-700">Adding</span>
                    </div>
                  </motion.div>
                </div>

                <Link href="/math">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={() => speak("Start Counting!", { rate: 0.9, pitch: 1.2 })}
                  >
                    <Button className="w-full bg-turquoise border-turquoise/80 text-white text-2xl font-fredoka py-6 rounded-[2rem] kid-shadow hover:bg-teal-500 touch-friendly cursor-pointer">
                      Start Counting! 🔢
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </Card>
          </motion.div>
        </section>

        {/* Recent Achievements */}
        <motion.section variants={itemVariants} className="bg-white/90 backdrop-blur rounded-[2.5rem] p-8 kid-shadow mb-8">
          <h3 className="text-3xl font-fredoka text-gray-800 mb-6 text-center">🏆 Recent Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements?.slice(0, 4).map((achievement, index) => (
              <motion.div
                key={achievement.id}
                className="text-center p-6 bg-yellow-50 rounded-[2rem] kid-shadow"
                whileHover={{ scale: 1.1, rotate: index % 2 === 0 ? 5 : -5 }}
                transition={{ type: "spring", bounce: 0.5 }}
              >
                <div className="text-5xl mb-3">{achievement.icon}</div>
                <span className="text-md font-bold text-yellow-700">{achievement.title}</span>
              </motion.div>
            ))}
            {(!achievements || achievements.length === 0) && (
              <div className="col-span-4 text-center py-8">
                <p className="text-xl font-bold text-gray-500">Play some games to earn achievements!</p>
              </div>
            )}
          </div>
        </motion.section>
      </motion.main>
    </div>
  );
}
