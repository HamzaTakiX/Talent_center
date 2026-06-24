import { fetchCvIntelligenceInternshipMatchesSafe } from '../../../../cv/api/cvIntelligenceApi';
import type { CvInternshipMatch } from '../types/cvAnalysisDashboard';

export function buildCvInternshipMatchMap(matches: CvInternshipMatch[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const match of matches) {
    if (match.id) {
      map.set(match.id, match.matchPercent);
    }
  }
  return map;
}

export function getCvMatchPercent(matchMap: Map<string, number>, offerId: string): number {
  return matchMap.get(offerId) ?? 0;
}

export async function loadCvInternshipMatchMap(limit = 100): Promise<Map<string, number>> {
  const matches = await fetchCvIntelligenceInternshipMatchesSafe(limit);
  return buildCvInternshipMatchMap(matches);
}
