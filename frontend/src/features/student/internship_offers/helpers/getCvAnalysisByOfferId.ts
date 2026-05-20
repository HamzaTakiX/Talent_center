import { cvAnalysisByOfferId } from '../data/cvAnalysisMock';
import type { CvAnalysisResult } from '../types/cvAnalysis';

export function getCvAnalysisByOfferId(offerId: string | undefined): CvAnalysisResult | undefined {
  if (!offerId) return undefined;
  return cvAnalysisByOfferId[offerId];
}
