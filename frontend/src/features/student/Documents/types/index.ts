import type { LucideIcon } from 'lucide-react';

export type DocumentsStatIconKey = 'total' | 'pending' | 'validated' | 'reserved';

export type DocumentCatalogBadgeType = 'auto' | 'reservation';

export type DocumentCategoryKey = 'administrative' | 'internship' | 'academic' | 'financial';

export interface DocumentsStatItem {
  label: string;
  value: string;
  subtitle: string;
  iconKey: DocumentsStatIconKey;
}

export interface DocumentCatalogItem {
  id: string;
  title: string;
  categoryKey: DocumentCategoryKey;
  delayLabel: string;
  requirement: string;
  badgeType: DocumentCatalogBadgeType;
}

export type ResolvedDocumentCatalogItem = DocumentCatalogItem & { category: string };
