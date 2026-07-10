import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { motion } from "framer-motion";

export type Theme = "space" | "forest" | "arcade";

export const THEME_META: Record<Theme, { name: string; emoji: string; desc: string; previewBg: string; previewText: string }> = {
  space:  { name: "Space",  emoji: "🚀", desc: "Dark & cosmic",     previewBg: "linear-gradient(135deg,#0e0830,#2d1b69)", previewText: "#a78bfa" },
  forest: { name: "Forest", emoji: "🌳", desc: "Warm & storybook",  previewBg: "linear-gradient(180deg,#FDE68A,#DCFCE7)", previewText: "#78350F" },
  arcade: { name: "Arcade", emoji: "🎮", desc: "Bold & electric",   previewBg: "linear-gradient(135deg,#FF1A8C,#FFE600)", previewText: "#1A0A4E" },
};

/* ─────────────────────────────────────────────
   Tile color definitions per theme per variant
───────────────────────────────────────────────*/
export type TileVariant = "stories" | "words" | "sight-words" | "math" | "vowel-a" | "vowel-i" | "letters" | "default";

export interface TileStyle {
  bg: string;
  border: string;
  shadow: string;
  text: string;
  subtext: string;
  shape: "circle" | "rect";
  pressColor?: string;
}

const SPACE_TILES: Record<TileVariant, TileStyle> = {
  stories:      { bg: "radial-gradient(circle at 35% 30%, #ff8c42, #c2410c)",  border: "rgba(255,150,80,0.55)",  shadow: "0 0 28px rgba(255,100,30,0.55), 0 0 60px rgba(255,100,30,0.2)",  text: "#fff", subtext: "rgba(255,255,255,0.75)", shape: "circle" },
  words:        { bg: "radial-gradient(circle at 35% 30%, #22d3ee, #0e7490)",  border: "rgba(100,220,255,0.55)", shadow: "0 0 28px rgba(34,211,238,0.55), 0 0 60px rgba(34,211,238,0.2)",  text: "#fff", subtext: "rgba(255,255,255,0.75)", shape: "circle" },
  "sight-words":{ bg: "radial-gradient(circle at 35% 30%, #a855f7, #6d28d9)",  border: "rgba(180,120,255,0.55)", shadow: "0 0 28px rgba(168,85,247,0.55),  0 0 60px rgba(168,85,247,0.2)",  text: "#fff", subtext: "rgba(255,255,255,0.75)", shape: "circle" },
  math:         { bg: "radial-gradient(circle at 35% 30%, #3b82f6, #1d4ed8)",  border: "rgba(100,150,255,0.55)", shadow: "0 0 28px rgba(59,130,246,0.55),  0 0 60px rgba(59,130,246,0.2)",  text: "#fff", subtext: "rgba(255,255,255,0.75)", shape: "circle" },
  "vowel-a":    { bg: "radial-gradient(circle at 35% 30%, #fbbf24, #b45309)",  border: "rgba(255,210,100,0.55)", shadow: "0 0 28px rgba(251,191,36,0.55),  0 0 60px rgba(251,191,36,0.2)",  text: "#fff", subtext: "rgba(255,255,255,0.75)", shape: "circle" },
  "vowel-i":    { bg: "radial-gradient(circle at 35% 30%, #06b6d4, #0e7490)",  border: "rgba(80,200,230,0.55)",  shadow: "0 0 28px rgba(6,182,212,0.55),   0 0 60px rgba(6,182,212,0.2)",   text: "#fff", subtext: "rgba(255,255,255,0.75)", shape: "circle" },
  letters:      { bg: "radial-gradient(circle at 35% 30%, #ec4899, #9d174d)",  border: "rgba(255,120,190,0.55)", shadow: "0 0 28px rgba(236,72,153,0.55),  0 0 60px rgba(236,72,153,0.2)",  text: "#fff", subtext: "rgba(255,255,255,0.75)", shape: "circle" },
  default:      { bg: "radial-gradient(circle at 35% 30%, #8b5cf6, #6d28d9)",  border: "rgba(170,130,255,0.55)", shadow: "0 0 28px rgba(139,92,246,0.55)",                                   text: "#fff", subtext: "rgba(255,255,255,0.75)", shape: "circle" },
};

