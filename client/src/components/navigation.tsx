import { Link, useLocation } from "wouter";
import { speak } from "@/lib/speech";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: "🏠", label: "Home", speak: "Home" },
    { path: "/books", icon: "📖", label: "Stories", speak: "Stories" },
    { path: "/reading", icon: "🔤", label: "Words", speak: "Words" },
    { path: "/math", icon: "🔢", label: "Math", speak: "Math" },
    { path: "/parent-settings", icon: "⚙️", label: "Grown-ups", speak: null },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-gray-100 px-1.5 py-3 z-40 safe-area-pb">
      <div className="flex justify-around items-stretch max-w-lg mx-auto gap-1">
        {navItems.map((item) => {
          const active = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <button
                type="button"
                onTouchStart={() => item.speak && speak(item.speak, { rate: 0.85, pitch: 1.2 })}
                className={`kid-nav-item flex flex-col items-center justify-center rounded-2xl px-1.5 py-2 transition-all ${
                  active
                    ? "bg-coral/15 text-coral scale-105 kid-shadow"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <span className="text-3xl leading-none mb-1">{item.icon}</span>
                <span className="text-xs font-fredoka font-bold">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
