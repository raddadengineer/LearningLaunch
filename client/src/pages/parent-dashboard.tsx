import { useQuery } from "@tanstack/react-query";
import { User, UserProgress, Achievement } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function ParentDashboard() {
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
        <div className="text-2xl font-fredoka text-gray-800">Loading dashboard...</div>
      </div>
    );
  }

  const readingProgress = progress?.filter(p => p.activityType === "reading") || [];
  const mathProgress = progress?.filter(p => p.activityType === "math") || [];

  // Calculate real weekly activity data based on user progress
  const calculateWeeklyActivity = () => {
    const today = new Date();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const colors = ['bg-red-400', 'bg-green-400', 'bg-blue-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400', 'bg-indigo-400'];
    
    // Start from Monday of current week
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const dayName = weekDays[(day.getDay())];
      
      // Calculate activity minutes based on progress data for this day
      const dayProgress = progress?.filter(p => {
        if (!p.updatedAt) return false;
        const progressDate = new Date(p.updatedAt);
        return progressDate.toDateString() === day.toDateString();
      }) || [];
      
      // Estimate minutes based on completed items (roughly 2-3 minutes per completed item)
      const totalItems = dayProgress.reduce((sum, p) => {
        const completedCount = Array.isArray(p.completedItems) ? p.completedItems.length : 0;
        return sum + completedCount;
      }, 0);
      
      const minutes = Math.min(60, totalItems * 2.5); // Cap at 60 minutes per day
      
      return {
        day: dayName,
        minutes,
        color: minutes > 0 ? colors[i % colors.length] : 'bg-gray-200'
      };
    });
  };

  // Calculate total session time
  const calculateTotalSessionTime = () => {
    if (!progress) return 0;
    const totalCompleted = progress.reduce((sum, p) => {
      const count = Array.isArray(p.completedItems) ? p.completedItems.length : 0;
      return sum + count;
    }, 0);
    return Math.round(totalCompleted * 2.5); // 2.5 minutes per activity
  };

  const weeklyActivity = calculateWeeklyActivity();
  const maxMinutes = Math.max(10, ...weeklyActivity.map(d => d.minutes)); // Minimum 10 for scale

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white kid-shadow">
        <h2 className="text-3xl font-fredoka text-gray-800">Parent Dashboard</h2>
        <Link href="/">
          <Button variant="outline" size="sm" className="rounded-full touch-friendly">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </Link>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* User Info */}
        <Card className="rounded-3xl p-6 kid-shadow mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-coral rounded-full flex items-center justify-center text-3xl">
              👧
            </div>
            <div>
              <h3 className="text-2xl font-fredoka text-gray-800">{user?.name}</h3>
              <p className="text-gray-600">Age: {user?.age} years old</p>
              <p className="text-gray-600">Total Stars: ⭐ {user?.totalStars}</p>
            </div>
          </div>
        </Card>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="rounded-3xl p-6 kid-shadow">
            <h3 className="text-xl font-bold text-coral mb-4">Reading Progress</h3>
            <div className="space-y-4">
              {readingProgress.map((progress) => (
                <div key={progress.id}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold">Level {progress.level} Words</span>
                    <span className="text-sm text-gray-600">
                      {progress.completedItems.length}/{progress.totalItems}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-coral h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${(progress.completedItems.length / progress.totalItems) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {readingProgress.length === 0 && (
                <p className="text-gray-500">No reading progress yet</p>
              )}
            </div>
          </Card>

          <Card className="rounded-3xl p-6 kid-shadow">
            <h3 className="text-xl font-bold text-turquoise mb-4">Math Progress</h3>
            <div className="space-y-4">
              {mathProgress.map((progress) => (
                <div key={progress.id}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold">
                      {progress.activityType === "math" ? "Counting & Addition" : progress.activityType}
                    </span>
                    <span className="text-sm text-gray-600">
                      {progress.completedItems.length}/{progress.totalItems}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-turquoise h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${(progress.completedItems.length / progress.totalItems) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {mathProgress.length === 0 && (
                <p className="text-gray-500">No math progress yet</p>
              )}
            </div>
          </Card>
        </div>

        {/* Time Spent This Week */}
        <Card className="rounded-3xl p-6 kid-shadow mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">This Week's Activity</h3>
          <div className="grid grid-cols-7 gap-2">
            {weeklyActivity.map((day) => (
              <div key={day.day} className="text-center">
                <div className="text-xs font-semibold text-gray-600 mb-2">{day.day}</div>
                <div 
                  className={`${day.color} rounded-lg flex items-end justify-center relative`}
                  style={{ height: `${Math.max(24, (day.minutes / maxMinutes) * 80)}px` }}
                >
                  {day.minutes > 0 && (
                    <span className="text-xs text-white font-bold pb-1">{day.minutes}m</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Total this week: {weeklyActivity.reduce((sum, day) => sum + day.minutes, 0)} minutes
          </div>
          <div className="mt-2 text-center text-xs text-gray-500">
            Based on completed activities and estimated engagement time
          </div>
        </Card>

        {/* Achievements */}
        <Card className="rounded-3xl p-6 kid-shadow mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements?.map((achievement) => (
              <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <div className="font-bold text-gray-800">{achievement.title}</div>
                  <div className="text-sm text-gray-600">{achievement.description}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(achievement.earnedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/reading">
            <Button className="w-full bg-coral text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-500 transition-colors">
              Start Reading Session
            </Button>
          </Link>
          <Link href="/math">
            <Button className="w-full bg-turquoise text-white py-4 rounded-2xl font-bold text-lg hover:bg-teal-500 transition-colors">
              Start Math Session
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full py-4 rounded-2xl font-bold text-lg">
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
