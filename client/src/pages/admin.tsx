import { useEffect } from "react";
import { useLocation } from "wouter";

/** Redirect legacy /admin URL to unified grown-ups settings */
export default function Admin() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/parent-settings?tab=words");
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Redirecting to settings...</p>
    </div>
  );
}
