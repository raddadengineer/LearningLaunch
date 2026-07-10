import { motion } from "framer-motion";
import { useTheme, THEME_META, Theme } from "@/lib/theme";

interface ThemePickerProps {
  compact?: boolean;
  onPick?: (t: Theme) => void;
}

export function ThemePicker({ compact = false, onPick }: ThemePickerProps) {
  const { theme, setTheme } = useTheme();
  const themes: Theme[] = ["space", "forest", "arcade"];

  const handlePick = (t: Theme) => {
    setTheme(t);
    onPick?.(t);
  };

  if (compact) {
    return (
      <div className="flex gap-2 justify-center">
        {themes.map((t) => {
          const meta = THEME_META[t];
          const active = theme === t;
          return (
            <motion.button
              key={t}
              type="button"
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.08 }}
              onClick={() => handlePick(t)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full font-fredoka font-bold text-sm transition-all duration-200 ${
                active
                  ? "bg-white text-gray-900 shadow-lg scale-105"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <span>{meta.emoji}</span>
              <span>{meta.name}</span>
              {active && <span className="w-1.5 h-1.5 rounded-full bg-green-400 ml-0.5" />}
            </motion.button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-center text-gray-500 uppercase tracking-widest">Choose Your Style</p>
      <div className="grid grid-cols-3 gap-3">
        {themes.map((t) => {
          const meta = THEME_META[t];
          const active = theme === t;
          return (
            <motion.button
              key={t}
              type="button"
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.04, y: -2 }}
              onClick={() => handlePick(t)}
              className={`relative rounded-2xl overflow-hidden transition-all duration-200 ${
                active ? "ring-4 ring-offset-2 ring-white shadow-xl scale-105" : "shadow-md"
              }`}
              style={{ background: meta.previewBg }}
            >
              {/* Preview card */}
              <div className="p-4 text-center">
                <div className="text-3xl mb-1">{meta.emoji}</div>
                <p className="font-fredoka font-bold text-sm" style={{ color: meta.previewText }}>
                  {meta.name}
                </p>
                <p className="text-[10px] font-bold opacity-70 mt-0.5" style={{ color: meta.previewText }}>
                  {meta.desc}
                </p>
              </div>

              {/* Active check */}
              {active && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center shadow-md"
                >
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
