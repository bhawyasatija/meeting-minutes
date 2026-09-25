// File: src/features/settings/components/theme-section.tsx
// Purpose: a fuller 3-way theme picker (the header's ThemeToggle is just a quick light/dark
// flip). Preference is stored by next-themes (localStorage), same as the header toggle — there's
// no UserSettings.theme write here, deliberately: that column exists in the schema but nothing
// reads it yet, so wiring it up would be a feature with no consumer.
"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
] as const;

const subscribe = () => () => {};

export function ThemeSection() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = mounted && theme === value;
        return (
          <Button
            key={value}
            type="button"
            variant={active ? "default" : "outline"}
            size="sm"
            aria-pressed={active}
            onClick={() => setTheme(value)}
            className={cn(!active && "text-muted-foreground")}
          >
            <Icon /> {label}
          </Button>
        );
      })}
    </div>
  );
}
