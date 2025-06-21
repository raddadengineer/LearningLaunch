import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: "🏠", label: "Home" },
    { path: "/reading", icon: "📚", label: "Reading" },
    { path: "/math", icon: "🔢", label: "Math" },
    { path: "/parent-dashboard", icon: "📊", label: "Progress" },
    { path: "/select-user", icon: "👤", label: "Switch User" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-gray-100 p-4 z-40">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <Button
              variant="ghost"
              className={`flex flex-col items-center space-y-1 touch-friendly p-2 rounded-xl ${
                location === item.path ? "bg-blue-50 text-blue-600" : "text-gray-600"
              }`}
              onClick={() => {
                if (item.path === "/select-user") {
                  localStorage.removeItem("currentUserId");
                }
              }}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-bold">{item.label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  );
}
