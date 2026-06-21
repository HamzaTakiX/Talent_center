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
