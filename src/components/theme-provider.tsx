'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

/**
 * Wraps the app with next-themes so that `dark` / `light` / `system`
 * modes work. We default to `dark` because the chatbot looks great on
 * the dark gradient, but the user can flip to `light` (or `system`)
 * at any time via the <ThemeToggle /> button in the header.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
