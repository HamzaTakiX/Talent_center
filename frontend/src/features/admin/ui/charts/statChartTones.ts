import type { StatPageChartId } from './types';
import type { StatChartConfig } from './statPageChartData';

/**
 * Teinte principale par graphique — alignée sur la carte KPI / dashboard de la page.
 * Les barres et lignes mono-série utilisent cette couleur ; les donuts multi-segments gardent leurs couleurs sémantiques.
 */
export const STAT_CHART_PRIMARY_ACCENT: Partial<Record<StatPageChartId, string>> = {
  'students-total-enrollment': '#2563eb',
  'students-without-internship': '#ea580c',
  'students-with-internship': '#2563eb',
  'offers-active-companies': '#2563eb',
  'offers-expired-timeline': '#dc2626',
  'offers-draft-monthly': '#d97706',
  'offers-closed-reasons': '#64748b',
  'offers-applications-volume': '#2563eb',
  'srf-unpaid-amounts': '#dc2626',
  'srf-pending-queue': '#2563eb',
  'srf-late-timeline': '#dc2626',
  'srf-blocked-trend': '#7c3aed',
  'encadrants-department-load': '#7c3aed',
  'encadrants-top-assigned': '#7c3aed',
  'encadrants-meetings-weekly': '#0891b2',
  'documents-pending-age': '#d97706',
  'documents-validated-trend': '#059669',
  'documents-rejected-reasons': '#dc2626',
  'history-total-actions': '#2563eb',
  'history-students': '#7c3aed',
  'history-applications': '#ea580c',
  'history-srf': '#dc2626',
  'history-documents': '#d97706',
  'history-chat': '#0d9488',
  'dashboard-encadrants-dept': '#7c3aed',
  'dashboard-without-internship': '#ea580c',
  'dashboard-active-offers-apps': '#4f46e5',
  'dashboard-ongoing-funnel': '#0891b2',
  'dashboard-documents-pending': '#d97706',
  'dashboard-srf-unpaid': '#e11d48',
};

export function applyChartPageTones(chartId: StatPageChartId, config: StatChartConfig): StatChartConfig {
  const accent = STAT_CHART_PRIMARY_ACCENT[chartId];
  if (!accent) return config;

  return {
    ...config,
    series: config.series?.map((s) =>
      config.series!.length === 1 ? { ...s, color: accent } : s
    ),
  };
}