const FOREST_TILES: Record<TileVariant, TileStyle> = {
  stories:      { bg: "#FFF0EE", border: "#DC2626", shadow: "#991B1B", text: "#7F1D1D", subtext: "#B91C1C", shape: "rect" },
  words:        { bg: "#EFF6FF", border: "#2563EB", shadow: "#1E40AF", text: "#1E3A8A", subtext: "#3B82F6", shape: "rect" },
  "sight-words":{ bg: "#FEFCE8", border: "#CA8A04", shadow: "#92400E", text: "#713F12", subtext: "#D97706", shape: "rect" },
  math:         { bg: "#F0FDF4", border: "#16A34A", shadow: "#14532D", text: "#14532D", subtext: "#22C55E", shape: "rect" },
  "vowel-a":    { bg: "#FFFBEB", border: "#D97706", shadow: "#92400E", text: "#78350F", subtext: "#F59E0B", shape: "rect" },
  "vowel-i":    { bg: "#F0F9FF", border: "#0284C7", shadow: "#0C4A6E", text: "#0C4A6E", subtext: "#38BDF8", shape: "rect" },
  letters:      { bg: "#FDF2F8", border: "#DB2777", shadow: "#9D174D", text: "#831843", subtext: "#EC4899", shape: "rect" },
  default:      { bg: "#FFFBEB", border: "#D97706", shadow: "#92400E", text: "#78350F", subtext: "#F59E0B", shape: "rect" },
};

const ARCADE_TILES: Record<TileVariant, TileStyle> = {
  stories:      { bg: "linear-gradient(160deg, #FF4757, #C0392B)", border: "rgba(0,0,0,0.4)", shadow: "0 7px 0 rgba(0,0,0,0.3)", text: "#fff", subtext: "rgba(255,255,255,0.85)", shape: "rect", pressColor: "#C0392B" },
  words:        { bg: "linear-gradient(160deg, #2ED573, #27AE60)", border: "rgba(0,0,0,0.4)", shadow: "0 7px 0 rgba(0,0,0,0.3)", text: "#fff", subtext: "rgba(255,255,255,0.85)", shape: "rect", pressColor: "#27AE60" },
  "sight-words":{ bg: "linear-gradient(160deg, #A55EEA, #8E44AD)", border: "rgba(0,0,0,0.4)", shadow: "0 7px 0 rgba(0,0,0,0.3)", text: "#fff", subtext: "rgba(255,255,255,0.85)", shape: "rect", pressColor: "#8E44AD" },
  math:         { bg: "linear-gradient(160deg, #1E90FF, #2980B9)", border: "rgba(0,0,0,0.4)", shadow: "0 7px 0 rgba(0,0,0,0.3)", text: "#fff", subtext: "rgba(255,255,255,0.85)", shape: "rect", pressColor: "#2980B9" },
  "vowel-a":    { bg: "linear-gradient(160deg, #FFD700, #F39C12)", border: "rgba(0,0,0,0.4)", shadow: "0 7px 0 rgba(0,0,0,0.3)", text: "#1A0A4E", subtext: "rgba(26,10,78,0.75)", shape: "rect", pressColor: "#F39C12" },
  "vowel-i":    { bg: "linear-gradient(160deg, #00CEC9, #00B5AD)", border: "rgba(0,0,0,0.4)", shadow: "0 7px 0 rgba(0,0,0,0.3)", text: "#fff", subtext: "rgba(255,255,255,0.85)", shape: "rect", pressColor: "#00B5AD" },
  letters:      { bg: "linear-gradient(160deg, #FD79A8, #E84393)", border: "rgba(0,0,0,0.4)", shadow: "0 7px 0 rgba(0,0,0,0.3)", text: "#fff", subtext: "rgba(255,255,255,0.85)", shape: "rect", pressColor: "#E84393" },
  default:      { bg: "linear-gradient(160deg, #A55EEA, #8E44AD)", border: "rgba(0,0,0,0.4)", shadow: "0 7px 0 rgba(0,0,0,0.3)", text: "#fff", subtext: "rgba(255,255,255,0.85)", shape: "rect", pressColor: "#8E44AD" },
};

export function getTileStyle(theme: Theme, variant: TileVariant): TileStyle {
  const map = { space: SPACE_TILES, forest: FOREST_TILES, arcade: ARCADE_TILES };
  return map[theme][variant] ?? map[theme].default;
}

/* ─────────────────────────────────────────────
   Context & Provider
───────────────────────────────────────────────*/
interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: "space", setTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem("ll-theme") as Theme) || "space";
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("ll-theme", t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

/* ─────────────────────────────────────────────
   SpaceStars background decoration
───────────────────────────────────────────────*/
export function SpaceStars() {
  const stars = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() < 0.75 ? 1.5 : Math.random() < 0.5 ? 2.5 : 3.5,
      opacity: 0.25 + Math.random() * 0.75,
      delay: Math.random() * 4,
      duration: 2 + Math.random() * 3,
    })), []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size, opacity: s.opacity }}
          animate={{ opacity: [s.opacity, s.opacity * 0.3, s.opacity] }}
          transition={{ repeat: Infinity, duration: s.duration, delay: s.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
