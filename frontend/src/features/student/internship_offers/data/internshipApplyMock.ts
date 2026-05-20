/** Données mock candidature — remplaçables par l’API. */

export interface StudentCvFileMock {
  fileName: string;
  lastUpdated: string;
}

export const defaultStudentCvFile: StudentCvFileMock = {
  fileName: 'Sarah_Alami_CV_2026.pdf',
  lastUpdated: 'March 15, 2026',
};

export const cvEditorFeatureLabels = [
  'AI-powered content suggestions',
  (offerTitle: string) => `Professional templates optimized for ${offerTitle}`,
  'Real-time scoring and feedback',
] as const;

export function getCvEditorFeatures(offerTitle: string): string[] {
  return cvEditorFeatureLabels.map((item) =>
    typeof item === 'function' ? item(offerTitle) : item
  );
}
