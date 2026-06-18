'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * A 3-way theme toggle: Light → Dark → System → Light.
 * Cycles on each click and shows the icon for the *current* resolved theme.
 *
 * Uses next-themes for persistence (writes to localStorage) and SSR-safe
 * hydration (the `mounted` gate prevents a flash of the wrong icon).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Avoid hydration mismatch: render a stable placeholder on the server
  // and only swap to the real icon after mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const cycle = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      className={cn('h-9 w-9 rounded-full', className)}
      aria-label="Toggle theme"
      title={
        !mounted
          ? 'Toggle theme'
          : `Theme: ${theme} (click to switch)`
      }
    >
      {!mounted ? (
        <span className="h-4 w-4" />
      ) : theme === 'light' ? (
        <Sun className="h-4 w-4" />
      ) : theme === 'dark' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Monitor className="h-4 w-4" />
      )}
    </Button>
  );
}
