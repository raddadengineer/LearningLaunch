import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { speak } from "@/lib/speech";
import { KidActivityTile, ParentLink, KidHelpButton } from "@/components/kid-ui";
import { HELP_HOME } from "@/lib/page-help";

export default function Home() {
  const currentUserId = localStorage.getItem("currentUserId");
  const [, setLocation] = useLocation();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user", currentUserId],
    queryFn: () => fetch(`/api/user/${currentUserId}`).then(res => res.json()),
    enabled: !!currentUserId,
  });

  useEffect(() => {
    if (user?.name) {
      const t = setTimeout(() => {
        speak(`Hi ${user.name}! What do you want to play?`, { rate: 0.85, pitch: 1.2 });
      }, 600);
      return () => clearTimeout(t);
    }
  }, [user?.name]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-3xl font-fredoka text-coral">Loading...</div>
      </div>
    );
  }

  if (!user) {
    setTimeout(() => { window.location.href = "/select-user"; }, 2000);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-bold text-gray-600">Finding your profile...</p>
      </div>
    );
  }

  const activities = [
    {
      emoji: "📖",
      title: "Stories",
      subtitle: "Read books!",
      colorClass: "bg-red-50 hover:bg-red-100",
      path: "/books",
      speakLabel: "Story Books",
    },
    {
      emoji: "🔤",
      title: "Words",
      subtitle: "Sound it out!",
      colorClass: "bg-green-50 hover:bg-green-100",
      path: "/reading",
      speakLabel: "Practice Words",
    },
    {
      emoji: "👁️",
      title: "Sight Words",
      subtitle: "Know by heart!",
      colorClass: "bg-purple-50 hover:bg-purple-100",
      path: "/sight-words",
      speakLabel: "Sight Words",
    },
    {
      emoji: "🔢",
      title: "Math",
      subtitle: "Count & add!",
      colorClass: "bg-blue-50 hover:bg-blue-100",
      path: "/math",
      speakLabel: "Math",
    },
  ];

  return (
    <div className="min-h-screen pb-28">
      <header className="bg-white kid-shadow sticky top-0 z-50 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-coral rounded-2xl flex items-center justify-center text-3xl kid-shadow">
              🦉
            </div>
            <div>
              <h1 className="text-2xl font-fredoka text-coral leading-tight">Hi {user.name}!</h1>
              <p className="text-sm font-bold text-gray-500">Tap to play</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <KidHelpButton helpText={HELP_HOME} />
            <div className="bg-sunnyellow px-4 py-3 rounded-2xl kid-shadow">
              <span className="text-xl font-bold">⭐ {user.totalStars || 0}</span>
            </div>
          </div>
        </div>
      </header>

      <motion.main
        className="container mx-auto px-4 py-6 max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid grid-cols-2 gap-4 mb-4">
          {activities.map((activity) => (
            <KidActivityTile
              key={activity.path}
              emoji={activity.emoji}
              title={activity.title}
              subtitle={activity.subtitle}
              colorClass={activity.colorClass}
              speakLabel={activity.speakLabel}
              onClick={() => setLocation(activity.path)}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <KidActivityTile
            emoji="✨"
            title="A Sounds"
            subtitle="Short & Long A"
            colorClass="bg-yellow-50 hover:bg-yellow-100"
            speakLabel="A Sounds practice"
            onClick={() => setLocation("/vowel-contrast/a")}
          />
          <KidActivityTile
            emoji="🪁"
            title="I Sounds"
            subtitle="Short & Long I"
            colorClass="bg-sky-50 hover:bg-sky-100"
            speakLabel="I Sounds practice"
            onClick={() => setLocation("/vowel-contrast/i")}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 mb-4">
          <KidActivityTile
            emoji="🎵"
            title="Letter Sounds"
            subtitle="Watch and Learn"
            colorClass="bg-pink-50 hover:bg-pink-100"
            speakLabel="Letter Sounds Video"
            onClick={() => setLocation("/letter-sounds")}
          />
        </div>

        <div className="text-center mt-8 space-y-2">
          <ParentLink />
          <p className="text-xs text-gray-400 font-bold">
            <Link href="/select-user" className="hover:text-gray-600" onClick={() => localStorage.removeItem("currentUserId")}>
              Switch friend
            </Link>
          </p>
        </div>
      </motion.main>
    </div>
  );
}
