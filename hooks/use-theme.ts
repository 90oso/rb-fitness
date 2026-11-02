'use client';
import { useSyncExternalStore } from 'react';
import {
  readThemePreference,
  resolveTheme,
  setThemePreference,
  subscribeTheme,
  type ResolvedTheme,
  type ThemePreference,
} from '@/lib/theme';

const serverPreference = (): ThemePreference => 'light';
const serverResolved = (): ResolvedTheme => 'light';
const clientResolved = (): ResolvedTheme => resolveTheme(readThemePreference());

export function useTheme() {
  const preference = useSyncExternalStore(subscribeTheme, readThemePreference, serverPreference);
  const resolved = useSyncExternalStore(subscribeTheme, clientResolved, serverResolved);
  const toggle = () => setThemePreference(resolved === 'dark' ? 'light' : 'dark');
  return { preference, resolved, setPreference: setThemePreference, toggle };
}
