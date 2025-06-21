import { useQuery } from "@tanstack/react-query";
import { User, UserProgress, Achievement } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function ParentDashboard() {
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user/1"],
  });

  const { data: progress, isLoading: progressLoading } = useQuery<UserProgress[]>({
    queryKey: ["/api/user/1/progress"],
  });

  const { data: achievements, isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/user/1/achievements"],
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

  // Mock weekly activity data
  const weeklyActivity = [
    { day: "Mon", minutes: 25, color: "bg-green-400" },
    { day: "Tue", minutes: 18, color: "bg-blue-400" },
    { day: "Wed", minutes: 32, color: "bg-yellow-400" },
    { day: "Thu", minutes: 12, color: "bg-purple-400" },
    { day: "Fri", minutes: 22, color: "bg-red-400" },
    { day: "Sat", minutes: 8, color: "bg-gray-300" },
    { day: "Sun", minutes: 0, color: "bg-gray-200" },
  ];

  const maxMinutes = Math.max(...weeklyActivity.map(d => d.minutes));

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
