import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { speak } from "@/lib/speech";
import { KidHelpButton } from "@/components/kid-ui";
import { HELP_WELCOME } from "@/lib/page-help";
import { useTheme, SpaceStars } from "@/lib/theme";
import { ThemePicker } from "@/components/theme-picker";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { theme } = useTheme();

  const go = () => {
    speak("Let's go!", { rate: 0.85, pitch: 1.2 });
    setLocation("/select-user");
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={theme}
        className="theme-page min-h-screen flex flex-col justify-center items-center py-12 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* ── Background decorations ── */}
        {theme === "space" && (
          <>
            <div className="theme-stars-overlay" />
            <div className="orb w-96 h-96 bg-purple-600 top-[-100px] left-[-80px]" />
            <div className="orb w-72 h-72 bg-blue-600 bottom-[60px] right-[-60px]" />
          </>
        )}
        {theme === "forest" && (
          <>
            <div className="orb w-80 h-40 bg-yellow-300 top-[-20px] left-0 right-0 mx-auto opacity-40" />
            {["🌿","🍃","🌸","🍀","⭐","🌟"].map((d, i) => (
              <motion.span key={i} className="absolute text-3xl pointer-events-none select-none opacity-50"
                style={{ top: `${[8,18,72,82,12,68][i]}%`, left: `${[5,88,4,90,45,48][i]}%` }}
                animate={{ y: [0,-8,0], rotate: [0,8,-8,0] }}
                transition={{ repeat: Infinity, duration: 3 + i*0.5, delay: i*0.4 }}
              >{d}</motion.span>
            ))}
          </>
        )}
        {theme === "arcade" && (
          <>
            {["⭐","🌟","✨","💥","🎯","🎊"].map((d, i) => (
              <motion.span key={i} className="absolute text-4xl pointer-events-none select-none"
                style={{ top: `${[10,65,20,75,5,80][i]}%`, left: `${[8,5,85,88,50,50][i]}%` }}
                animate={{ y: [0,-14,0], rotate: [0,20,-20,0], scale: [1,1.2,1] }}
                transition={{ repeat: Infinity, duration: 1.8 + i*0.3, delay: i*0.25 }}
              >{d}</motion.span>
            ))}
          </>
        )}

        <div className="container mx-auto px-6 relative z-10 max-w-sm text-center space-y-8">

          {/* ── Mascot ── */}
          <motion.div
            key={`mascot-${theme}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.1 }}
          >
            {theme === "space" ? (
              <motion.div
                className="relative inline-block"
                animate={{ y: [0, -16, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                <div className="absolute inset-0 scale-150 rounded-full blur-3xl bg-purple-500/30" />
                <span className="text-[96px] leading-none relative z-10 drop-shadow-2xl">🦉</span>
                {/* halo */}
                <div className="absolute inset-[-12px] rounded-full border-2 border-purple-400/40 animate-pulse-slow" />
              </motion.div>
            ) : theme === "forest" ? (
              <motion.div
                className="relative inline-block"
                animate={{ rotate: [0, -4, 4, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <span className="text-[96px] leading-none drop-shadow-lg">🦉</span>
              </motion.div>
            ) : (
              <motion.div
                className="relative inline-block"
                animate={{ y: [0, -12, 0], rotate: [0, -5, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              >
                <span className="text-[96px] leading-none drop-shadow-2xl">🦉</span>
                <span className="absolute -top-2 -right-2 text-3xl">😎</span>
              </motion.div>
            )}
          </motion.div>

          {/* ── Title ── */}
          <motion.div
            key={`title-${theme}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 280, damping: 26 }}
          >
            {theme === "space" && (
              <>
                <h1 className="text-5xl sm:text-6xl font-fredoka text-white mb-2 drop-shadow-xl" style={{ textShadow: "0 0 30px rgba(167,139,250,0.7)" }}>
                  LearningLaunch
                </h1>
                <p className="text-lg font-bold text-violet-300">Your cosmic classroom! 🚀</p>
              </>
            )}
            {theme === "forest" && (
              <>
                <h1 className="text-5xl sm:text-6xl font-fredoka text-amber-800 mb-2 drop-shadow-sm">
                  LearningLaunch
                </h1>
                <p className="text-lg font-bold text-green-700">Let's explore and learn! 🌳</p>
              </>
            )}
            {theme === "arcade" && (
              <>
                <h1 className="text-5xl sm:text-6xl font-fredoka text-white mb-2 uppercase" style={{ textShadow: "3px 3px 0 #12082E, -1px -1px 0 #12082E" }}>
                  Learning<br />Launch
                </h1>
                <p className="text-lg font-black text-yellow-300 uppercase tracking-widest">Press start to play! 🎮</p>
              </>
            )}
          </motion.div>

          {/* ── CTA Button ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.32, type: "spring", stiffness: 280, damping: 22 }}
          >
            {theme === "space" && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.93 }}
                whileHover={{ scale: 1.05 }}
                onClick={go}
                className="w-full py-5 rounded-[2rem] font-fredoka text-2xl font-bold text-violet-900 shine-sweep relative overflow-hidden shadow-2xl btn-pressable border-b-[5px] border-violet-800"
                style={{ background: "linear-gradient(135deg, #c4b5fd, #a78bfa, #8b5cf6)" }}
              >
                🚀 Let's Launch!
              </motion.button>
            )}
            {theme === "forest" && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.94, y: 4 }}
                whileHover={{ scale: 1.04 }}
                onClick={go}
                className="w-full py-5 rounded-[2rem] font-fredoka text-2xl font-bold text-white shadow-lg"
                style={{ background: "#5A7A2A", border: "4px solid #3E5A1A", boxShadow: "0 7px 0 #3E5A1A" }}
              >
                🌳 Let's Explore!
              </motion.button>
            )}
            {theme === "arcade" && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.95, y: 5 }}
                whileHover={{ scale: 1.05 }}
                onClick={go}
                className="w-full py-5 rounded-[1.5rem] font-fredoka text-2xl font-black text-gray-900 uppercase tracking-wide"
                style={{ background: "#FFE600", border: "4px solid #12082E", boxShadow: "0 8px 0 #12082E", borderBottomWidth: "8px" }}
              >
                🎮 PRESS START!
              </motion.button>
            )}
          </motion.div>

          {/* ── Theme switcher ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
          >
            <p className={`text-xs font-bold mb-2 ${theme === "forest" ? "text-amber-700" : "text-white/50"}`}>
              🎨 Change Style
            </p>
            <ThemePicker compact />
          </motion.div>
        </div>

        {/* Help button */}
        <div className="fixed top-4 right-4 z-50">
          <KidHelpButton helpText={HELP_WELCOME} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}