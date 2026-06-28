import { useCallback, useEffect, useMemo, useState } from 'react';
import { LIVE_FEEDBACK_CATEGORIES } from '../data/interviewSimulatorDashboardMock';
import { QUESTIONS_BY_LENGTH } from '../data/interviewConfigMock';
import type { InternshipOfferDetails } from '../../types';
import { buildSimulatorConfigFromOffer } from '../utils/buildSimulatorConfigFromOffer';
import { buildExternalOfferPayload } from '../utils/buildExternalOfferPayload';
import {
  completeInterviewSession,
  getInterviewSessionDetail,
  startInterviewSession,
  submitInterviewAnswer,
} from '../../api/offerAiCoachApi';
import type {
  AnswerFeedback,
  InterviewDifficulty,
  InterviewQuestion,
  InterviewLength,
  InterviewMedium,
  InterviewModeId,
  InterviewFocusType,
  SimulatorConfig,
  TranscriptEntry,
  SimulatorView,
} from '../types/interviewSimulatorDashboard';
import type { InterviewSessionTurn, InterviewSimulationReport } from '../../types/offerAiCoach';

const EMPTY_ANSWER_FEEDBACK: AnswerFeedback = {
  wentWell: [],
  needsImprovement: [],
  suggestedAnswer: '',
  professionalExample: '',
  vocabulary: [],
  confidenceTips: [],
};

const DEFAULT_CONFIG: SimulatorConfig = {
  modeId: 'general',
  role: 'Frontend Developer',
  difficulty: 'intermediate',
  length: 15,
  medium: 'text',
  language: 'fr',
  interviewerGender: 'female',
  experienceLevel: 'intern',
};

const INTERVIEWER_NAMES = {
  female: ['Nadia', 'Salma', 'Meryem', 'Leila'],
  male: ['Youssef', 'Karim', 'Amine', 'Samir'],
} as const;

function interviewerRoleForConfig(config: SimulatorConfig): string {
  if (config.interviewFocus === 'technical') {
    return config.experienceLevel === 'senior' ? 'Senior Tech Lead' : 'Technical Interviewer';
  }
  if (config.interviewFocus === 'hr') {
    return config.experienceLevel === 'senior' ? 'Senior HR Recruiter' : 'HR Recruiter';
  }
  return 'Hiring Manager';
}

function interviewFocusFromModeId(modeId: InterviewModeId): InterviewFocusType | undefined {
  if (modeId === 'technical') return 'technical';
  if (modeId === 'hr' || modeId === 'behavioral') return 'hr';
  return undefined;
}

function resolveInterviewType(
  focus?: InterviewFocusType,
  modeId?: InterviewModeId,
): 'hr' | 'technical' | 'behavioral' | 'case_study' | 'mixed' {
  if (focus === 'hr') return 'hr';
  if (focus === 'technical') return 'technical';
  if (modeId === 'technical') return 'technical';
  if (modeId === 'hr' || modeId === 'behavioral') return 'hr';
  return 'mixed';
}

function sessionScoreFromTurns(turns: InterviewSessionTurn[]): number {
  const scored = turns.filter(
    (turn) => turn.answer?.trim() && typeof turn.score === 'number',
  );
  if (!scored.length) return 0;
  const total = scored.reduce((sum, turn) => sum + (turn.score ?? 0), 0);
  return Math.round(total / scored.length);
}

