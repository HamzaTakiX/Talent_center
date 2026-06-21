import type { InterviewDifficulty, InterviewLanguage, InterviewLength } from '../types/interviewSimulatorDashboard';

export interface RoleCardOption {
  id: string;
  value: string;
  icon: 'layout' | 'server' | 'layers' | 'chart' | 'brain' | 'palette' | 'cloud';
  titleKey: string;
  descKey: string;
  levelKey: string;
  badgeKey?: string;
}

export const CONFIG_ROLE_OPTIONS: RoleCardOption[] = [
  {
    id: 'frontend',
    value: 'Frontend Developer',
    icon: 'layout',
    titleKey: 'student.internshipOffers.interviewSim.config.roles.frontend.title',
    descKey: 'student.internshipOffers.interviewSim.config.roles.frontend.desc',
    levelKey: 'student.internshipOffers.interviewSim.config.roles.frontend.level',
    badgeKey: 'student.internshipOffers.interviewSim.config.roles.frontend.badge',
  },
  {
    id: 'backend',
    value: 'Backend Developer',
    icon: 'server',
    titleKey: 'student.internshipOffers.interviewSim.config.roles.backend.title',
    descKey: 'student.internshipOffers.interviewSim.config.roles.backend.desc',
    levelKey: 'student.internshipOffers.interviewSim.config.roles.backend.level',
  },
  {
    id: 'fullstack',
    value: 'Full Stack Developer',
    icon: 'layers',
    titleKey: 'student.internshipOffers.interviewSim.config.roles.fullstack.title',
    descKey: 'student.internshipOffers.interviewSim.config.roles.fullstack.desc',
    levelKey: 'student.internshipOffers.interviewSim.config.roles.fullstack.level',
    badgeKey: 'student.internshipOffers.interviewSim.config.roles.fullstack.badge',
  },
  {
    id: 'data-analyst',
    value: 'Data Analyst',
    icon: 'chart',
    titleKey: 'student.internshipOffers.interviewSim.config.roles.dataAnalyst.title',
    descKey: 'student.internshipOffers.interviewSim.config.roles.dataAnalyst.desc',
    levelKey: 'student.internshipOffers.interviewSim.config.roles.dataAnalyst.level',
  },
  {
    id: 'data-scientist',
    value: 'Data Scientist',
    icon: 'brain',
    titleKey: 'student.internshipOffers.interviewSim.config.roles.dataScientist.title',
    descKey: 'student.internshipOffers.interviewSim.config.roles.dataScientist.desc',
    levelKey: 'student.internshipOffers.interviewSim.config.roles.dataScientist.level',
    badgeKey: 'student.internshipOffers.interviewSim.config.roles.dataScientist.badge',
  },
  {
    id: 'uiux',
    value: 'UI/UX Designer',
    icon: 'palette',
    titleKey: 'student.internshipOffers.interviewSim.config.roles.uiux.title',
    descKey: 'student.internshipOffers.interviewSim.config.roles.uiux.desc',
    levelKey: 'student.internshipOffers.interviewSim.config.roles.uiux.level',
  },
  {
    id: 'devops',
    value: 'DevOps Engineer',
    icon: 'cloud',
    titleKey: 'student.internshipOffers.interviewSim.config.roles.devops.title',
    descKey: 'student.internshipOffers.interviewSim.config.roles.devops.desc',
    levelKey: 'student.internshipOffers.interviewSim.config.roles.devops.level',
  },
];

export const QUESTIONS_BY_LENGTH: Record<InterviewLength, number> = {
  5: 3,
  10: 4,
  15: 5,
  20: 6,
  30: 8,
};

export const DURATION_INTENSITY_KEYS: Record<InterviewLength, string> = {
  5: 'student.internshipOffers.interviewSim.config.duration.intensity.light',
  10: 'student.internshipOffers.interviewSim.config.duration.intensity.moderate',
  15: 'student.internshipOffers.interviewSim.config.duration.intensity.balanced',
  20: 'student.internshipOffers.interviewSim.config.duration.intensity.high',
  30: 'student.internshipOffers.interviewSim.config.duration.intensity.intense',
};

export const DIFFICULTY_META: Record<
  InterviewDifficulty,
  { levelKey: string; complexityKey: string; scoringKey: string }
> = {
  beginner: {
    levelKey: 'student.internshipOffers.interviewSim.config.difficultyMeta.beginner.level',
    complexityKey: 'student.internshipOffers.interviewSim.config.difficultyMeta.beginner.complexity',
    scoringKey: 'student.internshipOffers.interviewSim.config.difficultyMeta.beginner.scoring',
  },
  intermediate: {
    levelKey: 'student.internshipOffers.interviewSim.config.difficultyMeta.intermediate.level',
    complexityKey: 'student.internshipOffers.interviewSim.config.difficultyMeta.intermediate.complexity',
    scoringKey: 'student.internshipOffers.interviewSim.config.difficultyMeta.intermediate.scoring',
  },
  advanced: {
    levelKey: 'student.internshipOffers.interviewSim.config.difficultyMeta.advanced.level',
    complexityKey: 'student.internshipOffers.interviewSim.config.difficultyMeta.advanced.complexity',
    scoringKey: 'student.internshipOffers.interviewSim.config.difficultyMeta.advanced.scoring',
  },
  expert: {
    levelKey: 'student.internshipOffers.interviewSim.config.difficultyMeta.expert.level',
    complexityKey: 'student.internshipOffers.interviewSim.config.difficultyMeta.expert.complexity',
    scoringKey: 'student.internshipOffers.interviewSim.config.difficultyMeta.expert.scoring',
  },
};

export const LANGUAGE_FLUENCY_KEYS: Record<InterviewLanguage, string> = {
  en: 'student.internshipOffers.interviewSim.config.language.fluency.en',
  fr: 'student.internshipOffers.interviewSim.config.language.fluency.fr',
  ar: 'student.internshipOffers.interviewSim.config.language.fluency.ar',
};

export const LANGUAGE_FLAG: Record<InterviewLanguage, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  ar: '🇲🇦',
};

export const CONFIG_SKILL_KEYS = [
  'student.internshipOffers.interviewSim.config.sidebar.skills.communication',
  'student.internshipOffers.interviewSim.config.sidebar.skills.problemSolving',
  'student.internshipOffers.interviewSim.config.sidebar.skills.technical',
  'student.internshipOffers.interviewSim.config.sidebar.skills.confidence',
  'student.internshipOffers.interviewSim.config.sidebar.skills.leadership',
] as const;

export const CONFIG_TIP_KEYS = [
  'student.internshipOffers.interviewSim.config.sidebar.tips.star',
  'student.internshipOffers.interviewSim.config.sidebar.tips.examples',
  'student.internshipOffers.interviewSim.config.sidebar.tips.thinkAloud',
  'student.internshipOffers.interviewSim.config.sidebar.tips.structured',
] as const;

export const CONFIG_RISK_KEYS = [
  'student.internshipOffers.interviewSim.config.sidebar.risks.structure',
  'student.internshipOffers.interviewSim.config.sidebar.risks.examples',
  'student.internshipOffers.interviewSim.config.sidebar.risks.technicalDepth',
] as const;
