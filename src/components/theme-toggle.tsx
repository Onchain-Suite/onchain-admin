"use client";

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground transition-colors hover:text-foreground"
    >
      {mounted && isDark ? (
        <SunIcon className="h-4 w-4" aria-hidden="true" />
      ) : (
        <MoonIcon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
