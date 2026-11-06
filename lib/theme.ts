/**
 * Theme is a device preference, not account data: it lives in localStorage and is applied
 * before the first paint by the inline script in app/layout.tsx, so there is no theme flash.
 */
export type ThemePreference = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

export const THEME_KEY = 'rb-theme';

/** Browser/status-bar color per theme (<meta name="theme-color">), so the installed app matches the chosen theme. */
export const THEME_COLORS: Record<ResolvedTheme, string> = { light: '#e8e8e8', dark: '#0a0a0a' };

/** Runs in <head> before hydration. Keep it dependency-free and tiny. */
export const themeBootScript = `(function(){try{var p=localStorage.getItem('${THEME_KEY}');var t=p==='light'||p==='dark'?p:p==='system'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

const listeners = new Set<() => void>();
let mediaQuery: MediaQueryList | null = null;

function media(): MediaQueryList | null {
  if (typeof window === 'undefined' || !window.matchMedia) return null;
  if (!mediaQuery) mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  return mediaQuery;
}

/** Default is light; dark and system are opt-in per device. */
export function readThemePreference(): ThemePreference {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    return stored === 'dark' || stored === 'system' ? stored : 'light';
  } catch {
    return 'light';
  }
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') return media()?.matches ? 'dark' : 'light';
  return preference;
}

export function syncThemeColor(theme: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((meta) => meta.setAttribute('content', THEME_COLORS[theme]));
}

export function applyTheme(theme: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;
  syncThemeColor(theme);
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
