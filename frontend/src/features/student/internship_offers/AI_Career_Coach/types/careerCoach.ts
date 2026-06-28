export type CoachMode =
  | 'career-coach'
  | 'cv-reviewer'
  | 'ats-expert'
  | 'interview-mentor'
  | 'internship-advisor';

export type MessageQuickAction =
  | 'apply'
  | 'generateExample'
  | 'explainMore'
  | 'rewriteSection'
  | 'actionPlan';

export interface CoachContextData {
  cvFileName: string;
  hasCv: boolean;
  hasAnalysis: boolean;
  cvScore: number;
  atsScore: number;
  lastAnalysis: string;
  readinessPercent: number;
  focusAreas: { id: string; labelKey: string }[];
  activeGoals: { id: string; labelKey: string; progress: number }[];
}

export interface StructuredListItem {
  textKey: string;
  tone: 'positive' | 'warning' | 'neutral';
}

export interface StructuredBlock {
  type: 'heading' | 'list' | 'actions' | 'improvement';
  titleKey: string;
  items?: StructuredListItem[];
  actionKeys?: string[];
  improvement?: { cvScore?: number; atsScore?: number };
}

export interface CoachOfferContext {
  offerId?: string;
  title?: string;
  company?: string;
  companyLogoUrl?: string;
  internshipType?: string;
  deadline?: string;
  applicationStatus?: string;
  appliedDate?: string;
  interviewDate?: string;
}

export interface CoachConversation {
  id: string;
  title: string;
  preview?: string;
  messageCount?: number;
  mode: CoachMode;
  messages: CoachMessage[];
  updatedAt: number;
  archived?: boolean;
  offerContext?: CoachOfferContext;
  isPending?: boolean;
}

export interface CoachMessage {
  id: string;
  role: 'user' | 'assistant';
  mode?: CoachMode;
  introKey?: string;
  text?: string;
  attachmentName?: string;
  blocks?: StructuredBlock[];
  isStreaming?: boolean;
  streamProgress?: number;
  quickActions?: MessageQuickAction[];
}

export interface CoachPrompt {
  id: string;
  labelKey: string;
}

export interface CoachModeConfig {
  introKey: string;
  emptyHintKey: string;
  prompts: CoachPrompt[];
  blocks: StructuredBlock[];
}

export type CoachSummaryCategory = 'cv' | 'internship' | 'interview' | 'career' | 'skills';

export interface CoachChatHighlight {
  category: CoachSummaryCategory | string;
  question: string;
  answer_preview: string;
  created_at: string;
}

export interface CoachChatSummary {
  session_id: string;
  overview: string;
  key_topics: CoachSummaryCategory[];
  highlights: CoachChatHighlight[];
  total_messages: number;
  important_count: number;
  generated_at: string;
  has_important_content: boolean;
}

export const COACH_MODES: CoachMode[] = [
  'career-coach',
  'cv-reviewer',
  'ats-expert',
  'interview-mentor',
  'internship-advisor',
];

export const MESSAGE_QUICK_ACTIONS: MessageQuickAction[] = [
  'apply',
  'generateExample',
  'explainMore',
  'rewriteSection',
  'actionPlan',
];
