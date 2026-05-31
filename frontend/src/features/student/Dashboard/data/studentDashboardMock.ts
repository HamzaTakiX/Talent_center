import type { LucideIcon } from 'lucide-react';
import { Send, Clock, Users, CheckCircle2, XCircle } from 'lucide-react';

export interface StudentStatItem {
  labelKey: 'applicationsSent' | 'pending' | 'interviews' | 'accepted' | 'rejected';
  value: string;
  iconKey: 'sent' | 'pending' | 'interviews' | 'accepted' | 'rejected';
}

export const studentStatIconMap: Record<StudentStatItem['iconKey'], LucideIcon> = {
  sent: Send,
  pending: Clock,
  interviews: Users,
  accepted: CheckCircle2,
  rejected: XCircle,
};

export const studentStatColorMap: Record<StudentStatItem['iconKey'], string> = {
  sent: 'bg-[#2b7fff]',
  pending: 'bg-[#eab308]',
  interviews: 'bg-[#8b5cf6]',
  accepted: 'bg-[#22c55e]',
  rejected: 'bg-[#fb2c36]',
};

export const studentDashboardStats: StudentStatItem[] = [
  { labelKey: 'applicationsSent', value: '12', iconKey: 'sent' },
  { labelKey: 'pending', value: '7', iconKey: 'pending' },
  { labelKey: 'interviews', value: '3', iconKey: 'interviews' },
  { labelKey: 'accepted', value: '3', iconKey: 'accepted' },
  { labelKey: 'rejected', value: '2', iconKey: 'rejected' },
];

export type SmartAlertVariant = 'warning' | 'info' | 'success';

export interface StudentSmartAlert {
  id: string;
  variant: SmartAlertVariant;
}

export const studentSmartAlerts: StudentSmartAlert[] = [
  { id: '1', variant: 'warning' },
  { id: '2', variant: 'info' },
  { id: '3', variant: 'success' },
];

export interface StudentRecommendedOffer {
  id: string;
  tagKeys: string[];
  matchPercent: number;
}

export const studentRecommendedOffers: StudentRecommendedOffer[] = [
  { id: 'o1', tagKeys: ['marketing', 'digital', 'strategy'], matchPercent: 95 },
  { id: 'o2', tagKeys: ['analytics', 'business', 'data'], matchPercent: 88 },
  { id: 'o3', tagKeys: ['branding', 'marketing', 'consumer'], matchPercent: 85 },
];

export interface StudentAnnouncementRow {
  id: string;
  badgeVariant: 'interview' | 'pending' | 'info';
}

export const studentAnnouncementRows: StudentAnnouncementRow[] = [
  { id: 'a1', badgeVariant: 'interview' },
  { id: 'a2', badgeVariant: 'pending' },
];

export interface StudentProgressMetric {
  key: 'profile' | 'cv' | 'activity';
  percent: number;
  barClass: string;
}

export const studentProgressMetrics: StudentProgressMetric[] = [
  { key: 'profile', percent: 85, barClass: 'bg-[#2b7fff]' },
  { key: 'cv', percent: 82, barClass: 'bg-[#1d4ed8]' },
  { key: 'activity', percent: 90, barClass: 'bg-[#8b5cf6]' },
];

export type StudentActivityIconKey = 'message' | 'application' | 'announcement';

export interface StudentActivityItem {
  id: string;
  iconKey: StudentActivityIconKey;
}

export const studentDashboardHeroMetrics = {
  profileCompletion: 85,
  cvScore: 82,
  readiness: 78,
  applicationsWeek: 4,
};

/** Données d’affichage pour les mini-widgets analytics du hero (mock UI). */
export const studentHeroWidgetData = {
  profile: {
    percent: 85,
    trendPercent: 12,
    completedSections: 6,
    totalSections: 9,
    checklist: [
      { key: 'photo', done: true },
      { key: 'experience', done: true },
      { key: 'skills', done: false },
    ] as const,
    sparkline: [62, 68, 71, 74, 78, 82, 85],
  },
  cv: {
    percent: 82,
    weeklyDelta: 5,
    percentile: 74,
    segments: [
      { key: 'ats', value: 88 },
      { key: 'visibility', value: 79 },
      { key: 'skills', value: 84 },
      { key: 'keywords', value: 76 },
    ] as const,
    sparkline: [70, 72, 74, 76, 78, 80, 82],
  },
  readiness: {
    percent: 78,
    recruiterMatch: 72,
    missingCount: 2,
    stageIndex: 2,
    stages: ['profile', 'cv', 'apply'] as const,
    requirements: [
      { key: 'cvUploaded', done: true },
      { key: 'preferences', done: false },
    ] as const,
  },
  applications: {
    weekTotal: 4,
    responseRate: 68,
    trendPercent: 18,
    sparkline: [0, 1, 2, 1, 3, 2, 4],
    ratio: { accepted: 3, pending: 7, rejected: 2 },
  },
};

export const studentActivityChartData = {
  applications: [2, 1, 3, 2, 4, 0, 1],
  profileViews: [5, 8, 6, 9, 12, 3, 7],
  messages: [1, 2, 1, 3, 2, 0, 1],
};

export const studentRecentActivity: StudentActivityItem[] = [
  { id: 'r1', iconKey: 'message' },
  { id: 'r2', iconKey: 'application' },
  { id: 'r3', iconKey: 'announcement' },
];
