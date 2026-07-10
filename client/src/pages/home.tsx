import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { speak } from "@/lib/speech";
import { KidActivityTile, ParentLink, KidHelpButton, StarsBadge } from "@/components/kid-ui";
import { HELP_HOME } from "@/lib/page-help";
import { useTheme, SpaceStars } from "@/lib/theme";
import type { TileVariant } from "@/lib/theme";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const tileVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.92 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { type: "spring", stiffness: 300, damping: 26 } },
};

const activities: { variant: TileVariant; emoji: string; title: string; subtitle: string; path: string; speakLabel: string }[] = [
  { variant: "stories",    emoji: "📖", title: "Stories",     subtitle: "Read books!",     path: "/books",      speakLabel: "Story Books" },
  { variant: "words",      emoji: "🔤", title: "Words",       subtitle: "Sound it out!",   path: "/reading",    speakLabel: "Practice Words" },
  { variant: "sight-words",emoji: "👁️", title: "Sight Words", subtitle: "Know by heart!",  path: "/sight-words",speakLabel: "Sight Words" },
  { variant: "math",       emoji: "🔢", title: "Math",        subtitle: "Count & add!",    path: "/math",       speakLabel: "Math" },
];

export default function Home() {
  const currentUserId = localStorage.getItem("currentUserId");
  const [, setLocation] = useLocation();
  const { theme } = useTheme();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user", currentUserId],
    queryFn: () => fetch(`/api/user/${currentUserId}`).then(r => r.json()),
    enabled: !!currentUserId,
  });

  useEffect(() => {
    if (user?.name) {
      const t = setTimeout(() => speak(`Hi ${user.name}! What do you want to play?`, { rate: 0.85, pitch: 1.2 }), 600);
      return () => clearTimeout(t);
    }
  }, [user?.name]);

  if (isLoading) return (
    <div className={`theme-page min-h-screen flex items-center justify-center ${theme === "space" ? "relative" : ""}`}>
      {theme === "space" && <SpaceStars />}
      <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}
        className="text-5xl relative z-10">🦉</motion.div>
    </div>
  );

  if (!user) {
    setTimeout(() => { window.location.href = "/select-user"; }, 2000);
    return (
      <div className="theme-page min-h-screen flex items-center justify-center">
        <p className={`text-xl font-bold ${theme === "space" || theme === "arcade" ? "text-white" : "text-amber-800"}`}>
          Finding your profile...
        </p>
      </div>
    );
  }

  /* ── Header text colours ── */
  const greetingColor =
    theme === "space"  ? "text-violet-300" :
    theme === "forest" ? "text-amber-800"  :
                         "text-yellow-300";
  const subtitleColor =
    theme === "space"  ? "text-white/50" :
    theme === "forest" ? "text-amber-600" :
                         "text-white/60";
  const sectionLabelColor =
    theme === "space"  ? "text-white/40" :
    theme === "forest" ? "text-amber-600" :
                         "text-white/60";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={theme}
        className="theme-page min-h-screen pb-32 relative"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {theme === "space" && <SpaceStars />}

        {/* ══ Header ══ */}
        <header className="theme-header sticky top-0 z-50 px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              {theme === "space" && (
                <motion.div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg"
                  style={{ background: "radial-gradient(circle at 30% 30%, #a78bfa, #6d28d9)", boxShadow: "0 0 20px rgba(167,139,250,0.5)" }}
                  animate={{ rotate: [0,-4,4,0] }} transition={{ repeat: Infinity, duration: 4, repeatDelay: 3 }}
                >🦉</motion.div>
              )}
              {theme === "forest" && (
                <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-3xl shadow-md" style={{ border: "3px solid #92400E", boxShadow: "3px 3px 0 #92400E" }}>🦉</div>
              )}
              {theme === "arcade" && (
                <div className="w-14 h-14 rounded-2xl bg-yellow-400 flex items-center justify-center text-3xl font-black" style={{ border: "3px solid #12082E", boxShadow: "0 4px 0 #12082E" }}>🦉</div>
              )}
              <div>
                <h1 className={`text-2xl font-fredoka leading-tight ${greetingColor}`}>
                  {theme === "arcade" ? `HI ${user.name.toUpperCase()}!` : `Hi ${user.name}!`}
                </h1>
                <p className={`text-xs font-bold ${subtitleColor}`}>
                  {theme === "arcade" ? "TAP TO PLAY!" : "Tap to play"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <KidHelpButton helpText={HELP_HOME} />
              <StarsBadge count={user.totalStars || 0} />
            </div>
          </div>
        </header>

        {/* ══ Content ══ */}
        <motion.main
          className="container mx-auto px-4 py-5 max-w-lg relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Section label */}
          <motion.p variants={tileVariants} className={`text-xs font-bold uppercase tracking-widest mb-3 px-1 ${sectionLabelColor}`}>
            {theme === "arcade" ? "⚡ SELECT ACTIVITY" : "Learning Activities"}
          </motion.p>

          {/* 2×2 grid — space theme uses circular tiles, needs square aspect */}
          <motion.div
            className={`grid grid-cols-2 gap-3.5 mb-3.5 ${theme === "space" ? "gap-6" : ""}`}
            variants={containerVariants}
          >
            {activities.map((a) => (
              <motion.div key={a.path} variants={tileVariants} className={theme === "space" ? "aspect-square" : ""}>
                <KidActivityTile
                  emoji={a.emoji}
                  title={a.title}
                  subtitle={a.subtitle}
                  variant={a.variant}
                  speakLabel={a.speakLabel}
                  onClick={() => setLocation(a.path)}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Vowel section */}
          <motion.p variants={tileVariants} className={`text-xs font-bold uppercase tracking-widest mb-3 px-1 ${sectionLabelColor}`}>
            {theme === "arcade" ? "🔤 VOWEL CHALLENGES" : "Vowel Practice"}
          </motion.p>
          <motion.div className={`grid grid-cols-2 gap-3.5 mb-3.5 ${theme === "space" ? "gap-6" : ""}`} variants={containerVariants}>
            {[
              { variant: "vowel-a" as TileVariant, emoji: "✨", title: "A Sounds", subtitle: "Short & Long A", path: "/vowel-contrast/a", speakLabel: "A Sounds practice" },
              { variant: "vowel-i" as TileVariant, emoji: "🪁", title: "I Sounds", subtitle: "Short & Long I", path: "/vowel-contrast/i", speakLabel: "I Sounds practice" },
            ].map((a) => (
              <motion.div key={a.path} variants={tileVariants} className={theme === "space" ? "aspect-square" : ""}>
                <KidActivityTile emoji={a.emoji} title={a.title} subtitle={a.subtitle} variant={a.variant} speakLabel={a.speakLabel} onClick={() => setLocation(a.path)} />
              </motion.div>
            ))}
          </motion.div>

          {/* Letter Sounds */}
          <motion.div variants={tileVariants} className="mb-6">
            <KidActivityTile emoji="🎵" title="Letter Sounds" subtitle="Watch and Learn" variant="letters" speakLabel="Letter Sounds Video" onClick={() => setLocation("/letter-sounds")} />
          </motion.div>

          {/* Bottom links */}
          <motion.div variants={tileVariants} className="text-center space-y-3">
            <ParentLink />
            <p>
              <Link
                href="/select-user"
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                  theme === "space"  ? "text-white/50 hover:text-white bg-white/8 hover:bg-white/15" :
                  theme === "forest" ? "text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200" :
                                       "text-white/60 hover:text-white bg-white/10 hover:bg-white/20"
                }`}
                onClick={() => localStorage.removeItem("currentUserId")}
              >
                Switch friend 👋
              </Link>
            </p>
          </motion.div>
        </motion.main>
      </motion.div>
    </AnimatePresence>
  );
}
