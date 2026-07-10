import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { User, UserProgress, Achievement, ReadingBookSummary } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useTheme, getThemeIcon, type Theme, type IconKey } from "@/lib/theme";

function StatCard({
  label,
  value,
  icon,
  theme,
}: {
  label: string;
  value: string | number;
  icon: string;
  theme: Theme;
}) {
  const isSpace = theme === "space";
  const isForest = theme === "forest";

  const cardClass = isSpace
    ? "rounded-2xl p-4 bg-gradient-to-br from-slate-900/60 to-purple-950/40 border border-violet-500/25 text-white shadow-md"
    : isForest
    ? "rounded-2xl p-4 bg-[#FFFBEB] border-3 border-[#D97706] text-[#78350F] shadow-[3px_3px_0_#92400E]"
    : "rounded-2xl p-4 bg-white border-4 border-[#12082E] text-[#12082E] shadow-[4px_4px_0_#12082E] font-bold";

  return (
    <div className={cardClass}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl sm:text-2xl font-fredoka font-bold leading-none">{value}</div>
      <div className="text-[10px] sm:text-xs font-bold opacity-80 mt-1 uppercase tracking-wide">{label}</div>
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
  theme,
}: {
  label: string;
  completed: number;
  total: number;
  barColor: string;
  stars: number;
  updatedAt?: string | null;
  theme: Theme;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isSpace = theme === "space";
  const isForest = theme === "forest";

  const trackClass = isSpace
    ? "w-full bg-slate-900/60 rounded-full h-3 overflow-hidden border border-violet-500/10"
    : isForest
    ? "w-full bg-[#EFE5C9] rounded-full h-3.5 overflow-hidden border border-[#D97706]/10"
    : "w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border-2 border-[#12082E]";

  const textPrimary = isSpace ? "text-white" : isForest ? "text-[#78350F]" : "text-gray-700";
  const textMuted = isSpace ? "text-violet-300" : isForest ? "text-[#78350F]/70" : "text-gray-500";

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs sm:text-sm font-semibold truncate pr-2 max-w-[65%]">{label}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-amber-500 font-bold">⭐ {stars}</span>
          <span className={`text-[11px] sm:text-xs ${textMuted} font-bold`}>{completed}/{total}</span>
        </div>
      </div>
      <div className={trackClass}>
        <motion.div
          className={`${barColor} h-full rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
      {updatedAt && (
        <p className="text-[10px] opacity-50">{new Date(updatedAt).toLocaleDateString()}</p>
      )}
    </div>
  );
}

export default function ParentDashboard() {
  const currentUserId = localStorage.getItem("currentUserId");
  const { theme } = useTheme();

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

  const isSpace = theme === "space";
  const isForest = theme === "forest";
  const isArcade = theme === "arcade";

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
      <div className="min-h-screen flex items-center justify-center theme-page">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
          className="text-6xl"
        >
          {getThemeIcon(theme, "gate")}
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

  // Theme-aware color styles
  const titleClass = isSpace
    ? "text-xl sm:text-2xl font-fredoka text-violet-300"
    : isForest
    ? "text-xl sm:text-2xl font-fredoka text-[#78350F]"
    : "text-xl sm:text-2xl font-fredoka text-[#12082E]";

  const subtitleClass = isSpace
    ? "text-[10px] sm:text-xs text-violet-400 font-bold"
    : isForest
    ? "text-[10px] sm:text-xs text-[#78350F]/70 font-bold"
    : "text-[10px] sm:text-xs text-[#12082E]/70 font-bold";

  const cardClass = "theme-card border-0 overflow-hidden shadow-lg p-5 sm:p-6";

  const textPrimary = isSpace ? "text-white" : isForest ? "text-[#78350F]" : "text-gray-800";
  const textMuted = isSpace ? "text-violet-300" : isForest ? "text-[#78350F]/80" : "text-gray-500";

  // Weekly activity specific styles
  const chartEmptyColClass = isSpace
    ? "bg-slate-900/60 border border-violet-500/10"
    : isForest
    ? "bg-[#EFE5C9]"
    : "bg-slate-100 border-2 border-[#12082E]";

  const chartTodayRing = isSpace
    ? "ring-2 ring-violet-400 ring-offset-1 ring-offset-slate-950"
    : isForest
    ? "ring-3 ring-[#D97706] ring-offset-1 ring-offset-[#FFFBEB]"
    : "ring-4 ring-[#FFE600] ring-offset-2 ring-offset-white";

  // Achievements plaque styling
  const achievementItemClass = isSpace
    ? "flex items-center gap-3 p-3 bg-slate-950/40 border border-violet-500/15 rounded-2xl"
    : isForest
    ? "flex items-center gap-3 p-3 bg-[#FEF9E7] border-2 border-[#D97706]/20 rounded-2xl text-[#78350F]"
    : "flex items-center gap-3 p-3 bg-[#F8F9FA] border-2 border-[#12082E] rounded-2xl text-[#12082E]";

  // Buttons styling
  const settingsBtnClass = isSpace
    ? "w-full py-4 rounded-2xl border border-violet-500/40 text-violet-300 hover:bg-violet-950/40 bg-transparent font-bold"
    : isForest
    ? "w-full py-4 rounded-2xl border-3 border-[#D97706] bg-[#FFFBEB] text-[#78350F] hover:bg-[#FEF3C7] shadow-[2px_2px_0_#92400E] font-bold"
    : "w-full py-4 rounded-2xl border-4 border-[#12082E] bg-white text-[#12082E] hover:bg-slate-100 shadow-[4px_4px_0_#12082E] font-bold";

  const backHomeBtnClass = isSpace
    ? "w-full py-3 rounded-2xl border border-violet-500/20 text-violet-400 bg-transparent hover:bg-slate-900/40 font-bold"
    : isForest
    ? "w-full py-3 rounded-2xl border-2 border-[#D97706]/40 text-[#78350F] hover:bg-[#FEF3C7] bg-[#FFFBEB] font-bold"
    : "w-full py-3 rounded-2xl border-4 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-bold shadow-[2px_2px_0_rgba(0,0,0,0.1)]";

  const actionGridItemClass = (gradient: string) => {
    return isSpace
      ? `w-full bg-gradient-to-br ${gradient} text-white py-4 rounded-2xl font-bold text-sm shadow-md hover:opacity-90 transition-opacity`
      : isForest
      ? `w-full bg-gradient-to-br ${gradient} text-white py-4 rounded-2xl font-bold text-sm border-2 border-[#D97706]/35 shadow-[2px_2px_0_#92400E] hover:opacity-95`
      : `w-full bg-gradient-to-br ${gradient} text-white py-4 rounded-2xl font-bold text-sm border-4 border-[#12082E] shadow-[4px_4px_0_#12082E] active:translate-y-1 active:shadow-[1px_1px_0_#12082E] transition-all`;
  };

  return (
    <div className="theme-page min-h-screen pb-24">
      {/* ── Header ── */}
      <div className="theme-header px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-50 transition-all duration-200">
        <div>
          <h2 className={titleClass}>{getThemeIcon(theme, "achievement")} Parent Dashboard</h2>
          <p className={subtitleClass}>{user?.name}'s learning overview</p>
        </div>
        <Link href="/">
          <Button size="sm" className="rounded-full w-10 h-10 p-0 theme-back-btn border-2 bg-transparent flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </Link>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">

        {/* ── User profile card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${cardClass} flex flex-col sm:flex-row gap-4 items-center justify-between`}
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coral to-peach flex items-center justify-center text-3xl shadow-md shrink-0">
              {getThemeIcon(theme, "gate")}
            </div>
            <div>
              <h3 className={`text-2xl font-fredoka ${textPrimary}`}>{user?.name}</h3>
              <p className={`text-sm ${textMuted}`}>Age {user?.age} years old</p>
              {user?.lastActive && (
                <p className="text-[11px] opacity-50 mt-0.5">Last active: {new Date(user.lastActive).toLocaleDateString()}</p>
              )}
            </div>
          </div>
          <div className="text-center sm:text-right shrink-0">
            <div className="text-3xl font-fredoka font-bold gradient-text-ocean">{totalSessionTime}m</div>
            <div className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${textMuted}`}>Total Learning</div>
          </div>
        </motion.div>

        {/* ── Stat summary row ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid grid-cols-3 gap-2 sm:gap-4"
        >
          <StatCard label="Total Stars" value={`⭐ ${user?.totalStars ?? 0}`} icon={getThemeIcon(theme, "star")} theme={theme} />
          <StatCard label="This Week" value={`${Math.round(totalWeekMinutes)}m`} icon={getThemeIcon(theme, "time")} theme={theme} />
          <StatCard label="Awards" value={achievements?.length ?? 0} icon={getThemeIcon(theme, "achievement")} theme={theme} />
        </motion.div>

        {/* ── Progress Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Reading */}
          <div className={cardClass}>
            <h3 className="text-lg font-fredoka font-bold text-coral mb-4 flex items-center gap-2">
              {getThemeIcon(theme, "reading")} Reading Progress
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
                  theme={theme}
                />
              ))}
              <p className={`text-[11px] text-center pt-2 border-t border-gray-100/10 ${textMuted}`}>Levels 1–5: Words • Level 6: Sentences</p>
            </div>
          </div>

          {/* Math */}
          <div className={cardClass}>
            <h3 className="text-lg font-fredoka font-bold text-turquoise mb-4 flex items-center gap-2">
              {getThemeIcon(theme, "math")} Math Progress
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
                  theme={theme}
                />
              ))}
              <p className={`text-[11px] text-center pt-2 border-t border-gray-100/10 ${textMuted}`}>Levels 1–2: Counting • Levels 3–6: Addition</p>
            </div>
          </div>

          {/* Sight Words */}
          <div className={cardClass}>
            <h3 className="text-lg font-fredoka font-bold text-lavender mb-4 flex items-center gap-2">
              {getThemeIcon(theme, "sight-words")} Sight Words
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
                    theme={theme}
                  />
                );
              })}
            </div>
          </div>

          {/* Story Books */}
          <div className={cardClass}>
            <h3 className="text-lg font-fredoka font-bold text-indigo-400 mb-4 flex items-center gap-2">
              {getThemeIcon(theme, "books")} Story Books
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
                    theme={theme}
                  />
                );
              })}
              {(!books || books.length === 0) && (
                <p className={`text-sm text-center py-4 ${textMuted}`}>No books available yet.</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Weekly Activity Chart ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cardClass}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-2">
            <h3 className={`text-lg font-fredoka font-bold ${textPrimary} flex items-center gap-2`}>
              {getThemeIcon(theme, "activity")} This Week's Activity
            </h3>
            <span className="text-xs sm:text-sm font-bold text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full shrink-0">
              {Math.round(totalWeekMinutes)} min total
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-3 items-end pt-4 min-h-[140px]">
            {weeklyActivity.map((day, i) => (
              <div key={day.day} className="flex flex-col items-center gap-2">
                <span className={`text-[10px] font-bold ${textMuted}`}>
                  {day.minutes > 0 ? `${Math.round(day.minutes)}m` : ""}
                </span>
                <div className="w-full flex flex-col items-center">
                  <motion.div
                    className={`w-full max-w-[28px] rounded-t-lg ${day.minutes > 0 ? BAR_COLORS[i] : chartEmptyColClass} ${day.isToday ? chartTodayRing : ""}`}
                    initial={{ height: 8 }}
                    animate={{ height: Math.max(12, (day.minutes / maxMinutes) * 96) }}
                    transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                  />
                </div>
                <span className={`text-[11px] font-bold ${day.isToday ? "text-violet-400" : textMuted}`}>
                  {day.day}
                </span>
              </div>
            ))}
          </div>
          <p className={`text-[11px] text-center mt-4 border-t border-gray-100/10 pt-2 ${textMuted}`}>
            Estimated learning duration based on completed milestones (2.5m per item)
          </p>
        </motion.div>

        {/* ── Achievements ── */}
        {achievements && achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            className={cardClass}
          >
            <h3 className={`text-lg font-fredoka font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
              {getThemeIcon(theme, "achievement")} Achievements & Badges
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map((achievement) => (
                <div key={achievement.id} className={achievementItemClass}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-2xl shadow-sm shrink-0">
                    {achievement.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold truncate text-sm sm:text-base">{achievement.title}</div>
                    <div className="text-xs opacity-75 truncate">{achievement.description}</div>
                    <div className="text-[10px] text-amber-500 font-bold mt-0.5">
                      Earned: {new Date(achievement.earnedAt).toLocaleDateString()}
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
          className="space-y-4"
        >
          <Link href="/parent-settings">
            <Button variant="outline" className={settingsBtnClass}>
              ⚙️ Grown-ups Settings
            </Button>
          </Link>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/reading", label: "📖 Reading", gradient: "from-red-400 to-orange-500" },
              { href: "/sight-words", label: "👁️ Sight Words", gradient: "from-violet-500 to-purple-600" },
              { href: "/books", label: "📚 Books", gradient: "from-indigo-400 to-blue-500" },
              { href: "/math", label: "🔢 Math", gradient: "from-teal-400 to-emerald-500" },
            ].map((action) => (
              <Link key={action.href} href={action.href}>
                <Button className={actionGridItemClass(action.gradient)}>
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
          <Link href="/">
            <Button variant="outline" className={backHomeBtnClass}>
              ← Back to Home
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
