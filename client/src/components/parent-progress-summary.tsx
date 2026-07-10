import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { User, UserProgress } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";

function completedCount(items: unknown): number {
  return Array.isArray(items) ? items.length : 0;
}

function progressPercent(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

export function ParentProgressSummary() {
  const { theme } = useTheme();
  const currentUserId = localStorage.getItem("currentUserId");

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user", currentUserId],
    queryFn: () => fetch(`/api/user/${currentUserId}`).then((res) => res.json()),
    enabled: !!currentUserId,
  });

  const { data: progress, isLoading: progressLoading } = useQuery<UserProgress[]>({
    queryKey: ["/api/user/progress", currentUserId],
    queryFn: () =>
      currentUserId ? fetch(`/api/user/${currentUserId}/progress`).then((res) => res.json()) : [],
    enabled: !!currentUserId,
  });

  // Theme-aware tokens
  const isSpace = theme === "space";
  const isForest = theme === "forest";
  const isArcade = theme === "arcade";

  if (!currentUserId) {
    return (
      <p className={`text-sm ${isSpace ? "text-slate-300" : isForest ? "text-[#78350F]" : "text-gray-600"}`}>
        Select a child profile first to view progress.
      </p>
    );
  }

  if (userLoading || progressLoading) {
    return (
      <p className={`text-sm ${isSpace ? "text-slate-300" : isForest ? "text-[#78350F]" : "text-gray-600"}`}>
        Loading progress...
      </p>
    );
  }

  const reading = progress?.filter((p) => p.activityType === "reading") ?? [];
  const math = progress?.filter((p) => p.activityType === "math") ?? [];
  const sightWords = progress?.filter((p) => p.activityType === "sight-words") ?? [];
  const books = progress?.filter((p) => p.activityType === "books") ?? [];

  const readingCompleted = reading.reduce((sum, p) => sum + completedCount(p.completedItems), 0);
  const readingTotal = reading.reduce((sum, p) => sum + (p.totalItems ?? 12), 0) || 174;

  const mathCompleted = math.reduce((sum, p) => sum + completedCount(p.completedItems), 0);
  const mathTotal = math.reduce((sum, p) => sum + (p.totalItems ?? 5), 0) || 30;

  const sightCompleted = sightWords.reduce((sum, p) => sum + completedCount(p.completedItems), 0);
  const sightTotal = sightWords.reduce((sum, p) => sum + (p.totalItems ?? 12), 0) || 36;

  const booksCompleted = books.reduce((sum, p) => sum + completedCount(p.completedItems), 0);
  const booksTotal = books.reduce((sum, p) => sum + (p.totalItems ?? 1), 0) || 1;

  const totalMinutes = Math.round(
    (progress ?? []).reduce((sum, p) => sum + completedCount(p.completedItems), 0) * 2.5
  );

  const areas = [
    { label: "Reading", completed: readingCompleted, total: readingTotal, color: "bg-coral" },
    { label: "Math", completed: mathCompleted, total: mathTotal, color: "bg-turquoise" },
    { label: "Sight Words", completed: sightCompleted, total: sightTotal, color: "bg-purple-500" },
    { label: "Story Books", completed: booksCompleted, total: booksTotal, color: "bg-indigo-500" },
  ];

  // Card classes
  const statCardClass = isSpace
    ? "rounded-2xl bg-slate-900/40 border border-violet-500/20 text-white"
    : isForest
    ? "rounded-2xl bg-[#FFFBEB] border-3 border-[#D97706] text-[#78350F] shadow-[3px_3px_0_#92400E]"
    : "rounded-2xl bg-white border-4 border-[#12082E] text-[#12082E] shadow-[4px_4px_0_#12082E]";

  const progressTrackClass = isSpace
    ? "w-full bg-slate-900/60 rounded-full h-3 overflow-hidden border border-violet-500/10"
    : isForest
    ? "w-full bg-[#EFE5C9] rounded-full h-3.5 overflow-hidden border border-[#D97706]/20"
    : "w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border-2 border-[#12082E]";

  const btnClass = isSpace
    ? "w-full rounded-2xl font-fredoka font-bold py-3 bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/15"
    : isForest
    ? "w-full rounded-2xl font-fredoka font-bold py-3 bg-[#16A34A] hover:bg-[#15803D] text-white border-3 border-[#14532D] shadow-[2px_2px_0_#14532D]"
    : "w-full rounded-2xl font-fredoka font-bold py-3 bg-[#FFE600] hover:bg-[#E6CE00] text-[#12082E] border-4 border-[#12082E] shadow-[4px_4px_0_#12082E]";

  const textPrimary = isSpace ? "text-white" : isForest ? "text-[#78350F]" : "text-gray-800";
  const textMuted = isSpace ? "text-violet-300" : isForest ? "text-[#78350F]/70" : "text-gray-600";
  const timeValColor = isSpace ? "text-violet-400" : isForest ? "text-[#16A34A]" : "text-turquoise";

  return (
    <div className="space-y-5">
      <Card className={`${statCardClass} overflow-hidden`}>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className={`font-fredoka text-xl font-bold ${textPrimary}`}>{user?.name ?? "Child"}</p>
            <p className={`text-sm ${textMuted}`}>⭐ {user?.totalStars ?? 0} stars earned</p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${timeValColor}`}>{totalMinutes}m</p>
            <p className={`text-xs ${textMuted}`}>Est. learning time</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {areas.map((area) => (
          <div key={area.label} className="space-y-1">
            <div className="flex justify-between text-xs sm:text-sm font-semibold">
              <span className={textPrimary}>{area.label}</span>
              <span className={textMuted}>
                {area.completed}/{area.total} ({progressPercent(area.completed, area.total)}%)
              </span>
            </div>
            <div className={progressTrackClass}>
              <div
                className={`${area.color} h-full rounded-full transition-all duration-300`}
                style={{ width: `${progressPercent(area.completed, area.total)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <Link href="/parent-dashboard">
          <Button className={btnClass}>
            View Full Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
