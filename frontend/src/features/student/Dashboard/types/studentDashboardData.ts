import type { StudentStatItem } from '../data/studentDashboardMock';

export type StudentActivityIconKey = 'message' | 'application' | 'announcement';

export interface StudentDashboardAlert {
  id: string;
  variant: 'warning' | 'info' | 'success';
  message: string;
  cta: string;
  href: string;
}

export interface StudentDashboardProgressMetric {
  key: 'profile' | 'cv' | 'activity';
  percent: number;
  barClass: string;
}

export interface StudentDashboardActivityItem {
  id: string;
  iconKey: StudentActivityIconKey;
  action: string;
  time: string;
}

export interface StudentHeroProfileWidget {
  percent: number;
  trendPercent: number;
  completedSections: number;
  totalSections: number;
  checklist: { key: 'photo' | 'experience' | 'skills'; done: boolean }[];
  sparkline: number[];
}

export interface StudentHeroCvWidget {
  percent: number;
  weeklyDelta: number;
  percentile: number;
  segments: { key: 'ats' | 'visibility' | 'skills' | 'keywords'; value: number }[];
  sparkline: number[];
}

export interface StudentHeroReadinessWidget {
  percent: number;
  recruiterMatch: number;
  missingCount: number;
  stageIndex: number;
  stages: ('profile' | 'cv' | 'apply')[];
  requirements: { key: 'cvUploaded' | 'preferences'; done: boolean }[];
}

export interface StudentHeroApplicationsWidget {
  weekTotal: number;
  responseRate: number;
  trendPercent: number;
  sparkline: number[];
  ratio: { accepted: number; pending: number; rejected: number };
}

export interface StudentDashboardChartData {
  applications: number[];
  profileViews: number[];
  messages: number[];
}

export interface StudentDashboardViewModel {
  stats: StudentStatItem[];
  hero: {
    profile: StudentHeroProfileWidget;
    cv: StudentHeroCvWidget;
    readiness: StudentHeroReadinessWidget;
    applications: StudentHeroApplicationsWidget;
  };
  chart: StudentDashboardChartData;
  alerts: StudentDashboardAlert[];
  progress: StudentDashboardProgressMetric[];
  recentActivity: StudentDashboardActivityItem[];
}
