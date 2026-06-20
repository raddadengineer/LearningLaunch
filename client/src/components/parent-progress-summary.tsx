import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { User, UserProgress } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function completedCount(items: unknown): number {
  return Array.isArray(items) ? items.length : 0;
}

function progressPercent(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

export function ParentProgressSummary() {
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

  if (!currentUserId) {
    return (
      <p className="text-sm text-gray-600">
        Select a child profile first to view progress.
      </p>
    );
  }

  if (userLoading || progressLoading) {
    return <p className="text-sm text-gray-600">Loading progress...</p>;
  }

  const reading = progress?.filter((p) => p.activityType === "reading") ?? [];
  const math = progress?.filter((p) => p.activityType === "math") ?? [];
  const sightWords = progress?.filter((p) => p.activityType === "sight-words") ?? [];
  const books = progress?.filter((p) => p.activityType === "books") ?? [];

  const readingCompleted = reading.reduce((sum, p) => sum + completedCount(p.completedItems), 0);
  const readingTotal = reading.reduce((sum, p) => sum + (p.totalItems ?? 12), 0) || 72;

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

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl bg-gradient-to-br from-coral/10 to-turquoise/10 border-0">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="font-fredoka text-xl font-bold text-gray-800">{user?.name ?? "Child"}</p>
            <p className="text-sm text-gray-600">⭐ {user?.totalStars ?? 0} stars earned</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-turquoise">{totalMinutes}m</p>
            <p className="text-xs text-gray-600">Est. learning time</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {areas.map((area) => (
          <div key={area.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold text-gray-700">{area.label}</span>
              <span className="text-gray-500">
                {area.completed}/{area.total} ({progressPercent(area.completed, area.total)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`${area.color} h-2.5 rounded-full transition-all duration-300`}
                style={{ width: `${progressPercent(area.completed, area.total)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <Link href="/parent-dashboard">
        <Button className="w-full rounded-2xl font-fredoka font-bold bg-coral hover:bg-coral/90 text-white">
          View Full Dashboard
        </Button>
      </Link>
    </div>
  );
}
