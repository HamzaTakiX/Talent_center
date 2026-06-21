import type {
  AnalyticsMetric,
  AnswerFeedback,
  CoachSuggestion,
  InterviewHistoryRow,
  InterviewMode,
  InterviewQuestion,
  LiveFeedbackCategory,
  RoadmapWeek,
  SkillGap,
  StudentInterviewProfile,
  SummaryBreakdown,
  TranscriptEntry,
  WeakSkillDetail,
} from '../types/interviewSimulatorDashboard';

export const INTERVIEW_STUDENT_PROFILE: StudentInterviewProfile = {
  name: 'Sarah Alami',
  program: 'Master in Management — Digital Business',
  avatarInitials: 'SA',
  readinessScore: 72,
};

export const INTERVIEW_MODES: InterviewMode[] = [
  {
    id: 'general',
    titleKey: 'student.internshipOffers.interviewSim.modes.general.title',
    descKey: 'student.internshipOffers.interviewSim.modes.general.desc',
    icon: 'users',
    gradient: 'from-blue-500/20 to-cyan-500/10',
  },
  {
    id: 'role-specific',
    titleKey: 'student.internshipOffers.interviewSim.modes.role.title',
    descKey: 'student.internshipOffers.interviewSim.modes.role.desc',
    icon: 'briefcase',
    examples: ['Frontend Developer', 'Backend Developer', 'Full Stack', 'Data Analyst', 'Data Scientist', 'UI/UX', 'DevOps'],
    gradient: 'from-violet-500/20 to-purple-500/10',
  },
  {
    id: 'behavioral',
    titleKey: 'student.internshipOffers.interviewSim.modes.behavioral.title',
    descKey: 'student.internshipOffers.interviewSim.modes.behavioral.desc',
    icon: 'heart',
    examples: ['Teamwork', 'Communication', 'Leadership', 'Conflict Resolution'],
    gradient: 'from-rose-500/20 to-pink-500/10',
  },
  {
    id: 'technical',
    titleKey: 'student.internshipOffers.interviewSim.modes.technical.title',
    descKey: 'student.internshipOffers.interviewSim.modes.technical.desc',
    icon: 'code',
    examples: ['React', 'Java', 'Python', 'SQL', 'Node.js'],
    gradient: 'from-emerald-500/20 to-teal-500/10',
  },
  {
    id: 'hr',
    titleKey: 'student.internshipOffers.interviewSim.modes.hr.title',
    descKey: 'student.internshipOffers.interviewSim.modes.hr.desc',
    icon: 'message',
    examples: ['Tell me about yourself', 'Strengths & weaknesses', 'Career goals'],
    gradient: 'from-amber-500/20 to-orange-500/10',
  },
  {
    id: 'custom',
    titleKey: 'student.internshipOffers.interviewSim.modes.custom.title',
    descKey: 'student.internshipOffers.interviewSim.modes.custom.desc',
    icon: 'sparkles',
    gradient: 'from-indigo-500/20 to-blue-500/10',
  },
];

export const INTERVIEW_ROLES = [
  'Frontend Developer Intern',
  'Backend Developer Intern',
  'Full Stack Developer Intern',
  'Data Analyst Intern',
  'Data Scientist Intern',
  'UI/UX Designer Intern',
  'DevOps Intern',
  'Product Manager Intern',
];

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'q1',
    text: 'Tell me about yourself and your background.',
    interviewerRole: 'HR Recruiter',
    interviewerName: 'Marie Dubois',
  },
  {
    id: 'q2',
    text: 'Describe a challenging project you worked on and how you handled it.',
    interviewerRole: 'Technical Lead',
    interviewerName: 'Alex Chen',
  },
  {
    id: 'q3',
    text: 'Why are you interested in this internship and our company?',
    interviewerRole: 'Engineering Manager',
    interviewerName: 'Samira El Fassi',
  },
  {
    id: 'q4',
    text: 'How do you handle working under pressure with tight deadlines?',
    interviewerRole: 'Senior Software Engineer',
    interviewerName: 'Thomas Martin',
  },
  {
    id: 'q5',
    text: 'Where do you see yourself in five years?',
    interviewerRole: 'HR Recruiter',
    interviewerName: 'Marie Dubois',
  },
];

