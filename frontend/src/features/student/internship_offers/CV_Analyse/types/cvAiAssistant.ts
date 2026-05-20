export interface CvAiAssistantCvSummary {
  fileName: string;
  updatedLabel: string;
}

export interface CvAiAssistantAnalysisMessage {
  intro: string;
  scorePercent: number;
  strengthsTitle: string;
  strengths: string[];
  improvementsTitle: string;
  improvements: string[];
  closing: string;
}
