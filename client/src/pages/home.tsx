import { useQuery } from "@tanstack/react-query";
import { User, UserProgress, Achievement } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  const currentUserId = localStorage.getItem("currentUserId");
  
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

  const readingProgress = progress?.find(p => p.activityType === "reading");
  const mathProgress = progress?.find(p => p.activityType === "math");

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="bg-white kid-shadow sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center text-2xl">
                🦉
              </div>
              <h1 className="text-3xl font-fredoka text-coral">FunLearn</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-sunnyellow px-4 py-2 rounded-full">
                <span className="text-lg font-bold text-gray-800">⭐ {user?.totalStars || 0}</span>
              </div>
              <Link href="/parent-dashboard">
                <Button variant="outline" size="sm" className="rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <section className="text-center mb-12">
          <h2 className="text-4xl font-fredoka text-gray-800 mb-4">
            Hi <span className="text-coral">{user?.name || "Emma"}</span>! 🌟
          </h2>
          <p className="text-xl text-gray-600 mb-6">Ready to learn something amazing today?</p>
          
          {/* Daily Progress */}
          <Card className="rounded-3xl p-6 kid-shadow max-w-md mx-auto">
            <h3 className="text-lg font-bold text-gray-700 mb-3">Today's Progress</h3>
            
            {readingProgress && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-600">Reading</span>
                  <span className="text-sm font-bold text-coral">{readingProgress.stars}/5 ⭐</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-coral h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${(readingProgress.completedItems.length / readingProgress.totalItems) * 100}%` }}
                  />
                </div>
              </div>
            )}
            
            {mathProgress && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-600">Math</span>
                  <span className="text-sm font-bold text-turquoise">{mathProgress.stars}/5 ⭐</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-turquoise h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${(mathProgress.completedItems.length / mathProgress.totalItems) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </Card>
        </section>

        {/* Activity Selection */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Reading Section */}
          <Link href="/reading">
            <Card className="rounded-3xl p-8 kid-shadow hover:scale-105 transition-transform cursor-pointer">
              <div className="text-center">
                <img 
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                  alt="Colorful alphabet blocks" 
                  className="w-full h-48 object-cover rounded-2xl mb-6"
                />
                
                <div className="flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-coral mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="text-3xl font-fredoka text-coral">Reading</h3>
                </div>
                
                <p className="text-lg text-gray-600 mb-6">Learn to read with fun words and sounds!</p>
                
                {/* Reading Levels */}
                <div className="grid grid-cols-5 gap-2 mb-6">
                  <div className="bg-green-100 rounded-xl p-2 text-center">
                    <div className="text-lg mb-1">🌱</div>
                    <span className="text-xs font-bold text-green-700">Level 1</span>
                  </div>
                  <div className="bg-blue-100 rounded-xl p-2 text-center">
                    <div className="text-lg mb-1">🌿</div>
                    <span className="text-xs font-bold text-blue-700">Level 2</span>
                  </div>
                  <div className="bg-yellow-100 rounded-xl p-2 text-center">
                    <div className="text-lg mb-1">🌳</div>
                    <span className="text-xs font-bold text-yellow-700">Level 3</span>
                  </div>
                  <div className="bg-purple-100 rounded-xl p-2 text-center">
                    <div className="text-lg mb-1">🌲</div>
                    <span className="text-xs font-bold text-purple-700">Level 4</span>
                  </div>
                  <div className="bg-red-100 rounded-xl p-2 text-center">
                    <div className="text-lg mb-1">🎯</div>
                    <span className="text-xs font-bold text-red-700">Level 5</span>
                  </div>
                </div>
                
                <Button className="w-full bg-coral text-white text-xl font-bold py-4 rounded-2xl hover:bg-red-500 transition-colors touch-friendly">
                  Start Reading! 📚
                </Button>
              </div>
            </Card>
          </Link>

          {/* Math Section */}
          <Link href="/math">
            <Card className="rounded-3xl p-8 kid-shadow hover:scale-105 transition-transform cursor-pointer">
              <div className="text-center">
                <img 
                  src="https://images.unsplash.com/photo-1509909756405-be0199881695?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                  alt="Colorful counting toys and numbers" 
                  className="w-full h-48 object-cover rounded-2xl mb-6"
                />
                
                <div className="flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-turquoise mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-3xl font-fredoka text-turquoise">Math</h3>
                </div>
                
                <p className="text-lg text-gray-600 mb-6">Count, add and have fun with numbers!</p>
                
                {/* Math Activities */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-blue-100 rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">🔢</div>
                    <span className="text-sm font-bold text-blue-700">Counting</span>
                  </div>
                  <div className="bg-purple-100 rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">➕</div>
                    <span className="text-sm font-bold text-purple-700">Adding</span>
                  </div>
                </div>
                
                <Button className="w-full bg-turquoise text-white text-xl font-bold py-4 rounded-2xl hover:bg-teal-500 transition-colors touch-friendly">
                  Start Counting! 🔢
                </Button>
              </div>
            </Card>
          </Link>
        </section>

        {/* Recent Achievements */}
        <section className="bg-white rounded-3xl p-8 kid-shadow mb-8">
          <h3 className="text-2xl font-fredoka text-gray-800 mb-6 text-center">🏆 Recent Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements?.slice(0, 4).map((achievement) => (
              <div key={achievement.id} className="text-center p-4 bg-yellow-50 rounded-2xl">
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <span className="text-sm font-bold text-yellow-700">{achievement.title}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
