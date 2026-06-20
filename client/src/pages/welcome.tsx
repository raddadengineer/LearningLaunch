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
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral via-turquoise to-sunnyellow flex flex-col justify-center py-12">
      <div className="fixed top-4 right-4 z-50">
        <KidHelpButton helpText={HELP_WELCOME} />
      </div>
      <motion.div
        className="container mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
          <motion.div variants={itemVariants} className="text-center">
            <motion.div
              className="text-8xl mb-6"
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              🦉
            </motion.div>
            <motion.h1
              className="text-5xl sm:text-6xl font-fredoka text-white mb-4 drop-shadow-xl"
            >
              LearningLaunch
            </motion.h1>
            <p className="text-2xl font-bold text-white drop-shadow-md mb-8">
              Let's learn and play!
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center">
            <motion.div whileTap={{ scale: 0.95 }} className="inline-block">
              <Button
                onClick={() => setLocation("/select-user")}
                onTouchStart={() => speak("Let's go!", { rate: 0.85, pitch: 1.2 })}
                className="bg-white text-coral text-3xl px-14 py-10 rounded-[2.5rem] font-fredoka shadow-xl touch-friendly btn-pressable kid-tap"
              >
                Let's Go! 🎮
              </Button>
            </motion.div>
            <p className="text-white text-lg font-bold mt-6 bg-black/20 rounded-full px-6 py-2 inline-block">
              Tap to pick your name
            </p>
          </motion.div>
      </motion.div>
    </div>
  );
}