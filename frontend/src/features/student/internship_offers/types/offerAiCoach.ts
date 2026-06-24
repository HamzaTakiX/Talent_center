export interface OfferComparisonBreakdown {
  skills?: number;
  location?: number;
  experience?: number;
  education?: number;
  domain?: number;
  languages?: number;
}

export interface OfferComparisonData {
  offer_uuid: string;
  offer_title: string;
  company: string;
  overall_match_percent: number;
  profile_match_percent: number;
  cv_match_percent: number;
  has_cv_analysis: boolean;
  is_eligible: boolean;
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  matched_skills: string[];
  missing_skills: string[];
  breakdown: OfferComparisonBreakdown;
  provider: string;
}

export interface OfferInterviewQuestion {
  id: string;
  text: string;
  category: 'behavioral' | 'technical' | 'offer' | 'motivation' | string;
  hint?: string;
}

export interface OfferInterviewSession {
  session_id: string;
  offer_uuid: string;
  offer_title: string;
  company: string;
  questions: OfferInterviewQuestion[];
  total_questions: number;
  provider: string;
}

export interface OfferInterviewAnswerFeedback {
  score: number;
  wentWell: string[];
  needsImprovement: string[];
  suggestedAnswer: string;
  tips: string[];
}

export interface OfferInterviewEvaluation {
  question_id: string;
  feedback: OfferInterviewAnswerFeedback;
  provider: string;
}
