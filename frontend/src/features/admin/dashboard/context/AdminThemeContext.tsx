import {
  createContext,
  FunctionComponent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type AdminTheme = 'light' | 'dark';

interface AdminThemeContextValue {
  theme: AdminTheme;
  toggleTheme: () => void;
  setTheme: (theme: AdminTheme) => void;
}

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

const STORAGE_KEY = 'admin-dashboard-theme';
const TRANSITION_CLASS = 'admin-theme-transitioning';
/** Must exceed `--admin-theme-duration` (200ms) so descendant color transitions stay frozen. */
const THEME_TRANSITION_MS = 250;

let themeTransitionTimer: ReturnType<typeof window.setTimeout> | undefined;

const readStoredTheme = (): AdminTheme => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const syncThemeAttributes = (theme: AdminTheme): void => {
  const root = document.documentElement;
  root.setAttribute('data-admin-theme', theme);
  root.style.colorScheme = theme;

  document.querySelectorAll('[data-admin-theme]').forEach((node) => {
    if (node !== root) node.setAttribute('data-admin-theme', theme);
  });
  document.querySelectorAll('[data-auth-theme]').forEach((node) => {
    node.setAttribute('data-auth-theme', theme);
  });
};

/**
 * Apply theme in the same turn as the click.
 * Tokens are defined only on <html>, so one attribute change drives the whole tree.
 */
const applyDomTheme = (theme: AdminTheme, withTransition: boolean): void => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (withTransition && !prefersReducedMotion()) {
    root.classList.add(TRANSITION_CLASS);
    window.clearTimeout(themeTransitionTimer);
    themeTransitionTimer = window.setTimeout(() => {
      root.classList.remove(TRANSITION_CLASS);
      themeTransitionTimer = undefined;
    }, THEME_TRANSITION_MS);
  }

  syncThemeAttributes(theme);

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* private mode / blocked storage */
  }
};

export const AdminThemeProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AdminTheme>(() => {
    const initial = readStoredTheme();
    applyDomTheme(initial, false);
    return initial;
  });

  useEffect(() => {
    applyDomTheme(readStoredTheme(), false);
  }, []);

  const setTheme = useCallback((next: AdminTheme) => {
    setThemeState((current) => {
      if (current === next) return current;
      applyDomTheme(next, true);
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: AdminTheme = current === 'light' ? 'dark' : 'light';
      applyDomTheme(next, true);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme, setTheme }), [theme, toggleTheme, setTheme]);

  return <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>;
};

export const useAdminTheme = (): AdminThemeContextValue => {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) {
    throw new Error('useAdminTheme must be used within AdminThemeProvider');
  }
  return ctx;
};
