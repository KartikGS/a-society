import { useCallback, useEffect, useState } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'a-society-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

function readStoredPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Storage unavailable; fall through to system.
  }
  return 'system';
}

function resolveTheme(preference: ThemePreference): 'light' | 'dark' {
  if (preference === 'system') {
    return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
  }
  return preference;
}

/**
 * Owns the data-theme attribute on <html>. The pre-paint script in index.html
 * stamps the initial value; this hook keeps it in sync with the user's
 * preference and, in system mode, with OS theme changes.
 */
export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>(readStoredPreference);

  useEffect(() => {
    document.documentElement.dataset.theme = resolveTheme(preference);
    if (preference !== 'system') return;

    const media = window.matchMedia(DARK_QUERY);
    const onChange = () => {
      document.documentElement.dataset.theme = resolveTheme('system');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference): void => {
    setPreferenceState(next);
    try {
      if (next === 'system') window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable; the in-memory preference still applies.
    }
  }, []);

  return { preference, setPreference };
}
