export interface EngagementMetrics {
  views: number;
  clicks: number;
  saves: number;
  engagementRate: number;
  clickThroughRate: number;
}

export interface EngagementHealth {
  score: number;
  trend: 'up' | 'down' | 'flat';
  delta: number;
}

export interface EngagementTrends {
  labels: string[];
  views: number[];
  clicks: number[];
  saves: number[];
}

export interface EngagementTopRow {
  id: string;
  title: string;
  views: number;
  clicks: number;
  saves: number;
  typeCode: string;
  typeName?: string;
  ctr: number;
  saveRate?: number;
  engagementScore: number;
  recommendationScore: number;
  audienceReach: number;
  trend: 'up' | 'down' | 'flat';
}

export interface EngagementFunnelStage {
  key: string;
  value: number;
  rate: number;
}

export interface EngagementAudienceSegment {
  key: string;
  label: string;
  value: number;
}

export interface EngagementHeatmapCell {
  weekday: number;
  bucket: number;
  value: number;
}

export interface EngagementDashboardData {
  metrics: EngagementMetrics;
  summary: {
    activeCount: number;
    internshipOffersCount: number;
    totalViews: number;
  };
  health: EngagementHealth;
  trends: EngagementTrends;
  typeDistribution: { code: string; name: string; count: number }[];
  topByEngagement: EngagementTopRow[];
  recommendation: {
    averageScore: number;
    recommendedCount: number;
    totalScores: number;
  };
  funnel: EngagementFunnelStage[];
  audienceSegments: EngagementAudienceSegment[];
  heatmap: { cells: EngagementHeatmapCell[]; max: number };
  topCategory?: { code: string; name: string; count: number } | null;
}

export interface EngagementFilters {
  range: '7d' | '14d' | '30d' | '90d';
  program: string;
  type: string;
  engagementType: string;
  audience: string;
}

export const DEFAULT_ENGAGEMENT_FILTERS: EngagementFilters = {
  range: '14d',
  program: 'all',
  type: 'all',
  engagementType: 'all',
  audience: 'all',
};
