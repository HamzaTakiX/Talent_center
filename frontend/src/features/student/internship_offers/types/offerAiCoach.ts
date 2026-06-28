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

export interface InterviewSessionTurn {
  question_uuid: string;
  order: number;
  question: string;
  category: string;
  is_follow_up: boolean;
  answer: string;
  score?: number | null;
  strengths?: string[];
  weaknesses?: string[];
  ideal_answer?: string;
}

export interface InterviewSessionState {
  session_uuid: string;
  status: string;
  mode: 'profile' | 'offer';
  offer_uuid: string | null;
  external_offer_url?: string;
  language: string;
  duration_seconds: number;
  configuration: {
    difficulty: 'easy' | 'medium' | 'hard';
    duration_minutes: number;
    communication_mode: 'text' | 'voice' | 'voice_text';
    interview_type: 'hr' | 'technical' | 'behavioral' | 'case_study' | 'mixed';
    recruiter_profile: string;
  };
  turns: InterviewSessionTurn[];
  created_at: string;
}

export interface InterviewSessionStartResponse extends InterviewSessionState {
  requires_missing_fields?: boolean;
  missing_fields?: string[];
  extracted_offer?: Record<string, unknown>;
  session_id?: string;
  questions?: OfferInterviewQuestion[];
  total_questions?: number;
}

export interface InterviewLiveEvaluation {
  overall_score: number;
  communication: number;
  confidence: number;
  technical_knowledge: number;
  problem_solving: number;
  professionalism: number;
  soft_skills: number;
  language_quality: number;
  answer_relevance: number;
  strengths: string[];
  weaknesses: string[];
  missing_skills: string[];
  ideal_answer: string;
  improvement_tips: string[];
  readiness: string;
}

export interface InterviewAnswerResponse extends InterviewSessionState {
  latest_evaluation?: InterviewLiveEvaluation;
  next_question_uuid?: string | null;
}

export interface InterviewSessionCompleteResponse {
  session: InterviewSessionState;
  final_evaluation: {
    overall_score: number;
    communication_score: number;
    technical_score: number;
    confidence_score: number;
    professionalism_score: number;
    problem_solving_score: number;
    strengths: string[];
    weaknesses: string[];
    missing_skills: string[];
    ideal_answers: string[];
    improvement_recommendations: string[];
    interview_readiness: string;
  };
  report?: InterviewSimulationReport;
}

export interface InterviewReportCategory {
  id: string;
  label: string;
  score: number;
  delta: number;
}

export interface InterviewSpeechMetric {
  id: string;
  label: string;
  score: number;
  assessment?: string;
  trend?: 'up' | 'down' | 'neutral';
  detail?: string;
}

export interface InterviewReportTimelineItem {
  order: number;
  question: string;
  answer: string;
  score: number | null;
  strengths: string[];
  weaknesses: string[];
  ideal_answer: string;
}

export interface InterviewSimulationReport {
  overall_score: number;
  readiness_key: string;
  readiness_text: string;
  role_label: string;
  categories: InterviewReportCategory[];
  speech_metrics: InterviewSpeechMetric[];
  strengths: string[];
  weaknesses: string[];
  missing_skills: string[];
  recommendations: string[];
  timeline: InterviewReportTimelineItem[];
  communication_score: number;
  technical_score: number;
  confidence_score: number;
  professionalism_score: number;
  problem_solving_score: number;
  llm_provider?: string;
  answers_analyzed: number;
  insufficient_data?: boolean;
}

export interface InterviewSessionListItem {
  session_uuid: string;
  mode: 'profile' | 'offer' | string;
  status: 'draft' | 'in_progress' | 'completed' | 'abandoned' | string;
  score: number | null;
  language: string;
  created_at: string;
  completed_at?: string | null;
  duration_seconds: number;
  difficulty?: 'easy' | 'medium' | 'hard' | string;
  interview_type?: 'hr' | 'technical' | 'behavioral' | 'case_study' | 'mixed' | string;
  role_label?: string;
  readiness_text?: string;
  has_report?: boolean;
  answers_count?: number;
}

export interface InterviewHubStats {
  avg_overall_score: number;
  avg_preparation_score: number;
  avg_communication_score: number;
  avg_technical_score: number;
  avg_confidence_score: number;
  completion_rate: number;
  session_count: number;
  completed_count: number;
  analytics: {
    avg_score: number[];
    confidence: number[];
    technical: number[];
    completion: number[];
  };
}

export interface InterviewSessionDetailResponse extends InterviewSessionState {
  report?: InterviewSimulationReport;
  final_evaluation?: InterviewSessionCompleteResponse['final_evaluation'];
}
