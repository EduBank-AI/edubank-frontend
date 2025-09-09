"use client";

import { useTheme } from "next-themes";
import { Switch } from "~/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function Footer() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by ensuring component mounted before rendering theme toggle
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <footer className="border-t border-gray-400 dark:border-gray-800 pt-7 text-sm text-center text-zinc-400 relative bg-transparent">
      <div className="mx-auto max-w-5xl relative pb-2">
        <div className="absolute right-20 flex items-center space-x-2">
          <Sun size={18} />
          <Switch
            checked={currentTheme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            className="cursor-pointer"
          />
          <Moon size={18} />
        </div>
        <p>&copy; 2025 EduBank.AI</p>
      </div>
    </footer>
  );
}
