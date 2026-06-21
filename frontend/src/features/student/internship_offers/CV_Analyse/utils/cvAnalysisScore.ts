import type { CvScoreTone } from '../types/cvAnalysisDashboard';

export function getScoreTone(score: number): CvScoreTone {
  if (score < 50) return 'low';
  if (score <= 70) return 'medium';
  return 'high';
}

export function getScoreColorVar(tone: CvScoreTone): string {
  switch (tone) {
    case 'low':
      return 'var(--cva-score-low)';
    case 'medium':
      return 'var(--cva-score-medium)';
    default:
      return 'var(--cva-score-high)';
  }
}
