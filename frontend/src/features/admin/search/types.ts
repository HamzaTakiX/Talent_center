import type { LucideIcon } from 'lucide-react';

export type AdminSearchCategory =
  | 'page'
  | 'section'
  | 'card'
  | 'action'
  | 'setting'
  | 'navigation'
  | 'table'
  | 'form'
  | 'tab'
  | 'feature';

export type AdminSearchActionId = 'toggle-theme' | 'toggle-language';

export interface AdminSearchRegistryEntry {
  id: string;
  titleKey: string;
  subtitleKey?: string;
  /** Extra raw keywords for fuzzy matching (not translated) */
  keywords?: string[];
  category: AdminSearchCategory;
  path?: string;
  sectionId?: string;
  icon?: LucideIcon;
  priority?: number;
  actionId?: AdminSearchActionId;
}

export interface AdminSearchItem {
  id: string;
  title: string;
  subtitle?: string;
  category: AdminSearchCategory;
  path?: string;
  sectionId?: string;
  icon?: LucideIcon;
  priority: number;
  actionId?: AdminSearchActionId;
  score: number;
  matchedIndices: number[];
}

export interface AdminSearchGroup {
  category: AdminSearchCategory;
  label: string;
  items: AdminSearchItem[];
}

export const ADMIN_SEARCH_CATEGORY_ORDER: AdminSearchCategory[] = [
  'action',
  'page',
  'navigation',
  'section',
  'card',
  'table',
  'form',
  'tab',
  'setting',
  'feature',
];

export const RECENT_SEARCHES_KEY = 'admin-global-search-recents';
export const VISITED_SECTIONS_KEY = 'admin-global-search-visited';
export const MAX_RECENT_SEARCHES = 8;
export const MAX_VISITED = 12;
