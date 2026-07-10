import { Link } from "wouter";
import { motion } from "framer-motion";
import { speak } from "@/lib/speech";
import { ReactNode } from "react";
import { useTheme, getTileStyle, TileVariant } from "@/lib/theme";

/* ─────────────────────────────────────────────
   KidBackButton
───────────────────────────────────────────────*/
type KidBackButtonProps = { href?: string; label?: string };

export function KidBackButton({ href = "/", label = "Home" }: KidBackButtonProps) {
  return (
    <Link href={href}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.93 }}
        className="theme-back-btn kid-tap rounded-2xl px-4 flex items-center gap-1.5 font-fredoka font-bold text-base transition-all duration-150"
        onTouchStart={() => speak(label, { rate: 0.85, pitch: 1.2 })}
      >
        <span className="text-xl leading-none">🏠</span>
        <span>{label}</span>
      </motion.button>
    </Link>
  );
}

/* ─────────────────────────────────────────────
   KidActivityTile  — fully theme-aware
───────────────────────────────────────────────*/
type KidActivityTileProps = {
  emoji: string;
  title: string;
  subtitle?: string;
  colorClass?: string; // legacy – ignored (variant takes precedence)
  variant?: TileVariant;
  onClick: () => void;
  speakLabel?: string;
};

export function KidActivityTile({
  emoji,
  title,
  subtitle,
  variant = "default",
  onClick,
  speakLabel,
}: KidActivityTileProps) {
  const { theme } = useTheme();
  const label = speakLabel ?? title;
  const s = getTileStyle(theme, variant);

  /* ── Space: glowing planet circle ── */
  if (theme === "space") {
    return (
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.06 }}
        onClick={onClick}
        onTouchStart={() => speak(label, { rate: 0.85, pitch: 1.2 })}
        className="kid-tile w-full flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          borderRadius: "50%",
          background: s.bg,
          border: `3px solid ${s.border}`,
          boxShadow: s.shadow,
          aspectRatio: "1",
          minHeight: 0,
        }}
      >
        {/* inner highlight */}
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.28), transparent 60%)" }} />
        {/* orbit ring */}
        <div className="absolute inset-[-6px] rounded-full" style={{ border: `1.5px dashed ${s.border}`, opacity: 0.45 }} />
        <motion.div
          className="text-4xl sm:text-5xl mb-1.5 relative z-10"
          animate={{ rotate: [0, -6, 6, 0] }}
          transition={{ repeat: Infinity, duration: 4, repeatDelay: 2 }}
        >
          {emoji}
        </motion.div>
        <span className="font-fredoka font-bold text-lg sm:text-xl relative z-10 text-center px-2 leading-tight" style={{ color: s.text, textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
          {title}
        </span>
        {subtitle && <span className="text-[11px] font-bold relative z-10 mt-0.5" style={{ color: s.subtext }}>{subtitle}</span>}
      </motion.button>
    );
  }

  /* ── Forest: painted wooden panel ── */
  if (theme === "forest") {
    return (
      <motion.button
        type="button"
        whileTap={{ scale: 0.94, y: 3 }}
        whileHover={{ scale: 1.03, y: -2 }}
        onClick={onClick}
        onTouchStart={() => speak(label, { rate: 0.85, pitch: 1.2 })}
        className="kid-tile w-full flex flex-col items-center justify-center relative overflow-visible"
        style={{
          background: s.bg,
          border: `4px solid ${s.border}`,
          boxShadow: `5px 5px 0 ${s.shadow}`,
          borderRadius: "22px",
        }}
      >
        {/* top banner stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-[18px]" style={{ background: s.border }} />
        <motion.div
          className="text-5xl mb-2 mt-2 relative z-10"
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ repeat: Infinity, duration: 5, repeatDelay: 3 }}
        >
          {emoji}
        </motion.div>
        <span className="font-fredoka font-bold text-xl text-center px-2 leading-tight" style={{ color: s.text }}>
          {title}
        </span>
        {subtitle && <span className="text-xs font-bold mt-1" style={{ color: s.subtext }}>{subtitle}</span>}
      </motion.button>
    );
  }

  /* ── Arcade: chunky 3D press button ── */
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95, y: 4 }}
      whileHover={{ scale: 1.04, y: -2 }}
      onClick={onClick}
      onTouchStart={() => speak(label, { rate: 0.85, pitch: 1.2 })}
      className="kid-tile w-full flex flex-col items-center justify-center relative overflow-hidden arcade-btn"
      style={{
        background: s.bg,
        border: `4px solid rgba(0,0,0,0.3)`,
        borderBottomWidth: "8px",
        boxShadow: "0 4px 0 rgba(0,0,0,0.15)",
        borderRadius: "20px",
      }}
    >
      {/* shine */}
      <div className="absolute top-0 left-0 right-0 h-1/3 rounded-t-[16px]" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.25), transparent)" }} />
      <motion.div
        className="text-5xl mb-1.5 relative z-10"
        whileHover={{ rotate: [-5, 5, -5, 0] }}
        transition={{ duration: 0.4 }}
      >
        {emoji}
      </motion.div>
      <span className="font-fredoka font-bold text-xl uppercase tracking-wide relative z-10 text-center px-2 leading-tight drop-shadow-sm" style={{ color: s.text }}>
        {title}
      </span>
      {subtitle && <span className="text-xs font-bold mt-0.5 relative z-10" style={{ color: s.subtext }}>{subtitle}</span>}
    </motion.button>
  );
}