function buildQuestionTemplates(config: SimulatorConfig): string[] {
  const targetRole = config.customJobTitle?.trim() || config.role;
  const company = config.customCompany?.trim();
  const roleWithCompany = company ? `${targetRole} at ${company}` : targetRole;

  const technical = [
    `Walk me through a technical project that best prepares you for the ${roleWithCompany} role.`,
    `How would you approach your first feature/task in this ${targetRole} internship?`,
    'Describe how you debug a complex issue when you have limited context.',
    'Which tools, technologies, or methods are you most confident with, and why?',
    'Tell me about a technical challenge where you had to learn fast and deliver.',
  ];

  const hr = [
    'Tell me about yourself and the value you bring to this internship.',
    `Why are you interested in this ${targetRole} opportunity${company ? ` at ${company}` : ''}?`,
    'Give me an example of a teamwork or communication challenge and how you handled it.',
    'How do you organize your work when priorities change quickly?',
    'What are your learning goals for this internship period?',
  ];

  const mixed = [
    `Introduce your profile for this ${targetRole} internship in 60 seconds.`,
    'Describe one project where your technical contribution created business value.',
    'How do you collaborate with teammates when requirements are ambiguous?',
    `What technical skills do you still need to strengthen for this role?`,
    'Tell me about a mistake you made and how you turned it into progress.',
  ];

  if (config.language === 'fr') {
    const technicalFr = [
      `Parlez-moi d'un projet technique qui vous prépare au poste ${roleWithCompany}.`,
      `Comment aborderiez-vous votre première mission dans ce stage ${targetRole} ?`,
      'Comment déboguez-vous un problème complexe avec peu de contexte ?',
      'Quelles technologies ou méthodes maîtrisez-vous le mieux, et pourquoi ?',
      'Racontez un défi technique où vous avez dû apprendre rapidement et livrer.',
    ];
    const hrFr = [
      'Présentez-vous et expliquez la valeur que vous apportez à ce stage.',
      `Pourquoi cette opportunité ${targetRole}${company ? ` chez ${company}` : ''} vous intéresse ?`,
      'Donnez un exemple de défi en communication ou en travail d équipe et votre approche.',
      'Comment vous organisez-vous quand les priorités changent vite ?',
      'Quels sont vos objectifs d apprentissage pendant ce stage ?',
    ];
    const mixedFr = [
      `Présentez votre profil pour ce stage ${targetRole} en 60 secondes.`,
      'Décrivez un projet où votre contribution technique a créé de la valeur.',
      'Comment collaborez-vous quand les besoins ne sont pas totalement clairs ?',
      `Quelles compétences techniques devez-vous encore renforcer pour ce poste ?`,
      'Parlez d une erreur que vous avez transformée en progression.',
    ];
    if (config.interviewFocus === 'technical') return technicalFr;
    if (config.interviewFocus === 'hr') return hrFr;
    return mixedFr;
  }

  if (config.interviewFocus === 'technical') return technical;
  if (config.interviewFocus === 'hr') return hr;
  return mixed;
}

function buildQuestions(config: SimulatorConfig, totalQuestions: number): InterviewQuestion[] {
  const templates = buildQuestionTemplates(config);
  const gender = config.interviewerGender === 'male' ? 'male' : 'female';
  const names = INTERVIEWER_NAMES[gender];
  const role = interviewerRoleForConfig(config);

  return Array.from({ length: totalQuestions }, (_, index) => ({
    id: `q-${index + 1}`,
    text: templates[index % templates.length],
    interviewerRole: role,
    interviewerName: names[index % names.length] ?? names[0],
  }));
}

