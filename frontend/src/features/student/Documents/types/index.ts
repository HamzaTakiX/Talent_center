import type { LucideIcon } from 'lucide-react';

export type DocumentsStatIconKey = 'total' | 'pending' | 'validated' | 'reserved';

export type DocumentCatalogBadgeType = 'auto' | 'reservation';

export interface DocumentsStatItem {
  label: string;
  value: string;
  subtitle: string;
  iconKey: DocumentsStatIconKey;
}

export interface DocumentCatalogItem {
  id: string;
  title: string;
  category: string;
  delayLabel: string;
  requirement: string;
  badgeType: DocumentCatalogBadgeType;
}
