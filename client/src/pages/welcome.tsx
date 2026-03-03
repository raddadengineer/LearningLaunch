import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Welcome() {
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
      <motion.div
        className="container mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <motion.h1
            className="text-7xl font-fredoka text-white mb-4 drop-shadow-xl"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            🎓 KidLearn
          </motion.h1>
          <p className="text-3xl font-bold text-white drop-shadow-md mb-8">
            Fun Learning Adventures for Kids Ages 4-5!
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Reading Section */}
            <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="h-full">
              <Card className="rounded-[2.5rem] p-8 kid-shadow bg-white/95 backdrop-blur-sm h-full flex flex-col justify-between">
                <div className="text-center">
                  <motion.div
                    className="text-6xl mb-4"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >📚</motion.div>
                  <h2 className="text-4xl font-fredoka text-coral mb-4">Reading Fun</h2>
                  <p className="text-xl text-gray-700 font-bold mb-6">
                    Learn letters, words, and simple sentences with colorful pictures and sounds!
                  </p>
                  <ul className="text-left text-gray-600 font-bold space-y-3 text-lg">
                    <li>✨ Letter recognition and phonics</li>
                    <li>✨ Word building with pictures</li>
                    <li>✨ Simple sentence reading</li>
                    <li>✨ 6 progressive levels</li>
                  </ul>
                </div>
              </Card>
            </motion.div>

            {/* Math Section */}
            <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="h-full">
              <Card className="rounded-[2.5rem] p-8 kid-shadow bg-white/95 backdrop-blur-sm h-full flex flex-col justify-between">
                <div className="text-center">
                  <motion.div
                    className="text-6xl mb-4"
                    whileHover={{ rotate: [0, 10, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >🔢</motion.div>
                  <h2 className="text-4xl font-fredoka text-turquoise mb-4">Math Magic</h2>
                  <p className="text-xl text-gray-700 font-bold mb-6">
                    Count, add, and solve problems with colorful numbers and fun activities!
                  </p>
                  <ul className="text-left text-gray-600 font-bold space-y-3 text-lg">
                    <li>✨ Number counting (1-20)</li>
                    <li>✨ Basic addition problems</li>
                    <li>✨ Visual math with objects</li>
                    <li>✨ 6 skill-building levels</li>
                  </ul>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Features */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-[2.5rem] p-8 kid-shadow bg-white/95 backdrop-blur-sm mb-12">
              <div className="text-center">
                <h2 className="text-4xl font-fredoka text-mintgreen mb-8">Why Kids Love KidLearn</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-5xl mb-4">🎨</div>
                    <h3 className="text-xl font-fredoka text-gray-800 mb-2">Colorful & Fun</h3>
                    <p className="text-gray-600 font-bold">Bright colors and friendly design</p>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl mb-4 animate-bounce-gentle">⭐</div>
                    <h3 className="text-xl font-fredoka text-gray-800 mb-2">Earn Stars</h3>
                    <p className="text-gray-600 font-bold">Collect stars to track progress</p>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl mb-4">🏆</div>
                    <h3 className="text-xl font-fredoka text-gray-800 mb-2">Parent Dashboard</h3>
                    <p className="text-gray-600 font-bold">Monitor learning achievements</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="text-center space-y-6">
            <div>
              <Link href="/select-user">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                  <Button className="bg-coral hover:bg-coral/90 border-coral/80 text-white text-3xl px-12 py-8 rounded-[2rem] font-fredoka shadow-xl">
                    🎮 Start Learning!
                  </Button>
                </motion.div>
              </Link>
            </div>
            <p className="text-white text-xl font-bold bg-black/20 rounded-full px-6 py-2 inline-block">
              Choose an existing profile or create a new one!
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}