export const LIVE_FEEDBACK_CATEGORIES: LiveFeedbackCategory[] = [
  { id: 'communication', labelKey: 'student.internshipOffers.interviewSim.feedback.communication', score: 78 },
  { id: 'technical', labelKey: 'student.internshipOffers.interviewSim.feedback.technical', score: 72 },
  { id: 'confidence', labelKey: 'student.internshipOffers.interviewSim.feedback.confidence', score: 85 },
  { id: 'structure', labelKey: 'student.internshipOffers.interviewSim.feedback.structure', score: 70 },
  { id: 'relevance', labelKey: 'student.internshipOffers.interviewSim.feedback.relevance', score: 80 },
  { id: 'professionalism', labelKey: 'student.internshipOffers.interviewSim.feedback.professionalism', score: 88 },
];

export const MOCK_ANSWER_FEEDBACK: AnswerFeedback = {
  wentWell: [
    'Clear and confident opening',
    'Good mention of relevant technical skills',
    'Professional tone throughout',
  ],
  needsImprovement: [
    'Answer could include a concrete example',
    'STAR structure not fully applied',
    'Could connect experience to the role more explicitly',
  ],
  suggestedAnswer:
    'Start with a concise 60-second pitch: who you are, your program, 2 key skills, and one achievement with measurable impact.',
  professionalExample:
    '"I am a Master in Management student specializing in digital business. During my last internship at TechFlow, I built a React dashboard that reduced reporting time by 40%. I am excited to bring my frontend skills and analytical mindset to this role."',
  vocabulary: ['measurable impact', 'cross-functional', 'stakeholder alignment', 'deliverables'],
  confidenceTips: ['Maintain steady pace', 'Pause briefly before technical terms', 'End with a forward-looking statement'],
};

export const INTERVIEW_HISTORY: InterviewHistoryRow[] = [
  { id: 'h1', date: '5 juin 2026', typeKey: 'student.internshipOffers.interviewSim.history.types.technical', difficulty: 'intermediate', score: 78, duration: '12 min', statusKey: 'student.internshipOffers.interviewSim.history.statuses.completed' },
  { id: 'h2', date: '2 juin 2026', typeKey: 'student.internshipOffers.interviewSim.history.types.behavioral', difficulty: 'beginner', score: 85, duration: '8 min', statusKey: 'student.internshipOffers.interviewSim.history.statuses.completed' },
  { id: 'h3', date: '28 mai 2026', typeKey: 'student.internshipOffers.interviewSim.history.types.general', difficulty: 'intermediate', score: 71, duration: '15 min', statusKey: 'student.internshipOffers.interviewSim.history.statuses.completed' },
];

export const ANALYTICS_METRICS: AnalyticsMetric[] = [
  { id: 'avg', labelKey: 'student.internshipOffers.interviewSim.analytics.avgScore', values: [62, 68, 71, 75, 78, 82, 84] },
  { id: 'conf', labelKey: 'student.internshipOffers.interviewSim.analytics.confidence', values: [55, 62, 70, 78, 82, 88, 90], unit: '%' },
  { id: 'tech', labelKey: 'student.internshipOffers.interviewSim.analytics.technical', values: [50, 58, 65, 70, 74, 78, 82], unit: '%' },
  { id: 'completion', labelKey: 'student.internshipOffers.interviewSim.analytics.completion', values: [40, 55, 60, 72, 80, 88, 95], unit: '%' },
];

export const SUMMARY_BREAKDOWN: SummaryBreakdown[] = [
  { id: 'comm', labelKey: 'student.internshipOffers.interviewSim.summary.communication', score: 85 },
  { id: 'tech', labelKey: 'student.internshipOffers.interviewSim.summary.technical', score: 78 },
  { id: 'conf', labelKey: 'student.internshipOffers.interviewSim.summary.confidence', score: 90 },
  { id: 'problem', labelKey: 'student.internshipOffers.interviewSim.summary.problemSolving', score: 82 },
  { id: 'prof', labelKey: 'student.internshipOffers.interviewSim.summary.professionalism', score: 88 },
];

export const SUMMARY_STRENGTHS = [
  'student.internshipOffers.interviewSim.summary.strength1',
  'student.internshipOffers.interviewSim.summary.strength2',
  'student.internshipOffers.interviewSim.summary.strength3',
  'student.internshipOffers.interviewSim.summary.strength4',
];

