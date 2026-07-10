import { Link, useLocation } from "wouter";
import { speak } from "@/lib/speech";
import { motion } from "framer-motion";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: "🏠", label: "Home", speak: "Home", color: "from-coral to-peach" },
    { path: "/books", icon: "📖", label: "Stories", speak: "Stories", color: "from-indigo-400 to-blue-500" },
    { path: "/reading", icon: "🔤", label: "Words", speak: "Words", color: "from-emerald-400 to-teal-500" },
    { path: "/math", icon: "🔢", label: "Math", speak: "Math", color: "from-sky-400 to-blue-500" },
    { path: "/parent-settings", icon: "⚙️", label: "Grown-ups", speak: null, color: "from-violet-400 to-purple-500" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-nav nav-enter px-3 py-3 safe-area-pb">
      <div className="flex justify-around items-stretch max-w-lg mx-auto gap-1.5">
        {navItems.map((item, i) => {
          const active = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onTouchStart={() => item.speak && speak(item.speak, { rate: 0.85, pitch: 1.2 })}
                className={`kid-nav-item flex flex-col items-center justify-center rounded-2xl px-2 py-2 transition-all duration-200 relative ${
                  active
                    ? "scale-110"
                    : "hover:bg-white/60"
                }`}
              >
                {/* Active background pill */}
                {active && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.color} opacity-15`}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Icon container */}
                <div
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center mb-0.5 transition-all duration-200 ${
                    active
                      ? `bg-gradient-to-br ${item.color} shadow-md`
                      : "bg-gray-100"
                  }`}
                >
                  <span className="text-xl leading-none">{item.icon}</span>
                </div>

                {/* Label */}
                <span
                  className={`text-[11px] font-fredoka font-bold leading-none transition-colors duration-200 ${
                    active ? "text-gray-800" : "text-gray-400"
                  }`}
                >
                  {item.label}
                </span>

                {/* Active dot */}
                {active && (
                  <motion.div
                    layoutId="nav-dot"
                    className={`absolute bottom-1 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${item.color}`}
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
