import { Calendar, CheckCircle2, Clock, FileText } from 'lucide-react';
import { SERVICE_CATALOG_MOCK } from '../../../admin/Documents_admin/data/serviceCatalogDefaults';
import type { DocumentsStatIconKey, DocumentsStatItem } from '../types';

export const documentsStatIconMap: Record<DocumentsStatIconKey, typeof FileText> = {
  total: FileText,
  pending: Clock,
  validated: CheckCircle2,
  reserved: Calendar,
};

/** Accents style admin students KPI (glass + pie). */
export const documentsStatAccentMap: Record<
  DocumentsStatIconKey,
  { accent: string; accentBg: string }
> = {
  total: { accent: '#3b82f6', accentBg: 'rgba(59, 130, 246, 0.16)' },
  pending: { accent: '#f59e0b', accentBg: 'rgba(245, 158, 11, 0.16)' },
  validated: { accent: '#22c55e', accentBg: 'rgba(34, 197, 94, 0.16)' },
  reserved: { accent: '#6366f1', accentBg: 'rgba(99, 102, 241, 0.16)' },
};

/** @deprecated Prefer documentsStatAccentMap for admin-style KPI cards. */
export const documentsStatColorMap: Record<DocumentsStatIconKey, string> = {
  total: 'bg-[#3b82f6]',
  pending: 'bg-[#f59e0b]',
  validated: 'bg-[#22c55e]',
  reserved: 'bg-[#6366f1]',
};

export const documentsStats: DocumentsStatItem[] = [
  {
    label: 'Total Requests',
    value: '24',
    subtitle: 'Toutes demandes',
    iconKey: 'total',
  },
  {
    label: 'Pending Requests',
    value: '7',
    subtitle: 'En cours de traitement',
    iconKey: 'pending',
  },
  {
    label: 'Validated Documents',
    value: '15',
    subtitle: 'Documents validés',
    iconKey: 'validated',
  },
  {
    label: 'Reserved Requests',
    value: '2',
    subtitle: 'Créneaux réservés',
    iconKey: 'reserved',
  },
];

/** Catalogue étudiant — mêmes services que l’admin, filtrés visibilité. */
export const documentCatalogItems = SERVICE_CATALOG_MOCK.filter(
  (service) => service.visibleToStudents && service.isActive,
);
