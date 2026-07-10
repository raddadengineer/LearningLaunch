import { Link, useLocation } from "wouter";
import { speak } from "@/lib/speech";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";

const navItems = [
  { path: "/",               icon: "🏠", label: "Home",      speak: "Home" },
  { path: "/books",          icon: "📖", label: "Stories",   speak: "Stories" },
  { path: "/reading",        icon: "🔤", label: "Words",     speak: "Words" },
  { path: "/math",           icon: "🔢", label: "Math",      speak: "Math" },
  { path: "/parent-settings",icon: "⚙️", label: "Grown-ups", speak: null },
];

export default function Navigation() {
  const [location] = useLocation();
  const { theme } = useTheme();

  return (
    <nav className="theme-nav fixed bottom-0 left-0 right-0 z-40 nav-enter px-2 py-2.5 safe-area-pb">
      <div className="flex justify-around items-stretch max-w-lg mx-auto gap-1">
        {navItems.map((item) => {
          const active = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.88 }}
                onTouchStart={() => item.speak && speak(item.speak, { rate: 0.85, pitch: 1.2 })}
                className="kid-nav-item flex flex-col items-center justify-center rounded-2xl px-2 py-1.5 transition-all duration-200 relative"
              >
                {/* ── active background ── */}
                {active && theme === "space" && (
                  <motion.div layoutId="nav-active" className="absolute inset-0 rounded-2xl bg-white/12" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                )}
                {active && theme === "forest" && (
                  <motion.div layoutId="nav-active" className="absolute inset-0 rounded-2xl bg-amber-200/60" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                )}
                {active && theme === "arcade" && (
                  <motion.div layoutId="nav-active" className="absolute inset-0 rounded-2xl bg-yellow-400/25" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                )}

                {/* ── icon pill ── */}
                <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center mb-0.5 transition-all duration-200 ${
                  theme === "space"  && active ? "bg-white/18 shadow-[0_0_12px_rgba(160,130,255,0.6)]" :
                  theme === "space"            ? "bg-white/7"  :
                  theme === "forest" && active ? "bg-amber-500 shadow-md" :
                  theme === "forest"           ? "bg-white/30" :
                  theme === "arcade" && active ? "bg-yellow-400 shadow-md" :
                                                 "bg-white/15"
                }`}>
                  <span className={`leading-none transition-all duration-200 ${active ? "text-2xl" : "text-xl"}`}>{item.icon}</span>
                </div>

                {/* ── label ── */}
                <span className={`text-[10px] font-fredoka font-bold transition-colors duration-200 ${
                  theme === "space"  && active ? "text-white"        :
                  theme === "space"            ? "text-white/45"     :
                  theme === "forest" && active ? "text-amber-200"    :
                  theme === "forest"           ? "text-amber-200/60" :
                  theme === "arcade" && active ? "text-yellow-400"   :
                                                 "text-white/50"
                }`}>
                  {item.label}
                </span>

                {/* ── active dot ── */}
                {active && (
                  <motion.div
                    layoutId="nav-dot"
                    className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${
                      theme === "space"  ? "bg-violet-400" :
                      theme === "forest" ? "bg-amber-300"  :
                                           "bg-yellow-400"
                    }`}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