export const SUMMARY_WEAKNESSES = [
  'student.internshipOffers.interviewSim.summary.weakness1',
  'student.internshipOffers.interviewSim.summary.weakness2',
  'student.internshipOffers.interviewSim.summary.weakness3',
  'student.internshipOffers.interviewSim.summary.weakness4',
];

export const SKILL_GAPS: SkillGap[] = [
  { id: 'sg1', name: 'Public Speaking', priority: 'high' },
  { id: 'sg2', name: 'Problem Solving', priority: 'medium' },
  { id: 'sg3', name: 'System Design', priority: 'medium' },
  { id: 'sg4', name: 'React Hooks', priority: 'high' },
  { id: 'sg5', name: 'SQL Joins', priority: 'low' },
];

export const IMPROVEMENT_ROADMAP: RoadmapWeek[] = [
  { id: 'rw1', week: 1, titleKey: 'student.internshipOffers.interviewSim.roadmap.week1' },
  { id: 'rw2', week: 2, titleKey: 'student.internshipOffers.interviewSim.roadmap.week2' },
  { id: 'rw3', week: 3, titleKey: 'student.internshipOffers.interviewSim.roadmap.week3' },
  { id: 'rw4', week: 4, titleKey: 'student.internshipOffers.interviewSim.roadmap.week4' },
];

export const WEAK_SKILLS_DETAILED: WeakSkillDetail[] = [
  {
    id: 'ws1',
    name: 'React Hooks',
    score: 72,
    priority: 'high',
    statusKey: 'student.internshipOffers.interviewSim.weakSkills.status.needsImprovement',
    trend: 'up',
    trendDelta: 8,
    suggestionKey: 'student.internshipOffers.interviewSim.weakSkills.suggest.reactHooks',
  },
  {
    id: 'ws2',
    name: 'STAR Method',
    score: 45,
    priority: 'high',
    statusKey: 'student.internshipOffers.interviewSim.weakSkills.status.highPriority',
    trend: 'down',
    trendDelta: 3,
    suggestionKey: 'student.internshipOffers.interviewSim.weakSkills.suggest.star',
  },
  {
    id: 'ws3',
    name: 'Public Speaking',
    score: 68,
    priority: 'medium',
    statusKey: 'student.internshipOffers.interviewSim.weakSkills.status.mediumPriority',
    trend: 'up',
    trendDelta: 5,
    suggestionKey: 'student.internshipOffers.interviewSim.weakSkills.suggest.speaking',
  },
  {
    id: 'ws4',
    name: 'System Design',
    score: 54,
    priority: 'medium',
    statusKey: 'student.internshipOffers.interviewSim.weakSkills.status.needsImprovement',
    trend: 'flat',
    trendDelta: 0,
    suggestionKey: 'student.internshipOffers.interviewSim.weakSkills.suggest.systemDesign',
  },
];

export const COACH_SUGGESTIONS: CoachSuggestion[] = [
  { id: 'cs1', labelKey: 'student.internshipOffers.interviewSim.coach.suggest1' },
  { id: 'cs2', labelKey: 'student.internshipOffers.interviewSim.coach.suggest2' },
  { id: 'cs3', labelKey: 'student.internshipOffers.interviewSim.coach.suggest3' },
];

export const MOCK_TRANSCRIPT: TranscriptEntry[] = [
  { id: 't1', question: 'Tell me about yourself and your background.', answer: 'I am a management student with experience in React and data analysis...', feedback: 'Good opening, add a measurable achievement.', score: 85 },
  { id: 't2', question: 'Describe a challenging project you worked on.', answer: 'I built a dashboard for my internship team...', feedback: 'Use STAR framework more explicitly.', score: 74 },
  { id: 't3', question: 'Why are you interested in this internship?', answer: 'Your company aligns with my passion for fintech...', feedback: 'Strong motivation, research the company more.', score: 91 },
];

export const TIMELINE_SCORES = [
  { question: 1, score: 85 },
  { question: 2, score: 74 },
  { question: 3, score: 91 },
  { question: 4, score: 80 },
  { question: 5, score: 88 },
];
