/** KPI accent tones aligned with Admin/Student `adminKpiTones`. */
export type EncadrantKpiTone = 'blue' | 'red' | 'orange' | 'green' | 'gray' | 'purple';

export const ENCADRANT_KPI_TONES: Record<EncadrantKpiTone, { accent: string; bg: string }> = {
  blue: { accent: 'var(--admin-brand)', bg: 'var(--admin-brand-muted)' },
  red: { accent: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)' },
  orange: { accent: '#d97706', bg: 'rgba(217, 119, 6, 0.1)' },
  green: { accent: '#059669', bg: 'rgba(5, 150, 105, 0.1)' },
  gray: { accent: '#64748b', bg: 'rgba(100, 116, 139, 0.12)' },
  purple: { accent: 'var(--admin-brand)', bg: 'var(--admin-brand-muted)' },
};

export function encadrantKpiTone(tone: string): { accent: string; bg: string } {
  return ENCADRANT_KPI_TONES[tone as EncadrantKpiTone] ?? ENCADRANT_KPI_TONES.blue;
}
