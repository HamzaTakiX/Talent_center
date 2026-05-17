import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type FunctionComponent,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminTheme } from '../../dashboard/context/AdminThemeContext';
import { addRecentSearch, recordVisitedSection } from '../utils/searchStorage';
import { scrollToSearchTarget } from '../utils/scrollToTarget';
import type { AdminSearchItem } from '../types';

interface AdminGlobalSearchContextValue {
  selectItem: (item: AdminSearchItem, query?: string) => void;
  registerFocusHandler: (handler: () => void) => () => void;
}

const AdminGlobalSearchContext = createContext<AdminGlobalSearchContextValue | null>(null);

export const useAdminGlobalSearchContext = (): AdminGlobalSearchContextValue => {
  const ctx = useContext(AdminGlobalSearchContext);
  if (!ctx) {
    throw new Error('useAdminGlobalSearchContext must be used within AdminGlobalSearchProvider');
  }
  return ctx;
};

interface AdminGlobalSearchProviderProps {
  children: ReactNode;
}

export const AdminGlobalSearchProvider: FunctionComponent<AdminGlobalSearchProviderProps> = ({
  children,
}) => {
  const focusHandlerRef = useRef<(() => void) | null>(null);
  const navigate = useNavigate();
  const { toggleTheme } = useAdminTheme();

  const registerFocusHandler = useCallback((handler: () => void) => {
    focusHandlerRef.current = handler;
    return () => {
      if (focusHandlerRef.current === handler) {
        focusHandlerRef.current = null;
      }
    };
  }, []);

  const focusSearch = useCallback(() => {
    focusHandlerRef.current?.();
  }, []);

  const selectItem = useCallback(
    (item: AdminSearchItem, query?: string) => {
      if (query?.trim()) addRecentSearch(query);
      recordVisitedSection(item.id);

      if (item.actionId === 'toggle-theme') {
        toggleTheme();
        return;
      }

      if (item.path) {
        const needsSettingsTab =
          item.sectionId?.startsWith('settings-') && !item.path.includes('#');
        navigate(needsSettingsTab ? `${item.path}#settings` : item.path);
        if (item.sectionId) {
          window.setTimeout(() => scrollToSearchTarget(item.sectionId!), needsSettingsTab ? 280 : 120);
        }
      }
    },
    [navigate, toggleTheme]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isK = e.key === 'k' || e.key === 'K';
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        e.stopPropagation();
        focusSearch();
        return;
      }
      if (e.key === '/') {
        const target = e.target as HTMLElement;
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return;
        e.preventDefault();
        focusSearch();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [focusSearch]);

  const value = useMemo(
    () => ({ selectItem, registerFocusHandler }),
    [selectItem, registerFocusHandler]
  );

  return (
    <AdminGlobalSearchContext.Provider value={value}>
      {children}
    </AdminGlobalSearchContext.Provider>
  );
};