/* ─────────────────────────────────────────────
   KidHelpButton
───────────────────────────────────────────────*/
type KidHelpButtonProps = { helpText: string; className?: string };

export function KidHelpButton({ helpText, className = "" }: KidHelpButtonProps) {
  const { theme } = useTheme();

  const bg =
    theme === "space"  ? "rgba(255,255,255,0.1)"  :
    theme === "forest" ? "#FFFBEB"                 :
                         "rgba(255,255,255,0.15)";
  const border =
    theme === "space"  ? "rgba(160,130,255,0.35)" :
    theme === "forest" ? "#D97706"                 :
                         "rgba(255,255,255,0.6)";

  return (
    <motion.button
      type="button"
      aria-label="Help"
      whileTap={{ scale: 0.9 }}
      onClick={() => speak(helpText, { rate: 0.85, pitch: 1.2 })}
      onTouchStart={() => speak("Help", { rate: 0.85, pitch: 1.2 })}
      className={`kid-tap w-12 h-12 flex items-center justify-center shrink-0 rounded-2xl ${className}`}
      style={{ background: bg, border: `2px solid ${border}`, backdropFilter: "blur(12px)" }}
    >
      <motion.span
        className="text-2xl leading-none"
        animate={{ rotate: [0, -8, 8, 0] }}
        transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
      >
        🦉
      </motion.span>
    </motion.button>
  );
}

/* ─────────────────────────────────────────────
   KidPageHeader
───────────────────────────────────────────────*/
type KidPageHeaderProps = {
  backHref?: string;
  backLabel?: string;
  title: string;
  emoji?: string;
  stars?: number;
  helpText?: string;
  children?: ReactNode;
};

export function KidPageHeader({ backHref = "/", backLabel = "Home", title, emoji, stars, helpText, children }: KidPageHeaderProps) {
  const { theme } = useTheme();
  const hasRight = helpText || stars !== undefined;

  const titleColor =
    theme === "space"  ? "text-white"   :
    theme === "forest" ? "text-amber-900" :
                         "text-yellow-300";

  return (
    <div className="theme-header flex items-center justify-between p-3 sm:p-4 sticky top-0 z-50 gap-2">
      <KidBackButton href={backHref} label={backLabel} />
      <div className="text-center flex-1 min-w-0">
        <h2 className={`text-xl sm:text-2xl font-fredoka truncate ${titleColor}`}>
          {emoji && <span className="mr-1.5">{emoji}</span>}
          {title}
        </h2>
        {children}
      </div>
      {hasRight ? (
        <div className="flex items-center gap-2 shrink-0">
          {helpText && <KidHelpButton helpText={helpText} />}
          {stars !== undefined && <StarsBadge count={stars} />}
        </div>
      ) : (
        <div className="w-[76px] shrink-0" />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   StarsBadge
───────────────────────────────────────────────*/
export function StarsBadge({ count }: { count: number }) {
  const { theme } = useTheme();
  const style =
    theme === "space"  ? { background: "rgba(251,191,36,0.2)", border: "1.5px solid rgba(251,191,36,0.5)", color: "#fbbf24" } :
    theme === "forest" ? { background: "#FEF3C7", border: "3px solid #D97706", color: "#78350F", boxShadow: "2px 2px 0 #92400E" } :
                         { background: "#FFE600", border: "3px solid rgba(0,0,0,0.3)", color: "#12082E", boxShadow: "0 4px 0 rgba(0,0,0,0.25)" };
  return (
    <div className="px-3 py-2 rounded-2xl shrink-0 font-bold font-fredoka text-base" style={style}>
      ⭐ {count}
    </div>
  );
}

/* ─────────────────────────────────────────────
   KidBigAction
───────────────────────────────────────────────*/
type KidBigActionProps = { emoji: string; label: string; onClick: () => void; className?: string };

export function KidBigAction({ emoji, label, onClick, className }: KidBigActionProps) {
  const { theme } = useTheme();

  const defaultStyle =
    theme === "space"  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white"    :
    theme === "forest" ? "bg-amber-500 text-white"                                        :
                         "bg-yellow-400 text-gray-900 font-black uppercase tracking-wide";

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      onTouchStart={() => speak(label, { rate: 0.85, pitch: 1.2 })}
      className={`${className ?? defaultStyle} kid-tap rounded-2xl font-fredoka text-xl font-bold w-full py-5 shine-sweep relative overflow-hidden shadow-lg ${
        theme === "arcade" ? "arcade-btn" : "btn-pressable border-b-[5px]"
      }`}
    >
      <span className="text-2xl mr-2">{emoji}</span>
      {label}
    </motion.button>
  );
}

/* ─────────────────────────────────────────────
   ParentLink
───────────────────────────────────────────────*/
export function ParentLink() {
  const { theme } = useTheme();
  const style =
    theme === "space"  ? "text-white/60 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20" :
    theme === "forest" ? "text-amber-800 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 border-2 border-amber-300" :
                         "text-white/80 hover:text-white bg-white/15 hover:bg-white/25 border border-white/30";
  return (
    <Link href="/parent-settings">
      <button type="button" className={`text-xs font-bold px-4 py-2 rounded-full transition-all duration-200 ${style}`}>
        Grown-ups 👨‍👩‍👧 Settings
      </button>
    </Link>
  );
}
