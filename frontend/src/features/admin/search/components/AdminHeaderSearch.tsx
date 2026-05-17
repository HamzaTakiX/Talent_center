import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type FunctionComponent,
  type ReactNode,
  type RefObject,
} from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAdminGlobalSearchContext } from '../context/AdminGlobalSearchContext';
import { useAdminGlobalSearch } from '../hooks/useAdminGlobalSearch';
import type { AdminSearchGroup, AdminSearchItem } from '../types';
import AdminSearchDropdown from './AdminSearchDropdown';
import { clearRecentSearches } from '../utils/searchStorage';

const isDesktopViewport = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;

interface HeaderSearchContextValue {
  query: string;
  setQuery: (q: string) => void;
  setFocused: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  setRecentVersion: React.Dispatch<React.SetStateAction<number>>;
  dropdownOpen: boolean;
  listId: string;
  listRef: RefObject<HTMLDivElement | null>;
  desktopInputRef: RefObject<HTMLInputElement | null>;
  mobileInputRef: RefObject<HTMLInputElement | null>;
  results: AdminSearchGroup[];
  suggestedItems: AdminSearchItem[];
  recentQueries: string[];
  hasQuery: boolean;
  totalCount: number;
  handleSelect: (item: AdminSearchItem) => void;
  handleRecentClick: (q: string) => void;
  closeDropdown: () => void;
  focusActiveInput: () => void;
}

const HeaderSearchContext = createContext<HeaderSearchContextValue | null>(null);

const useHeaderSearch = (): HeaderSearchContextValue => {
  const ctx = useContext(HeaderSearchContext);
  if (!ctx) {
    throw new Error('Use AdminHeaderSearchProvider at header level');
  }
  return ctx;
};

/** Single state owner — wrap AdminHeader once */
export const AdminHeaderSearchProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const { selectItem, registerFocusHandler } = useAdminGlobalSearchContext();
  const listId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentVersion, setRecentVersion] = useState(0);

  const { results, flatResults, suggestedItems, recentQueries, hasQuery, totalCount } =
    useAdminGlobalSearch(query, recentVersion);

  const selectableItems = hasQuery ? flatResults : suggestedItems;
  const dropdownOpen = focused || mobileOpen || query.length > 0;

  const focusActiveInput = useCallback(() => {
    if (isDesktopViewport()) {
      desktopInputRef.current?.focus();
      desktopInputRef.current?.select();
      return;
    }
    setMobileOpen(true);
    requestAnimationFrame(() => {
      mobileInputRef.current?.focus();
      mobileInputRef.current?.select();
    });
  }, []);

  useEffect(() => registerFocusHandler(focusActiveInput), [registerFocusHandler, focusActiveInput]);

  const closeDropdown = useCallback(() => {
    setFocused(false);
    setMobileOpen(false);
    desktopInputRef.current?.blur();
    mobileInputRef.current?.blur();
  }, []);

  const handleSelect = useCallback(
    (item: AdminSearchItem) => {
      selectItem(item, query);
      setQuery('');
      closeDropdown();
    },
    [selectItem, query, closeDropdown]
  );

  const handleRecentClick = useCallback(
    (q: string) => {
      setQuery(q);
      setFocused(true);
      focusActiveInput();
    },
    [focusActiveInput]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!dropdownOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setQuery('');
        closeDropdown();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, Math.max(0, selectableItems.length - 1)));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter' && selectableItems[activeIndex]) {
        e.preventDefault();
        handleSelect(selectableItems[activeIndex]);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [dropdownOpen, activeIndex, selectableItems, handleSelect, closeDropdown]);

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const value: HeaderSearchContextValue = {
    query,
    setQuery,
    setFocused,
    mobileOpen,
    setMobileOpen,
    activeIndex,
    setActiveIndex,
    setRecentVersion,
    dropdownOpen,
    listId,
    listRef,
    desktopInputRef,
    mobileInputRef,
    results,
    suggestedItems,
    recentQueries,
    hasQuery,
    totalCount,
    handleSelect,
    handleRecentClick,
    closeDropdown,
    focusActiveInput,
  };

  return <HeaderSearchContext.Provider value={value}>{children}</HeaderSearchContext.Provider>;
};

