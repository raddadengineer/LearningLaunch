interface ProgressBarProps {
  current: number;
  total: number;
  color: 'coral' | 'turquoise' | 'sunnyellow' | 'mintgreen';
}

export default function ProgressBar({ current, total, color }: ProgressBarProps) {
  const colorClasses = {
    coral: 'bg-coral',
    turquoise: 'bg-turquoise',
    sunnyellow: 'bg-sunnyellow',
    mintgreen: 'bg-mintgreen',
  };

  return (
    <div className="flex items-center justify-center mt-2">
      <div className="flex space-x-1">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              i < current ? colorClasses[color] : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
      <span className="ml-2 text-sm font-bold text-gray-600">
        {current}/{total}
      </span>
    </div>
  );
}
