import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useState } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [animating, setAnimating] = useState(false);

  const handleToggle = () => {
    setAnimating(true);
    toggleTheme();
    setTimeout(() => setAnimating(false), 500);
  };

  return (
    <button
      onClick={handleToggle}
      className="relative p-2 rounded-xl bg-secondary/60 hover:bg-secondary transition-all duration-300 group"
      aria-label="Toggle theme"
    >
      <div className={`transition-transform duration-500 ${animating ? "animate-theme-toggle" : ""}`}>
        {theme === "light" ? (
          <Moon className="h-5 w-5 text-foreground/70 group-hover:text-foreground transition-colors" />
        ) : (
          <Sun className="h-5 w-5 text-foreground/70 group-hover:text-foreground transition-colors" />
        )}
      </div>
    </button>
  );
}