export function useInterviewSimulator(hasHistory = true) {
  const [view, setView] = useState<SimulatorView>(hasHistory ? 'hub' : 'hub');
  const [config, setConfig] = useState<SimulatorConfig>(DEFAULT_CONFIG);
  const [configStep, setConfigStep] = useState(0);
  const [selectedModeId, setSelectedModeId] = useState<InterviewModeId | null>(null);
  const apiUnavailable = false;
  const [isBusy, setIsBusy] = useState(false);
  const [sessionUuid, setSessionUuid] = useState<string | null>(null);
  const [serverTurns, setServerTurns] = useState<InterviewSessionTurn[]>([]);
  const [pendingCompletion, setPendingCompletion] = useState(false);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<AnswerFeedback>(EMPTY_ANSWER_FEEDBACK);
  const [liveFeedback, setLiveFeedback] = useState(() => LIVE_FEEDBACK_CATEGORIES.map((cat) => ({ ...cat, score: 0 })));
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [overallSummaryScore, setOverallSummaryScore] = useState(0);
  const [sessionReport, setSessionReport] = useState<InterviewSimulationReport | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [expandedTranscriptId, setExpandedTranscriptId] = useState<string | null>(null);

  const totalQuestions = useMemo(
    () => QUESTIONS_BY_LENGTH[config.length] ?? 5,
    [config.length],
  );

  const generatedQuestions = useMemo(
    () => buildQuestions(config, totalQuestions),
    [config, totalQuestions],
  );

  const currentQuestion = useMemo(() => {
    const turn = serverTurns[questionIndex];
    if (turn) {
      const fallback = generatedQuestions[questionIndex] ?? generatedQuestions[0];
      return {
        id: turn.question_uuid,
        text: turn.question,
        interviewerRole: fallback?.interviewerRole ?? 'Hiring Manager',
        interviewerName: fallback?.interviewerName ?? 'Nadia',
      };
    }
    return generatedQuestions[questionIndex] ?? generatedQuestions[0];
  }, [generatedQuestions, questionIndex, serverTurns]);

  const startConfig = useCallback((modeId: InterviewModeId) => {
    setSelectedModeId(modeId);
    const presetFocus = interviewFocusFromModeId(modeId);
    setConfig((c) => ({
      ...c,
      modeId,
      interviewFocus: presetFocus ?? c.interviewFocus,
    }));
    setConfigStep(0);
    setView('config');
  }, []);

  const startConfigWithOffer = useCallback((offer: InternshipOfferDetails) => {
    setSelectedModeId('role-specific');
    setConfig((current) => ({
      ...current,
      modeId: 'role-specific',
      ...buildSimulatorConfigFromOffer(offer),
    }));
    setConfigStep(0);
    setView('config');
  }, []);

  const mapDifficulty = useCallback((value: InterviewDifficulty): 'easy' | 'medium' | 'hard' => {
    if (value === 'beginner') return 'easy';
    if (value === 'advanced' || value === 'expert') return 'hard';
    return 'medium';
  }, []);

  const mapInterviewType = useCallback(
    (focus?: InterviewFocusType, modeId?: InterviewModeId) => resolveInterviewType(focus, modeId),
    [],
  );

  const mapCommunicationMode = useCallback((medium: InterviewMedium): 'text' | 'voice' | 'voice_text' => {
    if (medium === 'voice') return 'voice';
    if (medium === 'video') return 'voice_text';
    return 'text';
  }, []);

  const refreshTranscript = useCallback((turns: InterviewSessionTurn[]) => {
    const nextTranscript: TranscriptEntry[] = turns
      .filter((t) => t.answer?.trim())
      .map((t) => ({
        id: t.question_uuid,
        question: t.question,
        answer: t.answer,
        feedback: (t.weaknesses || []).join(' · '),
        score: typeof t.score === 'number' ? t.score : 0,
      }));
    setTranscript(nextTranscript);
  }, []);

  const startSimulation = useCallback(async () => {
    if (isBusy) return;
    setIsBusy(true);
    setQuestionIndex(0);
    setAnswer('');
    setShowFeedback(false);
    setSessionScore(0);
    setAnswerFeedback(EMPTY_ANSWER_FEEDBACK);
    setLiveFeedback(LIVE_FEEDBACK_CATEGORIES.map((cat) => ({ ...cat, score: 0 })));
    setPendingCompletion(false);
    setOverallSummaryScore(0);
    setSessionReport(null);
    setShowReportModal(false);
    setIsCompleting(false);
    try {
      const externalOffer = buildExternalOfferPayload(config);
      const payload = {
        mode: (config.linkedOfferId || config.basis === 'offer' || selectedModeId === 'role-specific') ? 'offer' as const : 'profile' as const,
        offer_uuid: config.linkedOfferId,
        external_offer_url: config.offerUrl?.trim() || undefined,
        external_offer: externalOffer,
        difficulty: mapDifficulty(config.difficulty),
        duration_minutes: config.length as InterviewLength,
        language: config.language,
        communication_mode: mapCommunicationMode(config.medium),
        interview_type: mapInterviewType(config.interviewFocus, config.modeId),
        recruiter_profile: `${config.experienceLevel ?? 'intern'} recruiter`,
      };
      const started = await startInterviewSession(payload);
      if (started.requires_missing_fields) {
        window.alert(`Missing offer fields: ${(started.missing_fields || []).join(', ')}`);
        return;
      }
      setSessionUuid(started.session_uuid);
      setServerTurns(started.turns || []);
      setTimeRemaining((started.configuration?.duration_minutes ?? config.length) * 60);
      setView('active');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start interview simulation.';
      window.alert(message);
    } finally {
      setIsBusy(false);
    }
  }, [
    config,
    isBusy,
    mapCommunicationMode,
    mapDifficulty,
    mapInterviewType,
    selectedModeId,
  ]);

  const submitAnswer = useCallback(async () => {
    if (!sessionUuid || !answer.trim() || isBusy) return;
    setIsBusy(true);
    const activeTurn = serverTurns[questionIndex];
    try {
      const response = await submitInterviewAnswer(sessionUuid, {
        question_uuid: activeTurn?.question_uuid,
        answer: answer.trim(),
      });
      setServerTurns(response.turns || []);
      refreshTranscript(response.turns || []);
      const evalData = response.latest_evaluation;
      if (evalData) {
        const turns = response.turns || [];
        const runningScore = sessionScoreFromTurns(turns);
        setSessionScore(runningScore > 0 ? runningScore : evalData.overall_score ?? 0);
        setAnswerFeedback({
          wentWell: evalData.strengths || [],
          needsImprovement: evalData.weaknesses || [],
          suggestedAnswer: evalData.ideal_answer || '',
          professionalExample: (evalData.improvement_tips || []).join(' | '),
          vocabulary: evalData.missing_skills || [],
          confidenceTips: evalData.improvement_tips || [],
        });
        setLiveFeedback((prev) => prev.map((cat) => {
          if (cat.id === 'communication') return { ...cat, score: evalData.communication ?? 0 };
          if (cat.id === 'technical') return { ...cat, score: evalData.technical_knowledge ?? 0 };
          if (cat.id === 'confidence') return { ...cat, score: evalData.confidence ?? 0 };
          if (cat.id === 'structure') return { ...cat, score: evalData.problem_solving ?? 0 };
          if (cat.id === 'relevance') return { ...cat, score: evalData.answer_relevance ?? 0 };
          if (cat.id === 'professionalism') return { ...cat, score: evalData.professionalism ?? 0 };
          return cat;
        }));
      }
      setPendingCompletion(questionIndex + 1 >= totalQuestions);
      setShowFeedback(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit answer.';
      window.alert(message);
    } finally {
      setIsBusy(false);
    }
  }, [
    answer,
    isBusy,
    questionIndex,
    refreshTranscript,
    serverTurns,
    sessionUuid,
    totalQuestions,
  ]);

  const endSimulation = useCallback(async () => {
    if (!sessionUuid || isBusy || isCompleting) return;
    setIsBusy(true);
    setIsCompleting(true);
    setShowReportModal(true);
    try {
      const completed = await completeInterviewSession(sessionUuid);
      const report = completed.report ?? null;
      const score = report?.overall_score ?? completed.final_evaluation?.overall_score ?? 0;
      setOverallSummaryScore(score);
      setSessionReport(report);
      refreshTranscript(completed.session?.turns || []);
      setView('summary');
    } catch (err) {
      setShowReportModal(false);
      const message = err instanceof Error ? err.message : 'Failed to complete interview.';
      window.alert(message);
    } finally {
      setIsBusy(false);
      setIsCompleting(false);
    }
  }, [isBusy, isCompleting, refreshTranscript, sessionUuid]);

  const closeReportModal = useCallback(() => {
    setShowReportModal(false);
  }, []);

  const openReportModal = useCallback(() => {
    if (sessionReport) setShowReportModal(true);
  }, [sessionReport]);

  const nextQuestion = useCallback(() => {
    if (pendingCompletion || questionIndex + 1 >= totalQuestions) {
      void endSimulation();
      return;
    }
    const nextIndex = questionIndex + 1;
    setQuestionIndex(nextIndex);
    setAnswer(serverTurns[nextIndex]?.answer || '');
    setShowFeedback(false);
  }, [endSimulation, pendingCompletion, questionIndex, serverTurns, totalQuestions]);

  const skipQuestion = useCallback(() => {
    if (isBusy || !sessionUuid) return;
    const skippedText = config.language === 'fr' ? 'Je préfère passer cette question.' : 'I prefer to skip this question.';
    setAnswer(skippedText);
    setShowFeedback(false);
    void submitInterviewAnswer(sessionUuid, {
      question_uuid: serverTurns[questionIndex]?.question_uuid,
      answer: skippedText,
    }).then((response) => {
      setServerTurns(response.turns || []);
      refreshTranscript(response.turns || []);
      if (questionIndex + 1 >= totalQuestions) {
        void endSimulation();
        return;
      }
      setQuestionIndex((i) => i + 1);
      setAnswer('');
    }).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to skip question.';
      window.alert(message);
    });
  }, [config.language, endSimulation, isBusy, questionIndex, refreshTranscript, serverTurns, sessionUuid, totalQuestions]);

  const backToHub = useCallback(() => {
    if (view === 'active') {
      window.alert('You cannot close or leave the page while the simulation is active. Use "End Simulation".');
      return;
    }
    setView('hub');
    setConfigStep(0);
    setSelectedModeId(null);
    setSessionUuid(null);
    setServerTurns([]);
  }, [view]);

  const continueLastSession = useCallback(async () => {
    if (!sessionUuid) {
      window.alert('No active simulation to continue.');
      return;
    }
    try {
      const detail = await getInterviewSessionDetail(sessionUuid);
      if (detail.status !== 'in_progress') {
        window.alert('This session has ended. Start a new simulation.');
        setSessionUuid(null);
        setServerTurns([]);
        return;
      }
      setServerTurns(detail.turns || []);
      setView('active');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to resume session.';
      window.alert(message);
    }
  }, [sessionUuid]);

  useEffect(() => {
    if (view !== 'active' || timeRemaining <= 0) return undefined;
    const id = window.setInterval(() => {
      setTimeRemaining((t) => Math.max(0, t - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [view, timeRemaining]);

  useEffect(() => {
    if (view !== 'active') return undefined;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [view]);

  useEffect(() => {
    if (view === 'active' && timeRemaining === 0) {
      void endSimulation();
    }
  }, [endSimulation, timeRemaining, view]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  const toggleRecording = useCallback(() => {
    setIsRecording((r) => !r);
  }, []);

  return {
    view,
    setView,
    config,
    setConfig,
    configStep,
    setConfigStep,
    selectedModeId,
    questionIndex,
    totalQuestions,
    currentQuestion,
    answer,
    setAnswer,
    timeRemaining,
    sessionScore,
    showFeedback,
    liveFeedback,
    answerFeedback,
    transcript,
    expandedTranscriptId,
    setExpandedTranscriptId,
    isRecording,
    apiUnavailable,
    isBusy,
    startConfig,
    startConfigWithOffer,
    startSimulation,
    submitAnswer,
    nextQuestion,
    skipQuestion,
    endSimulation,
    backToHub,
    continueLastSession,
    formatTime,
    toggleRecording,
    overallSummaryScore,
    sessionReport,
    showReportModal,
    isCompleting,
    closeReportModal,
    openReportModal,
  };
}
