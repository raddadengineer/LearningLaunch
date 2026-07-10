import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { speak } from "@/lib/speech";
import { KidHelpButton } from "@/components/kid-ui";
import { HELP_WELCOME } from "@/lib/page-help";

export default function Welcome() {
  const [, setLocation] = useLocation();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.18 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.45 } },
  };

  return (
    <div className="min-h-screen animated-mesh-bg flex flex-col justify-center py-12 relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="orb w-72 h-72 bg-white top-[-60px] left-[-60px]" />
      <div className="orb w-56 h-56 bg-yellow-200 bottom-[80px] right-[-40px]" />
      <div className="orb w-40 h-40 bg-white/50 top-[40%] left-[5%]" />

      {/* Help button */}
      <div className="fixed top-4 right-4 z-50">
        <KidHelpButton helpText={HELP_WELCOME} />
      </div>

      <motion.div
        className="container mx-auto px-6 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Mascot */}
        <motion.div variants={itemVariants} className="text-center mb-2">
          <motion.div
            className="inline-block relative"
            animate={{ y: [0, -14, 0] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
          >
            {/* Glow halo */}
            <div className="absolute inset-0 scale-150 rounded-full bg-white/30 blur-2xl" />
            <span className="text-[100px] leading-none relative z-10 drop-shadow-lg">🦉</span>
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.h1
            className="text-6xl sm:text-7xl font-fredoka text-white drop-shadow-xl mb-3"
            style={{ textShadow: "0 4px 24px rgba(0,0,0,0.18)" }}
          >
            LearningLaunch
          </motion.h1>
          <p className="text-2xl font-bold text-white/90 drop-shadow-md">
            Let's learn and play! 🎉
          </p>
        </motion.div>

        {/* CTA button */}
        <motion.div variants={itemVariants} className="text-center">
          <motion.div
            whileTap={{ scale: 0.93 }}
            whileHover={{ scale: 1.04 }}
            className="inline-block"
          >
            <Button
              onClick={() => setLocation("/select-user")}
              onTouchStart={() => speak("Let's go!", { rate: 0.85, pitch: 1.2 })}
              className="bg-white text-coral text-3xl px-14 py-8 rounded-[2.5rem] font-fredoka shadow-2xl touch-friendly btn-pressable kid-tap border-b-[6px] border-white/50 shine-sweep relative overflow-hidden"
              style={{ minWidth: "280px" }}
            >
              Let's Go! 🎮
            </Button>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-white/90 text-base font-bold mt-5 bg-black/15 backdrop-blur-sm rounded-full px-6 py-2.5 inline-block"
          >
            Tap to pick your name
          </motion.p>
        </motion.div>

        {/* Decorative stars */}
        {["✨", "⭐", "🌟", "💫"].map((star, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl pointer-events-none select-none"
            style={{
              top: `${[15, 65, 20, 75][i]}%`,
              left: `${[8, 5, 88, 85][i]}%`,
            }}
            animate={{
              y: [0, -12, 0],
              rotate: [0, 20, -20, 0],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              repeat: Infinity,
              duration: 2.5 + i * 0.4,
              delay: i * 0.3,
            }}
          >
            {star}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}