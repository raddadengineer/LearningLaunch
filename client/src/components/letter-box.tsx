import { Button } from "@/components/ui/button";

interface LetterBoxProps {
  letter: string;
  color: 'coral' | 'turquoise' | 'sunnyellow' | 'mintgreen' | 'skyblue' | 'funpink';
  onClick: () => void;
}

export default function LetterBox({ letter, color, onClick }: LetterBoxProps) {
  const colorClasses = {
    coral: 'bg-coral hover:bg-red-400',
    turquoise: 'bg-turquoise hover:bg-teal-400',
    sunnyellow: 'bg-sunnyellow hover:bg-yellow-400',
    mintgreen: 'bg-mintgreen hover:bg-green-400',
    skyblue: 'bg-skyblue hover:bg-blue-400',
    funpink: 'bg-funpink hover:bg-pink-400',
  };

  return (
    <Button
      onClick={onClick}
      className={`
        ${colorClasses[color]} 
        text-white text-6xl font-fredoka w-20 h-20 
        rounded-2xl cursor-pointer hover:scale-110 
        transition-all duration-200 touch-friendly
        shadow-lg hover:shadow-xl
      `}
    >
      {letter}
    </Button>
  );
}
