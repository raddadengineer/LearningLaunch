import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coral via-turquoise to-sunnyellow">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-fredoka text-white mb-4 drop-shadow-lg">
            🎓 KidLearn
          </h1>
          <p className="text-2xl text-white drop-shadow-md mb-8">
            Fun Learning Adventures for Kids Ages 4-5!
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Reading Section */}
            <Card className="rounded-3xl p-8 kid-shadow bg-white/95 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-6xl mb-4">📚</div>
                <h2 className="text-3xl font-fredoka text-coral mb-4">Reading Fun</h2>
                <p className="text-gray-700 mb-6">
                  Learn letters, words, and simple sentences with colorful pictures and sounds!
                </p>
                <ul className="text-left text-gray-600 space-y-2">
                  <li>• Letter recognition and phonics</li>
                  <li>• Word building with pictures</li>
                  <li>• Simple sentence reading</li>
                  <li>• 6 progressive levels</li>
                </ul>
              </div>
            </Card>

            {/* Math Section */}
            <Card className="rounded-3xl p-8 kid-shadow bg-white/95 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-6xl mb-4">🔢</div>
                <h2 className="text-3xl font-fredoka text-turquoise mb-4">Math Magic</h2>
                <p className="text-gray-700 mb-6">
                  Count, add, and solve problems with colorful numbers and fun activities!
                </p>
                <ul className="text-left text-gray-600 space-y-2">
                  <li>• Number counting (1-20)</li>
                  <li>• Basic addition problems</li>
                  <li>• Visual math with objects</li>
                  <li>• 6 skill-building levels</li>
                </ul>
              </div>
            </Card>
          </div>

          {/* Features */}
          <Card className="rounded-3xl p-8 kid-shadow bg-white/95 backdrop-blur-sm mb-12">
            <div className="text-center">
              <h2 className="text-3xl font-fredoka text-mintgreen mb-6">Why Kids Love KidLearn</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎨</div>
                  <h3 className="font-bold text-gray-800 mb-2">Colorful & Fun</h3>
                  <p className="text-gray-600 text-sm">Bright colors and friendly design made just for kids</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">⭐</div>
                  <h3 className="font-bold text-gray-800 mb-2">Earn Stars</h3>
                  <p className="text-gray-600 text-sm">Collect stars for completing activities and track progress</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🏆</div>
                  <h3 className="font-bold text-gray-800 mb-2">Parent Dashboard</h3>
                  <p className="text-gray-600 text-sm">Parents can monitor learning progress and achievements</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <div className="space-x-4">
              <Link href="/select-user">
                <Button className="bg-coral hover:bg-coral/90 text-white text-xl px-8 py-4 rounded-2xl kid-shadow">
                  🎮 Start Learning
                </Button>
              </Link>
            </div>
            <p className="text-white/80 text-sm">
              Choose an existing profile or create a new one to begin the adventure!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}