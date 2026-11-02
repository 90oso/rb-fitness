/**
 * Theme is a device preference, not account data: it lives in localStorage and is applied
 * before the first paint by the inline script in app/layout.tsx, so there is no dark→light flash.
 */
export type ThemePreference = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

export const THEME_KEY = 'rb-theme';

/** Runs in <head> before hydration. Keep it dependency-free and tiny. */
export const themeBootScript = `(function(){try{var p=localStorage.getItem('${THEME_KEY}');var t=p==='light'||p==='dark'?p:p==='system'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

const listeners = new Set<() => void>();
let mediaQuery: MediaQueryList | null = null;

function media(): MediaQueryList | null {
  if (typeof window === 'undefined' || !window.matchMedia) return null;
  if (!mediaQuery) mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
  return mediaQuery;
}

export function readThemePreference(): ThemePreference {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    return stored === 'light' || stored === 'system' ? stored : 'dark';
  } catch {
    return 'dark';
  }
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') return media()?.matches ? 'light' : 'dark';
  return preference;
}

export function applyTheme(theme: ResolvedTheme) {
  if (typeof document !== 'undefined') document.documentElement.dataset.theme = theme;
}

export function setThemePreference(preference: ThemePreference) {
  try {
    window.localStorage.setItem(THEME_KEY, preference);
  } catch {
    // Private mode or blocked storage: the choice still applies for this page load.
  }
  applyTheme(resolveTheme(preference));
  listeners.forEach((listener) => listener());
}

/** True when the user has never chosen a theme on this device. */
export function hasStoredThemePreference(): boolean {
  try {
    return window.localStorage.getItem(THEME_KEY) !== null;
  } catch {
    return false;
  }
}

/** useSyncExternalStore subscription: re-renders on explicit changes and on OS theme changes. */
export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  const onMedia = () => {
    if (readThemePreference() === 'system') applyTheme(resolveTheme('system'));
    listener();
  };
  media()?.addEventListener('change', onMedia);
  return () => {
    listeners.delete(listener);
    media()?.removeEventListener('change', onMedia);
  };
}
