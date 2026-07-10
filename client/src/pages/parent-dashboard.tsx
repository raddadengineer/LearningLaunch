import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { User, UserProgress, Achievement, ReadingBookSummary } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";

function StatCard({
  label,
  value,
  icon,
  gradient,
}: {
  label: string;
  value: string | number;
  icon: string;
  gradient: string;
}) {
  return (
    <div className={`rounded-2xl p-4 bg-gradient-to-br ${gradient} text-white shadow-md`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-fredoka font-bold leading-none">{value}</div>
      <div className="text-xs font-bold opacity-80 mt-0.5">{label}</div>
    </div>
  );
}

function ProgressRow({
  label,
  completed,
  total,
  barColor,
  stars,
  updatedAt,
}: {
  label: string;
  completed: number;
  total: number;
  barColor: string;
  stars: number;
  updatedAt?: string | null;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-500 font-bold">⭐ {stars}</span>
          <span className="text-xs text-gray-400 font-bold">{completed}/{total}</span>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <motion.div
          className={`${barColor} h-3 rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
      {updatedAt && (
        <p className="text-xs text-gray-400">{new Date(updatedAt).toLocaleDateString()}</p>
      )}
    </div>
  );
}

export default function ParentDashboard() {
  const currentUserId = localStorage.getItem("currentUserId");

  useEffect(() => {
    if (!currentUserId) {
      const t = setTimeout(() => { window.location.href = "/select-user"; }, 3000);
      return () => clearTimeout(t);
    }
  }, [currentUserId]);

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user", currentUserId],
    queryFn: () => fetch(`/api/user/${currentUserId}`).then(res => res.json()),
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

  const { data: books } = useQuery<ReadingBookSummary[]>({
    queryKey: ["/api/books"],
    queryFn: () => fetch("/api/books").then(res => res.json()),
    enabled: !!currentUserId,
  });

  if (!currentUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 via-blue-50 to-pink-100">
        <div className="bg-white rounded-3xl p-8 max-w-sm mx-auto shadow-xl text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-fredoka text-gray-800 mb-3">No user selected</h2>
          <p className="text-gray-500 mb-5">Please select a user first.</p>
          <Link href="/select-user">
            <Button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-bold">
              Select User
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (userLoading || progressLoading || achievementsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
          className="text-5xl"
        >
          🦉
        </motion.div>
      </div>
    );
  }

  const readingProgress = progress?.filter(p => p.activityType === "reading") || [];
  const mathProgress = progress?.filter(p => p.activityType === "math") || [];
  const booksProgress = progress?.filter(p => p.activityType === "books") || [];
  const sightWordsProgress = progress?.filter(p => p.activityType === "sight-words") || [];

  const completeReadingProgress = Array.from({ length: 6 }, (_, i) => {
    const level = i + 1;
    const existing = readingProgress.find(p => p.level === level);
    return existing || { id: `reading-${level}`, level, activityType: "reading", completedItems: [], totalItems: level === 6 ? 24 : 30, stars: 0, updatedAt: null };
  });

  const completeMathProgress = Array.from({ length: 6 }, (_, i) => {
    const level = i + 1;
    const existing = mathProgress.find(p => p.level === level);
    return existing || { id: `math-${level}`, level, activityType: "math", completedItems: [], totalItems: 5, stars: 0, updatedAt: null };
  });

  const calculateWeeklyActivity = () => {
    const today = new Date();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const dayName = weekDays[day.getDay()];
      const dayProgress = progress?.filter(p => {
        if (!p.updatedAt) return false;
        return new Date(p.updatedAt).toDateString() === day.toDateString();
      }) || [];
      const totalItems = dayProgress.reduce((sum, p) => {
        const count = Array.isArray(p.completedItems) ? p.completedItems.length : 0;
        return sum + count;
      }, 0);
      return { day: dayName, minutes: Math.min(60, totalItems * 2.5), isToday: day.toDateString() === today.toDateString() };
    });
  };

  const calculateTotalSessionTime = () => {
    if (!progress) return 0;
    const total = progress.reduce((sum, p) => {
      const count = Array.isArray(p.completedItems) ? p.completedItems.length : 0;
      return sum + count;
    }, 0);
    return Math.round(total * 2.5);
  };

  const weeklyActivity = calculateWeeklyActivity();
  const maxMinutes = Math.max(10, ...weeklyActivity.map(d => d.minutes));
  const totalSessionTime = calculateTotalSessionTime();
  const totalWeekMinutes = weeklyActivity.reduce((sum, d) => sum + d.minutes, 0);

  const BAR_COLORS = [
    "bg-gradient-to-t from-red-400 to-red-500",
    "bg-gradient-to-t from-emerald-400 to-emerald-500",
    "bg-gradient-to-t from-blue-400 to-blue-500",
    "bg-gradient-to-t from-yellow-400 to-amber-500",
    "bg-gradient-to-t from-violet-400 to-purple-500",
    "bg-gradient-to-t from-pink-400 to-rose-500",
    "bg-gradient-to-t from-indigo-400 to-indigo-500",
  ];

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-slate-50 via-violet-50 to-blue-50">
      {/* ── Header ── */}
      <div className="glass-header px-5 py-4 flex items-center justify-between sticky top-0 z-50">
        <div>
          <h2 className="text-2xl font-fredoka gradient-text-purple">Parent Dashboard</h2>
          <p className="text-xs text-gray-400 font-bold">{user?.name}'s progress</p>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm" className="rounded-full w-10 h-10 p-0 border-2 bg-white/70 hover:bg-white">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </Link>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">

        {/* ── User profile card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-5 kid-shadow flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coral to-peach flex items-center justify-center text-3xl shadow-md">
              👧
            </div>
            <div>
              <h3 className="text-2xl font-fredoka text-gray-800">{user?.name}</h3>
              <p className="text-sm text-gray-500">Age {user?.age} years old</p>
              {user?.lastActive && (
                <p className="text-xs text-gray-400">Last active: {new Date(user.lastActive).toLocaleDateString()}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-fredoka font-bold gradient-text-ocean">{totalSessionTime}m</div>
            <div className="text-xs text-gray-500 font-bold">Total Learning</div>
          </div>
        </motion.div>

        {/* ── Stat summary row ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid grid-cols-3 gap-3"
        >
          <StatCard label="Total Stars" value={`⭐ ${user?.totalStars ?? 0}`} icon="🏆" gradient="from-yellow-400 to-amber-500" />
          <StatCard label="This Week" value={`${Math.round(totalWeekMinutes)}m`} icon="📅" gradient="from-violet-500 to-purple-600" />
          <StatCard label="Achievements" value={achievements?.length ?? 0} icon="🎖️" gradient="from-emerald-400 to-teal-500" />
        </motion.div>

        {/* ── Progress Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Reading */}
          <div className="bg-white rounded-3xl p-5 kid-shadow">
            <h3 className="text-lg font-fredoka font-bold text-coral mb-4 flex items-center gap-2">
              🔤 Reading Progress
            </h3>
            <div className="space-y-4">
              {completeReadingProgress.map((prog) => (
                <ProgressRow
                  key={prog.id}
                  label={`Level ${prog.level} ${prog.level === 6 ? "Sentences" : "Words"}`}
                  completed={Array.isArray(prog.completedItems) ? prog.completedItems.length : 0}
                  total={prog.totalItems}
                  barColor="bg-gradient-to-r from-red-400 to-orange-400"
                  stars={prog.stars}
                  updatedAt={prog.updatedAt ? String(prog.updatedAt) : null}
                />
              ))}
              <p className="text-xs text-gray-400 text-center pt-1">Levels 1–5: Words • Level 6: Sentences</p>
            </div>
          </div>

          {/* Math */}
          <div className="bg-white rounded-3xl p-5 kid-shadow">
            <h3 className="text-lg font-fredoka font-bold text-skyblue mb-4 flex items-center gap-2">
              🔢 Math Progress
            </h3>
            <div className="space-y-4">
              {completeMathProgress.map((prog) => (
                <ProgressRow
                  key={prog.id}
                  label={`Level ${prog.level} – ${prog.level <= 2 ? "Counting" : "Addition"}`}
                  completed={Array.isArray(prog.completedItems) ? prog.completedItems.length : 0}
                  total={prog.totalItems}
                  barColor="bg-gradient-to-r from-sky-400 to-blue-500"
                  stars={prog.stars}
                  updatedAt={prog.updatedAt ? String(prog.updatedAt) : null}
                />
              ))}
              <p className="text-xs text-gray-400 text-center pt-1">Levels 1–2: Counting • Levels 3–6: Addition</p>
            </div>
          </div>

          {/* Sight Words */}
          <div className="bg-white rounded-3xl p-5 kid-shadow">
            <h3 className="text-lg font-fredoka font-bold text-lavender mb-4 flex items-center gap-2">
              👁️ Sight Words
            </h3>
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => {
                const level = i + 1;
                const prog = sightWordsProgress.find(p => p.level === level);
                const completed = Array.isArray(prog?.completedItems) ? prog.completedItems.length : 0;
                const total = prog?.totalItems ?? 12;
                const labels = ["First Words", "Common Words", "More Words"];
                return (
                  <ProgressRow
                    key={level}
                    label={`Level ${level}: ${labels[i]}`}
                    completed={completed}
                    total={total}
                    barColor="bg-gradient-to-r from-violet-400 to-purple-500"
                    stars={prog?.stars ?? 0}
                    updatedAt={prog?.updatedAt ? String(prog.updatedAt) : null}
                  />
                );
              })}
            </div>
          </div>

          {/* Story Books */}
          <div className="bg-white rounded-3xl p-5 kid-shadow">
            <h3 className="text-lg font-fredoka font-bold text-indigo-600 mb-4 flex items-center gap-2">
              📖 Story Books
            </h3>
            <div className="space-y-4">
              {books?.map((book) => {
                const bookProg = booksProgress.find(p => p.level === book.id);
                const completed = Array.isArray(bookProg?.completedItems) ? bookProg.completedItems.length : 0;
                const total = book.pageCount || bookProg?.totalItems || 1;
                return (
                  <ProgressRow
                    key={book.id}
                    label={book.title}
                    completed={completed}
                    total={total}
                    barColor="bg-gradient-to-r from-indigo-400 to-blue-500"
                    stars={bookProg?.stars ?? 0}
                    updatedAt={bookProg?.updatedAt ? String(bookProg.updatedAt) : null}
                  />
                );
              })}
              {(!books || books.length === 0) && (
                <p className="text-sm text-gray-400 text-center">No books available yet.</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Weekly Activity Chart ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-5 kid-shadow"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-fredoka font-bold text-gray-800">📅 This Week's Activity</h3>
            <span className="text-sm font-bold text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
              {Math.round(totalWeekMinutes)} min total
            </span>
          </div>
          <div className="grid grid-cols-7 gap-2 items-end">
            {weeklyActivity.map((day, i) => (
              <div key={day.day} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold text-gray-500">
                  {day.minutes > 0 ? `${Math.round(day.minutes)}m` : ""}
                </span>
                <div className="w-full flex flex-col items-center">
                  <motion.div
                    className={`w-full rounded-xl ${day.minutes > 0 ? BAR_COLORS[i] : "bg-gray-100"} ${day.isToday ? "ring-2 ring-violet-400 ring-offset-1" : ""}`}
                    initial={{ height: 8 }}
                    animate={{ height: Math.max(12, (day.minutes / maxMinutes) * 96) }}
                    transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                  />
                </div>
                <span className={`text-[11px] font-bold ${day.isToday ? "text-violet-600" : "text-gray-400"}`}>
                  {day.day}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">
            Based on completed activities
          </p>
        </motion.div>

        {/* ── Achievements ── */}
        {achievements && achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            className="bg-white rounded-3xl p-5 kid-shadow"
          >
            <h3 className="text-lg font-fredoka font-bold text-gray-800 mb-4">🎖️ Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-100">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-2xl shadow-sm shrink-0">
                    {achievement.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-gray-800 truncate">{achievement.title}</div>
                    <div className="text-xs text-gray-500 truncate">{achievement.description}</div>
                    <div className="text-xs text-amber-400 font-bold">
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Quick Actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <Link href="/parent-settings">
            <Button variant="outline" className="w-full py-4 rounded-2xl font-bold text-base border-2 border-violet-200 text-violet-700 hover:bg-violet-50 bg-white">
              ⚙️ Grown-ups Settings
            </Button>
          </Link>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: "/reading", label: "📖 Reading", gradient: "from-red-400 to-orange-500" },
              { href: "/sight-words", label: "👁️ Sight Words", gradient: "from-violet-500 to-purple-600" },
              { href: "/books", label: "📚 Books", gradient: "from-indigo-400 to-blue-500" },
              { href: "/math", label: "🔢 Math", gradient: "from-teal-400 to-emerald-500" },
            ].map((action) => (
              <Link key={action.href} href={action.href}>
                <Button className={`w-full bg-gradient-to-br ${action.gradient} text-white py-4 rounded-2xl font-bold text-sm shadow-md hover:opacity-90 transition-opacity`}>
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
          <Link href="/">
            <Button variant="outline" className="w-full py-3 rounded-2xl font-bold text-sm bg-white/70 hover:bg-white">
              ← Back to Home
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
