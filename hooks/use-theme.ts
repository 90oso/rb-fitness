'use client';
import { useEffect, useSyncExternalStore } from 'react';
import {
  readThemePreference,
  resolveTheme,
  setThemePreference,
  subscribeTheme,
  syncThemeColor,
  type ResolvedTheme,
  type ThemePreference,
} from '@/lib/theme';

const serverPreference = (): ThemePreference => 'light';
const serverResolved = (): ResolvedTheme => 'light';
const clientResolved = (): ResolvedTheme => resolveTheme(readThemePreference());

export function useTheme() {
  const preference = useSyncExternalStore(subscribeTheme, readThemePreference, serverPreference);
  const resolved = useSyncExternalStore(subscribeTheme, clientResolved, serverResolved);
  // The inline boot script sets data-theme before paint; this keeps the status-bar color in step with it.
  useEffect(() => syncThemeColor(resolved), [resolved]);
  const toggle = () => setThemePreference(resolved === 'dark' ? 'light' : 'dark');
  return { preference, resolved, setPreference: setThemePreference, toggle };
}