const SearchField: FunctionComponent<{ inputRef: RefObject<HTMLInputElement | null> }> = ({
  inputRef,
}) => {
  const { t } = useTranslation();
  const { query, setQuery, setFocused, listId, dropdownOpen } = useHeaderSearch();
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  const modLabel = isMac ? '⌘' : 'Ctrl';

  return (
    <label className="admin-header-search-field">
      <Search className="admin-header-search-icon" strokeWidth={2} aria-hidden />
      <input
        ref={inputRef as React.Ref<HTMLInputElement>}
        type="text"
        inputMode="search"
        enterKeyHint="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder={t('admin.globalSearch.triggerPlaceholder')}
        className="admin-input admin-header-search-input"
        aria-label={t('admin.header.searchAdmin')}
        aria-controls={listId}
        aria-expanded={dropdownOpen}
        aria-autocomplete="list"
        autoComplete="off"
        spellCheck={false}
      />
      {query ? (
        <button
          type="button"
          className="admin-header-search-clear"
          onClick={() => {
            setQuery('');
            inputRef.current?.focus();
          }}
          aria-label={t('common.close')}
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      ) : (
        <span className="admin-header-search-kbd" aria-hidden>
          <kbd>{modLabel}</kbd>
          <kbd>K</kbd>
        </span>
      )}
    </label>
  );
};

const SearchDropdownPanel: FunctionComponent = () => {
  const ctx = useHeaderSearch();
  return (
    <AdminSearchDropdown
      open={ctx.dropdownOpen}
      listId={ctx.listId}
      listRef={ctx.listRef}
      query={ctx.query}
      hasQuery={ctx.hasQuery}
      totalCount={ctx.totalCount}
      results={ctx.results}
      suggestedItems={ctx.suggestedItems}
      recentQueries={ctx.recentQueries}
      activeIndex={ctx.activeIndex}
      onActiveIndexChange={ctx.setActiveIndex}
      onSelect={ctx.handleSelect}
      onRecentClick={ctx.handleRecentClick}
      onClearRecent={() => {
        clearRecentSearches();
        ctx.setRecentVersion((v) => v + 1);
      }}
    />
  );
};

export const AdminHeaderSearchDesktop: FunctionComponent = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const { desktopInputRef, closeDropdown } = useHeaderSearch();

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node) && isDesktopViewport()) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [closeDropdown]);

  return (
    <div ref={rootRef} className="admin-header-search relative w-full">
      <SearchField inputRef={desktopInputRef} />
      <SearchDropdownPanel />
    </div>
  );
};

export const AdminHeaderSearchMobile: FunctionComponent = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { mobileInputRef, mobileOpen, setMobileOpen, focusActiveInput, closeDropdown } =
    useHeaderSearch();

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node) && !isDesktopViewport()) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [closeDropdown]);

  return (
    <div ref={rootRef} className="admin-header-search admin-header-search--mobile">
      {!mobileOpen ? (
        <button
          type="button"
          onClick={() => {
            setMobileOpen(true);
            requestAnimationFrame(() => focusActiveInput());
          }}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[var(--admin-text-secondary)] transition-colors hover:bg-[var(--admin-brand-muted)] hover:text-[var(--admin-brand)]"
          aria-label={t('admin.globalSearch.open')}
        >
          <Search className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>
      ) : (
        <div className="admin-header-search-mobile-panel">
          <SearchField inputRef={mobileInputRef} />
          <SearchDropdownPanel />
        </div>
      )}
    </div>
  );
};

const AdminHeaderSearch: FunctionComponent = () => null;
export default AdminHeaderSearch;
