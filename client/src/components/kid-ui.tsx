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
        className="rounded-2xl kid-tap border-2 border-gray-200 bg-white hover:bg-gray-50 px-4"
        onTouchStart={() => speak(label, { rate: 0.85, pitch: 1.2 })}
      >
        <span className="text-2xl mr-1">🏠</span>
        <span className="font-fredoka text-lg font-bold text-gray-700">{label}</span>
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
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onTouchStart={() => speak(label, { rate: 0.85, pitch: 1.2 })}
      className={`${colorClass} kid-tile rounded-[2rem] p-6 kid-shadow text-center w-full transition-transform hover:scale-[1.02] active:scale-95`}
    >
      <div className="text-6xl mb-3">{emoji}</div>
      <h3 className="text-2xl font-fredoka font-bold text-gray-800">{title}</h3>
      {subtitle && (
        <p className="text-sm font-bold text-gray-600 mt-1">{subtitle}</p>
      )}
    </motion.button>
  );
}

type KidPageHeaderProps = {
  backHref?: string;
  backLabel?: string;
  title: string;
  emoji?: string;
  stars?: number;
  children?: ReactNode;
};

export function KidPageHeader({
  backHref = "/",
  backLabel = "Home",
  title,
  emoji,
  stars,
  children,
}: KidPageHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-white kid-shadow sticky top-0 z-50 gap-2">
      <KidBackButton href={backHref} label={backLabel} />
      <div className="text-center flex-1 min-w-0">
        <h2 className="text-xl sm:text-2xl font-fredoka text-gray-800 truncate">
          {emoji && <span className="mr-1">{emoji}</span>}
          {title}
        </h2>
        {children}
      </div>
      {stars !== undefined ? (
        <div className="bg-sunnyellow px-3 py-2 rounded-2xl kid-shadow shrink-0">
          <span className="text-lg font-bold">⭐ {stars}</span>
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

export function KidBigAction({ emoji, label, onClick, className = "bg-coral text-white" }: KidBigActionProps) {
  return (
    <Button
      onClick={onClick}
      onTouchStart={() => speak(label, { rate: 0.85, pitch: 1.2 })}
      className={`${className} kid-tap rounded-2xl font-fredoka text-xl font-bold w-full py-6 btn-pressable`}
    >
      <span className="text-2xl mr-2">{emoji}</span>
      {label}
    </Button>
  );
}

export function ParentLink() {
  return (
    <Link href="/parent-dashboard">
      <button
        type="button"
        className="text-xs font-bold text-gray-400 hover:text-gray-600 underline underline-offset-2"
      >
        Grown-ups 👨‍👩‍👧
      </button>
    </Link>
  );
}
