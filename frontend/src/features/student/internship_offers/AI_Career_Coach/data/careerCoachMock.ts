import type { CoachContextData, CoachMode, CoachModeConfig, StructuredBlock } from '../types/careerCoach';

export const COACH_CONTEXT_MOCK: CoachContextData = {
  cvFileName: 'Youssef_Benali_CV.pdf',
  cvScore: 78,
  atsScore: 71,
  lastAnalysis: '2026-06-05',
  readinessPercent: 82,
  focusAreas: [
    { id: 'portfolio', labelKey: 'student.internshipOffers.careerCoach.context.focus.portfolio' },
    { id: 'ats', labelKey: 'student.internshipOffers.careerCoach.context.focus.ats' },
    { id: 'interview', labelKey: 'student.internshipOffers.careerCoach.context.focus.interview' },
  ],
  activeGoals: [
    { id: 'cv', labelKey: 'student.internshipOffers.careerCoach.context.goals.improveCv', progress: 65 },
    { id: 'apply', labelKey: 'student.internshipOffers.careerCoach.context.goals.apply', progress: 40 },
    { id: 'practice', labelKey: 'student.internshipOffers.careerCoach.context.goals.practice', progress: 55 },
  ],
};

const SHARED_STRENGTHS_BLOCK: StructuredBlock = {
  type: 'list',
  titleKey: 'student.internshipOffers.careerCoach.responses.strengths',
  items: [
    { textKey: 'student.internshipOffers.careerCoach.responses.strengthReact', tone: 'positive' },
    { textKey: 'student.internshipOffers.careerCoach.responses.strengthAcademic', tone: 'positive' },
  ],
};

const SHARED_WEAKNESSES_BLOCK: StructuredBlock = {
  type: 'list',
  titleKey: 'student.internshipOffers.careerCoach.responses.weaknesses',
  items: [
    { textKey: 'student.internshipOffers.careerCoach.responses.weakPortfolio', tone: 'warning' },
    { textKey: 'student.internshipOffers.careerCoach.responses.weakMetrics', tone: 'warning' },
  ],
};

const SHARED_ACTIONS_BLOCK: StructuredBlock = {
  type: 'actions',
  titleKey: 'student.internshipOffers.careerCoach.responses.recommendedActions',
  actionKeys: [
    'student.internshipOffers.careerCoach.responses.actionGithub',
    'student.internshipOffers.careerCoach.responses.actionProjects',
    'student.internshipOffers.careerCoach.responses.actionMetrics',
  ],
};

