"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Read theme from localStorage or document class
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
    } else if (document.documentElement.classList.contains("light")) {
      setTheme("light");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    
    // Apply classes
    const html = document.documentElement;
    if (next === "light") {
      html.classList.remove("dark");
      html.classList.add("light");
    } else {
      html.classList.remove("light");
      html.classList.add("dark");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
      aria-label="Toggle theme mode"
      id="theme-toggle-btn"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
