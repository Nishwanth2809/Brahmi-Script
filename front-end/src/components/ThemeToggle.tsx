import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-6 right-6 z-50 group"
      aria-label="Toggle theme"
    >
      <div className="relative w-12 h-12 rounded-full glass-card flex items-center justify-center transition-all duration-500 hover:glow-gold hover:scale-110 active:scale-95">
        <Sun
          className={`w-5 h-5 text-gold absolute transition-all duration-500 ${
            theme === "light"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 rotate-90 scale-0"
          }`}
        />
        <Moon
          className={`w-5 h-5 text-gold absolute transition-all duration-500 ${
            theme === "dark"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-0"
          }`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
