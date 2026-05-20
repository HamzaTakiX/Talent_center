import type { ReportSectionStatus } from '../types';

export const reportSectionStatusLabels: Record<ReportSectionStatus, string> = {
  complete: 'Complet',
  draft: 'Brouillon',
  empty: 'Vide',
};

export const reportSectionStatusBadgeClass: Record<ReportSectionStatus, string> = {
  complete: 'bg-emerald-50 text-emerald-700',
  draft: 'bg-[#fef9c2] text-[#854d0e]',
  empty: 'bg-[var(--admin-surface-inset)] text-[#6b7280]',
};

export const reportSectionStatusSubtitle: Record<ReportSectionStatus, string> = {
  complete: 'Section complète',
  draft: 'Section en cours',
  empty: 'Section vide',
};
