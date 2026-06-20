import { Button } from "@/components/ui/button";

interface PhonicsBoxProps {
  chunk: string;
  color: 'coral' | 'turquoise' | 'sunnyellow' | 'mintgreen' | 'skyblue' | 'funpink';
  onClick: () => void;
  isActive?: boolean;
}

export default function PhonicsBox({ chunk, color, onClick, isActive = false }: PhonicsBoxProps) {
  const colorClasses = {
    coral: 'bg-coral hover:bg-red-400',
    turquoise: 'bg-turquoise hover:bg-teal-400',
    sunnyellow: 'bg-sunnyellow hover:bg-yellow-400',
    mintgreen: 'bg-mintgreen hover:bg-green-400',
    skyblue: 'bg-skyblue hover:bg-blue-400',
    funpink: 'bg-funpink hover:bg-pink-400',
  };

  const fontSize = chunk.length > 2 ? 'text-4xl' : 'text-5xl';
  const width = chunk.length > 2 ? 'w-24' : 'w-20';

  return (
    <Button
      onClick={onClick}
      className={`
        ${colorClasses[color]}
        ${width} h-20
        text-white ${fontSize} font-fredoka
        rounded-2xl cursor-pointer hover:scale-110
        transition-all duration-200 touch-friendly
        shadow-lg hover:shadow-xl
        ${isActive ? "ring-4 ring-white scale-125 shadow-2xl animate-pulse" : ""}
      `}
    >
      {chunk}
    </Button>
  );
}
