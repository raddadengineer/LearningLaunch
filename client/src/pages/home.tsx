import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { speak } from "@/lib/speech";
import { KidActivityTile, ParentLink, KidHelpButton } from "@/components/kid-ui";
import { HELP_HOME } from "@/lib/page-help";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const tileVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 320, damping: 28 } },
};

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
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-4xl font-fredoka gradient-text-coral"
        >
          Loading... 🦉
        </motion.div>
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

  const mainActivities = [
    {
      emoji: "📖",
      title: "Stories",
      subtitle: "Read books!",
      colorClass: "tile-stories",
      path: "/books",
      speakLabel: "Story Books",
    },
    {
      emoji: "🔤",
      title: "Words",
      subtitle: "Sound it out!",
      colorClass: "tile-words",
      path: "/reading",
      speakLabel: "Practice Words",
    },
    {
      emoji: "👁️",
      title: "Sight Words",
      subtitle: "Know by heart!",
      colorClass: "tile-sight",
      path: "/sight-words",
      speakLabel: "Sight Words",
    },
    {
      emoji: "🔢",
      title: "Math",
      subtitle: "Count & add!",
      colorClass: "tile-math",
      path: "/math",
      speakLabel: "Math",
    },
  ];

  return (
    <div className="min-h-screen pb-32">
      {/* ── Header ── */}
      <header className="glass-header sticky top-0 z-50 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Owl avatar */}
            <motion.div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md bg-gradient-to-br from-coral to-peach"
              animate={{ rotate: [0, -4, 4, 0] }}
              transition={{ repeat: Infinity, duration: 4, repeatDelay: 3 }}
            >
              🦉
            </motion.div>
            <div>
              <h1 className="text-2xl font-fredoka gradient-text-coral leading-tight">
                Hi {user.name}!
              </h1>
              <p className="text-xs font-bold text-gray-400">Tap to play</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <KidHelpButton helpText={HELP_HOME} />
            {/* Stars badge */}
            <motion.div
              className="bg-gradient-to-br from-yellow-400 to-amber-500 px-4 py-2.5 rounded-2xl shadow-md"
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-lg font-bold text-white drop-shadow-sm">⭐ {user.totalStars || 0}</span>
            </motion.div>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <motion.main
        className="container mx-auto px-4 py-5 max-w-lg"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Section label */}
        <motion.p variants={tileVariants} className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
          Learning Activities
        </motion.p>

        {/* 2×2 main grid */}
        <motion.div className="grid grid-cols-2 gap-3.5 mb-3.5" variants={containerVariants}>
          {mainActivities.map((activity) => (
            <motion.div key={activity.path} variants={tileVariants}>
              <KidActivityTile
                emoji={activity.emoji}
                title={activity.title}
                subtitle={activity.subtitle}
                colorClass={activity.colorClass}
                speakLabel={activity.speakLabel}
                onClick={() => setLocation(activity.path)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Section label */}
        <motion.p variants={tileVariants} className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
          Vowel Practice
        </motion.p>

        {/* Vowel tiles */}
        <motion.div className="grid grid-cols-2 gap-3.5 mb-3.5" variants={containerVariants}>
          <motion.div variants={tileVariants}>
            <KidActivityTile
              emoji="✨"
              title="A Sounds"
              subtitle="Short & Long A"
              colorClass="tile-vowel-a"
              speakLabel="A Sounds practice"
              onClick={() => setLocation("/vowel-contrast/a")}
            />
          </motion.div>
          <motion.div variants={tileVariants}>
            <KidActivityTile
              emoji="🪁"
              title="I Sounds"
              subtitle="Short & Long I"
              colorClass="tile-vowel-i"
              speakLabel="I Sounds practice"
              onClick={() => setLocation("/vowel-contrast/i")}
            />
          </motion.div>
        </motion.div>

        {/* Letter sounds — full width */}
        <motion.div variants={tileVariants} className="mb-6">
          <KidActivityTile
            emoji="🎵"
            title="Letter Sounds"
            subtitle="Watch and Learn"
            colorClass="tile-letters"
            speakLabel="Letter Sounds Video"
            onClick={() => setLocation("/letter-sounds")}
          />
        </motion.div>

        {/* Bottom links */}
        <motion.div variants={tileVariants} className="text-center space-y-3">
          <ParentLink />
          <p className="text-xs text-gray-400 font-bold">
            <Link
              href="/select-user"
              className="hover:text-gray-600 transition-colors bg-white/50 px-3 py-1.5 rounded-full"
              onClick={() => localStorage.removeItem("currentUserId")}
            >
              Switch friend 👋
            </Link>
          </p>
        </motion.div>
      </motion.main>
    </div>
  );
}
