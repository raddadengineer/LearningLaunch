import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { speak } from "@/lib/speech";
import { ReactNode } from "react";

type KidBackButtonProps = {
  href?: string;
  label?: string;
};

export function KidBackButton({ href = "/", label = "Home" }: KidBackButtonProps) {
  return (
    <Link href={href}>
      <Button
        variant="outline"
        className="rounded-2xl kid-tap border-2 border-white/80 bg-white/70 hover:bg-white shadow-sm backdrop-blur-sm px-4 gap-1.5"
        onTouchStart={() => speak(label, { rate: 0.85, pitch: 1.2 })}
      >
        <span className="text-xl leading-none">🏠</span>
        <span className="font-fredoka text-base font-bold text-gray-700">{label}</span>
      </Button>
    </Link>
  );
}

type KidActivityTileProps = {
  emoji: string;
  title: string;
  subtitle?: string;
  colorClass: string;
  onClick: () => void;
  speakLabel?: string;
};

export function KidActivityTile({
  emoji,
  title,
  subtitle,
  colorClass,
  onClick,
  speakLabel,
}: KidActivityTileProps) {
  const label = speakLabel ?? title;
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.93 }}
      whileHover={{ scale: 1.03, y: -2 }}
      onClick={onClick}
      onTouchStart={() => speak(label, { rate: 0.85, pitch: 1.2 })}
      className={`${colorClass} kid-tile rounded-[1.75rem] p-5 kid-shadow-strong text-center w-full transition-colors duration-200 relative overflow-hidden`}
    >
      {/* Soft inner highlight */}
      <div className="absolute inset-0 rounded-[1.75rem] bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

      <motion.div
        className="text-5xl mb-2.5 relative z-10"
        whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
        transition={{ duration: 0.4 }}
      >
        {emoji}
      </motion.div>
      <h3 className="text-2xl font-fredoka font-bold text-gray-800 relative z-10 leading-tight">{title}</h3>
      {subtitle && (
        <p className="text-xs font-bold text-gray-600/80 mt-1 relative z-10">{subtitle}</p>
      )}
    </motion.button>
  );
}

type KidHelpButtonProps = {
  helpText: string;
  className?: string;
};

export function KidHelpButton({ helpText, className = "" }: KidHelpButtonProps) {
  return (
    <motion.button
      type="button"
      aria-label="Help"
      whileTap={{ scale: 0.9 }}
      onClick={() => speak(helpText, { rate: 0.85, pitch: 1.2 })}
      onTouchStart={() => speak("Help", { rate: 0.85, pitch: 1.2 })}
      className={`kid-tap rounded-2xl glass-card hover:bg-white/90 w-12 h-12 flex items-center justify-center shrink-0 transition-all duration-200 ${className}`}
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

type KidPageHeaderProps = {
  backHref?: string;
  backLabel?: string;
  title: string;
  emoji?: string;
  stars?: number;
  helpText?: string;
  children?: ReactNode;
};

export function KidPageHeader({
  backHref = "/",
  backLabel = "Home",
  title,
  emoji,
  stars,
  helpText,
  children,
}: KidPageHeaderProps) {
  const hasRightContent = helpText || stars !== undefined;

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 glass-header sticky top-0 z-50 gap-2">
      <KidBackButton href={backHref} label={backLabel} />
      <div className="text-center flex-1 min-w-0">
        <h2 className="text-xl sm:text-2xl font-fredoka text-gray-800 truncate">
          {emoji && <span className="mr-1.5">{emoji}</span>}
          {title}
        </h2>
        {children}
      </div>
      {hasRightContent ? (
        <div className="flex items-center gap-2 shrink-0">
          {helpText && <KidHelpButton helpText={helpText} />}
          {stars !== undefined && (
            <div className="bg-gradient-to-br from-yellow-400 to-amber-500 px-3 py-2 rounded-2xl shadow-md shrink-0">
              <span className="text-base font-bold text-white drop-shadow-sm">⭐ {stars}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="w-[88px] shrink-0" />
      )}
    </div>
  );
}

type KidBigActionProps = {
  emoji: string;
  label: string;
  onClick: () => void;
  className?: string;
};

export function KidBigAction({ emoji, label, onClick, className = "bg-gradient-to-r from-coral to-peach text-white" }: KidBigActionProps) {
  return (
    <motion.div whileTap={{ scale: 0.97 }}>
      <Button
        onClick={onClick}
        onTouchStart={() => speak(label, { rate: 0.85, pitch: 1.2 })}
        className={`${className} kid-tap rounded-2xl font-fredoka text-xl font-bold w-full py-6 btn-pressable shine-sweep shadow-lg`}
      >
        <span className="text-2xl mr-2">{emoji}</span>
        {label}
      </Button>
    </motion.div>
  );
}

export function ParentLink() {
  return (
    <Link href="/parent-settings">
      <button
        type="button"
        className="text-xs font-bold text-gray-500 hover:text-gray-700 bg-white/60 hover:bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/70 shadow-sm transition-all duration-200"
      >
        Grown-ups 👨‍👩‍👧 Settings
      </button>
    </Link>
  );
}