export const MODE_CONFIGS: Record<CoachMode, CoachModeConfig> = {
  'career-coach': {
    introKey: 'student.internshipOffers.careerCoach.responses.introCareerCoach',
    emptyHintKey: 'student.internshipOffers.careerCoach.empty.hints.careerCoach',
    prompts: [
      { id: 'cc1', labelKey: 'student.internshipOffers.careerCoach.modes.prompts.careerCoach.roadmap' },
      { id: 'cc2', labelKey: 'student.internshipOffers.careerCoach.modes.prompts.careerCoach.profile' },
      { id: 'cc3', labelKey: 'student.internshipOffers.careerCoach.modes.prompts.careerCoach.strategy' },
      { id: 'cc4', labelKey: 'student.internshipOffers.careerCoach.prompts.actionPlan' },
    ],
    blocks: [
      { type: 'heading', titleKey: 'student.internshipOffers.careerCoach.responses.modeHeadings.careerCoach' },
      SHARED_STRENGTHS_BLOCK,
      SHARED_WEAKNESSES_BLOCK,
      SHARED_ACTIONS_BLOCK,
      {
        type: 'improvement',
        titleKey: 'student.internshipOffers.careerCoach.responses.expectedImprovement',
        improvement: { cvScore: 7, atsScore: 12 },
      },
    ],
  },
  'cv-reviewer': {
    introKey: 'student.internshipOffers.careerCoach.responses.introCvReviewer',
    emptyHintKey: 'student.internshipOffers.careerCoach.empty.hints.cvReviewer',
    prompts: [
      { id: 'cv1', labelKey: 'student.internshipOffers.careerCoach.modes.prompts.cvReviewer.analyze' },
      { id: 'cv2', labelKey: 'student.internshipOffers.careerCoach.modes.prompts.cvReviewer.summary' },
      { id: 'cv3', labelKey: 'student.internshipOffers.careerCoach.modes.prompts.cvReviewer.experience' },
      { id: 'cv4', labelKey: 'student.internshipOffers.careerCoach.prompts.reviewCv' },
    ],
    blocks: [
      { type: 'heading', titleKey: 'student.internshipOffers.careerCoach.responses.modeHeadings.cvReviewer' },
      SHARED_STRENGTHS_BLOCK,
      SHARED_WEAKNESSES_BLOCK,
      SHARED_ACTIONS_BLOCK,
      {
        type: 'improvement',
        titleKey: 'student.internshipOffers.careerCoach.responses.expectedImprovement',
        improvement: { cvScore: 9 },
      },
    ],
  },
  'ats-expert': {
    introKey: 'student.internshipOffers.careerCoach.responses.introAtsExpert',
    emptyHintKey: 'student.internshipOffers.careerCoach.empty.hints.atsExpert',
    prompts: [
      { id: 'ats1', labelKey: 'student.internshipOffers.careerCoach.modes.prompts.atsExpert.score' },
      { id: 'ats2', labelKey: 'student.internshipOffers.careerCoach.modes.prompts.atsExpert.keywords' },
      { id: 'ats3', labelKey: 'student.internshipOffers.careerCoach.modes.prompts.atsExpert.compare' },
      { id: 'ats4', labelKey: 'student.internshipOffers.careerCoach.prompts.atsLow' },
    ],
    blocks: [
      { type: 'heading', titleKey: 'student.internshipOffers.careerCoach.responses.modeHeadings.atsExpert' },
      {
        type: 'list',
        titleKey: 'student.internshipOffers.careerCoach.responses.atsIssues',
        items: [
          { textKey: 'student.internshipOffers.careerCoach.responses.atsIssue1', tone: 'warning' },
          { textKey: 'student.internshipOffers.careerCoach.responses.atsIssue2', tone: 'warning' },
        ],
      },
      SHARED_ACTIONS_BLOCK,
      {
        type: 'improvement',
        titleKey: 'student.internshipOffers.careerCoach.responses.expectedImprovement',
        improvement: { atsScore: 15 },
      },
    ],
  },
  'interview-mentor': {
    introKey: 'student.internshipOffers.careerCoach.responses.introInterviewMentor',
    emptyHintKey: 'student.internshipOffers.careerCoach.empty.hints.interviewMentor',
    prompts: [
      { id: 'int1', labelKey: 'student.internshipOffers.careerCoach.modes.prompts.interviewMentor.mock' },
      { id: 'int2', labelKey: 'student.internshipOffers.careerCoach.modes.prompts.interviewMentor.behavioral' },
      { id: 'int3', labelKey: 'student.internshipOffers.careerCoach.modes.prompts.interviewMentor.technical' },
      { id: 'int4', labelKey: 'student.internshipOffers.careerCoach.prompts.prepareInterviews' },
    ],
    blocks: [
      { type: 'heading', titleKey: 'student.internshipOffers.careerCoach.responses.modeHeadings.interviewMentor' },
      {
        type: 'list',
        titleKey: 'student.internshipOffers.careerCoach.responses.interviewFocus',
        items: [
          { textKey: 'student.internshipOffers.careerCoach.responses.interviewFocus1', tone: 'neutral' },
          { textKey: 'student.internshipOffers.careerCoach.responses.interviewFocus2', tone: 'neutral' },
        ],
      },
      SHARED_ACTIONS_BLOCK,
    ],
  },
  'internship-advisor': {
    introKey: 'student.internshipOffers.careerCoach.responses.introInternshipAdvisor',
    emptyHintKey: 'student.internshipOffers.careerCoach.empty.hints.internshipAdvisor',
    prompts: [
      { id: 'ia1', labelKey: 'student.internshipOffers.careerCoach.modes.prompts.internshipAdvisor.recommend' },
      { id: 'ia2', labelKey: 'student.internshipOffers.careerCoach.modes.prompts.internshipAdvisor.strategy' },
      { id: 'ia3', labelKey: 'student.internshipOffers.careerCoach.modes.prompts.internshipAdvisor.matches' },
      { id: 'ia4', labelKey: 'student.internshipOffers.careerCoach.prompts.matchingInternships' },
    ],
    blocks: [
      { type: 'heading', titleKey: 'student.internshipOffers.careerCoach.responses.modeHeadings.internshipAdvisor' },
      {
        type: 'actions',
        titleKey: 'student.internshipOffers.careerCoach.responses.recommendedActions',
        actionKeys: [
          'student.internshipOffers.careerCoach.responses.advisorAction1',
          'student.internshipOffers.careerCoach.responses.advisorAction2',
        ],
      },
      SHARED_STRENGTHS_BLOCK,
    ],
  },
};

export function getModeConfig(mode: CoachMode): CoachModeConfig {
  return MODE_CONFIGS[mode];
}

/** @deprecated Use getModeConfig(mode).blocks */
export const DEFAULT_ASSISTANT_BLOCKS = MODE_CONFIGS['career-coach'].blocks;

/** @deprecated Use getModeConfig(mode).introKey */
export const ASSISTANT_INTRO_KEY = MODE_CONFIGS['career-coach'].introKey;

/** @deprecated Use getModeConfig(mode).prompts */
export const COACH_STARTER_PROMPTS = MODE_CONFIGS['career-coach'].prompts;
