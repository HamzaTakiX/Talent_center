export interface CvAnalysisBulletItem {
  label: string;
  description?: string;
}

export interface CvAnalysisSubsection {
  title: string;
  items: CvAnalysisBulletItem[];
}

export interface CvAnalysisColumnData {
  matchingSkills?: CvAnalysisSubsection;
  relevantExperience?: CvAnalysisSubsection;
  missingSkills?: CvAnalysisSubsection;
  weakSections?: CvAnalysisSubsection;
  actionableSuggestions?: CvAnalysisSubsection;
  quickWins?: CvAnalysisSubsection;
}

export interface CvAnalysisResult {
  offerId: string;
  matchScore: number;
  strengths: CvAnalysisColumnData;
  weaknesses: CvAnalysisColumnData;
  improvements: CvAnalysisColumnData;
  overallAssessment: string;
  interviewProbability: number;
  potentialScore: number;
}
