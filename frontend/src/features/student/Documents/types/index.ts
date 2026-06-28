import type { DocumentServiceCatalogItem } from '../../../admin/Documents_admin/types/documentServiceCatalog';

export type { DocumentServiceCatalogItem };

export type DocumentsStatIconKey = 'total' | 'pending' | 'validated' | 'reserved';

export interface StudentDocumentsStats {
  total: number;
  pending: number;
  validated: number;
  reserved: number;
}

export interface StudentDocumentsOverviewResponse {
  stats: StudentDocumentsStats;
  catalog: DocumentServiceCatalogItem[];
}

export interface DocumentsStatItem {
  label: string;
  value: string;
  subtitle: string;
  iconKey: DocumentsStatIconKey;
}
