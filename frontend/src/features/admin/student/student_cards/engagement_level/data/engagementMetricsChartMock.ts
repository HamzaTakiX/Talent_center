export interface EngagementChartSeries {
  key: string;
  label: string;
  color: string;
  values: number[];
}

export const engagementChartLabels = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'] as const;

export const engagementChartSeries: EngagementChartSeries[] = [
  {
    key: 'activity',
    label: 'Activity score',
    color: '#2563eb',
    values: [72, 74, 75, 77, 78, 80, 82],
  },
  {
    key: 'participation',
    label: 'Participation rate',
    color: '#8b5cf6',
    values: [65, 68, 70, 72, 74, 77, 80],
  },
  {
    key: 'logins',
    label: 'Weekly active users',
    color: '#06b6d4',
    values: [58, 60, 63, 66, 68, 70, 73],
  },
];

export const ENGAGEMENT_CHART_MAX = 100;
