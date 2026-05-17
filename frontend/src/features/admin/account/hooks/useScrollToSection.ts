import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { AccountSectionId } from '../components/AccountSectionNav';

const SECTION_IDS: AccountSectionId[] = ['profile', 'settings'];

const parseHash = (hash: string): AccountSectionId => {
  const id = hash.replace('#', '') as AccountSectionId;
  return SECTION_IDS.includes(id) ? id : 'profile';
};

export const useScrollToSection = (ready: boolean) => {
  const { hash, pathname } = useLocation();
  const [activeSection, setActiveSection] = useState<AccountSectionId>(() => parseHash(hash));

  const scrollToSection = useCallback((id: AccountSectionId, behavior: ScrollBehavior = 'smooth') => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior, block: 'start' });
      setActiveSection(id);
      window.history.replaceState(null, '', `${pathname}#${id}`);
    }
  }, [pathname]);

  useEffect(() => {
    if (!ready) return;
    const id = parseHash(hash);
    setActiveSection(id);
    const t = window.setTimeout(() => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => window.clearTimeout(t);
  }, [hash, ready]);

  return { activeSection, scrollToSection, setActiveSection };
};
