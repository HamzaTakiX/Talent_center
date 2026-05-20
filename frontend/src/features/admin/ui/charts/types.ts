export interface AdminChartLegendItem {
  key: string;
  label: string;
  color: string;
  accent: string;
  accentBg: string;
  /** Valeur affichée à droite (ex. 42%, 892) */
  value?: string;
}

export interface AdminChartSeries {
  key: string;
  label: string;
  color: string;
  values: number[];
}

export interface AdminBarChartProps {
  labels: readonly string[];
  series: AdminChartSeries[];
  max?: number;
  stacked?: boolean;
  ariaLabel: string;
}

export interface AdminLineChartProps {
  labels: readonly string[];
  series: AdminChartSeries[];
  max?: number;
  showArea?: boolean;
  ariaLabel: string;
}

export interface AdminDonutSegment {
  key: string;
  label: string;
  value: number;
  color: string;
}

export interface AdminDonutChartProps {
  segments: AdminDonutSegment[];
  ariaLabel: string;
  /** Centre du donut (ex. total étudiants) quand ≠ somme des segments */
  centerTotal?: number;
  centerCaption?: string;
  /** Style analytics fin (traits légers, séparation nette, sans glow) */
  premiumGradients?: boolean;
}

export type StatPageChartId =
  | 'students-total-enrollment'
  | 'students-active-split'
  | 'students-without-internship'
  | 'students-with-internship'
  | 'students-engagement-distribution'
  | 'students-internship-split'
  | 'offers-all-status'
  | 'offers-active-companies'
  | 'offers-expired-timeline'
  | 'offers-draft-monthly'
  | 'offers-closed-reasons'
  | 'offers-applications-volume'
  | 'srf-paid-overview'
  | 'srf-unpaid-amounts'
  | 'srf-partially-paid'
  | 'srf-pending-queue'
  | 'srf-late-timeline'
  | 'srf-blocked-trend'
  | 'srf-exempted-reasons'
  | 'encadrants-department-load'
  | 'encadrants-top-assigned'
  | 'encadrants-reports-split'
  | 'encadrants-meetings-weekly'
  | 'announcements-type-mix'
  | 'announcements-active-split'
  | 'documents-status-mix'
  | 'documents-pending-age'
  | 'documents-validated-trend'
  | 'documents-rejected-reasons'
  | 'history-total-actions'
  | 'history-students'
  | 'history-applications'
  | 'history-srf'
  | 'history-documents'
  | 'history-chat'
  | 'dashboard-students-fields'
  | 'dashboard-encadrants-dept'
  | 'dashboard-admins-roles'
  | 'dashboard-without-internship'
  | 'dashboard-active-offers-apps'
  | 'dashboard-ongoing-funnel'
  | 'dashboard-documents-pending'
  | 'dashboard-srf-unpaid'
  | 'admins-role-distribution';
