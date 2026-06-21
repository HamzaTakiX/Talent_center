import { useCallback, useEffect, useMemo, useState } from 'react';
import { INTERVIEW_QUESTIONS, LIVE_FEEDBACK_CATEGORIES } from '../data/interviewSimulatorDashboardMock';
import { QUESTIONS_BY_LENGTH } from '../data/interviewConfigMock';
import type {
  AnswerFeedback,
  InterviewModeId,
  SimulatorConfig,
  SimulatorView,
} from '../types/interviewSimulatorDashboard';

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
};

export function useInterviewSimulator(hasHistory = true) {
  const [view, setView] = useState<SimulatorView>(hasHistory ? 'hub' : 'hub');
  const [config, setConfig] = useState<SimulatorConfig>(DEFAULT_CONFIG);
  const [configStep, setConfigStep] = useState(0);
  const [selectedModeId, setSelectedModeId] = useState<InterviewModeId | null>(null);
  const [apiUnavailable] = useState(true);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [expandedTranscriptId, setExpandedTranscriptId] = useState<string | null>(null);

  const totalQuestions = useMemo(
    () => QUESTIONS_BY_LENGTH[config.length] ?? 5,
    [config.length],
  );

  const currentQuestion = INTERVIEW_QUESTIONS[questionIndex % INTERVIEW_QUESTIONS.length];

  const liveFeedback = useMemo(
    () => LIVE_FEEDBACK_CATEGORIES.map((cat) => ({ ...cat, score: 0 })),
    [],
  );

  const startConfig = useCallback((modeId: InterviewModeId) => {
    setSelectedModeId(modeId);
    setConfig((c) => ({ ...c, modeId }));
    setConfigStep(0);
    setView('config');
  }, []);

  const startSimulation = useCallback(() => {
    setQuestionIndex(0);
    setAnswer('');
    setShowFeedback(false);
    setSessionScore(0);
    setTimeRemaining(config.length * 60);
    setView('active');
  }, [config.length]);

  const submitAnswer = useCallback(() => {
    setShowFeedback(true);
  }, []);

  const nextQuestion = useCallback(() => {
    if (questionIndex + 1 >= totalQuestions) {
      setView('summary');
      return;
    }
    setQuestionIndex((i) => i + 1);
    setAnswer('');
    setShowFeedback(false);
  }, [questionIndex, totalQuestions]);

  const skipQuestion = useCallback(() => {
    nextQuestion();
  }, [nextQuestion]);

  const backToHub = useCallback(() => {
    setView('hub');
    setConfigStep(0);
    setSelectedModeId(null);
  }, []);

  const continueLastSession = useCallback(() => {
    setView('active');
    setQuestionIndex(1);
    setTimeRemaining(8 * 60);
  }, []);

  useEffect(() => {
    if (view !== 'active' || timeRemaining <= 0) return undefined;
    const id = window.setInterval(() => {
      setTimeRemaining((t) => Math.max(0, t - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [view, timeRemaining]);

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
    answerFeedback: EMPTY_ANSWER_FEEDBACK,
    transcript: [],
    expandedTranscriptId,
    setExpandedTranscriptId,
    isRecording,
    apiUnavailable,
    startConfig,
    startSimulation,
    submitAnswer,
    nextQuestion,
    skipQuestion,
    backToHub,
    continueLastSession,
    formatTime,
    toggleRecording,
    overallSummaryScore: 0,
  };
}
