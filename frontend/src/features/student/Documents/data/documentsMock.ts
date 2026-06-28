import { Calendar, CheckCircle2, Clock, FileText } from 'lucide-react';
import { SERVICE_CATALOG_MOCK } from '../../../admin/Documents_admin/data/serviceCatalogDefaults';
import type { DocumentsStatIconKey, DocumentsStatItem } from '../types';

export const documentsStatIconMap: Record<DocumentsStatIconKey, typeof FileText> = {
  total: FileText,
  pending: Clock,
  validated: CheckCircle2,
  reserved: Calendar,
};

export const documentsStatColorMap: Record<DocumentsStatIconKey, string> = {
  total: 'bg-[#2b7fff]',
  pending: 'bg-[#a855f7]',
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
