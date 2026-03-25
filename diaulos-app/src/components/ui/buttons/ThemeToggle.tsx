// components/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { MoonFilledIcon, SunFilledIcon } from "@/components/icons";
import { setTheme } from "@/app/actions/theme";

export default function ThemeToggle() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  // Read current theme from the <html> element on mount
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  async function handleToggle() {
    const next = isDark ? "light" : "dark";
    setIsDark(!isDark);

    // Optimistically update DOM (prevents any flicker)
    document.documentElement.className = next;
    document.documentElement.setAttribute("data-theme", next);

    await setTheme(next);
    router.refresh();
  }

  return (
    <Button
      isIconOnly
      variant="outline"
      size="lg"
      onPress={handleToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="dark:hidden">
        <MoonFilledIcon size={6} />
      </div>
      <div className="hidden dark:inline-block">
        <SunFilledIcon size={6} />
      </div>
    </Button>
  );
}
