import { useCallback, useEffect, useState } from 'react';
import {
  evaluateOfferInterviewAnswer,
  fetchOfferComparisonSafe,
  startOfferInterviewSession,
} from '../api/offerAiCoachApi';
import type {
  OfferComparisonData,
  OfferInterviewAnswerFeedback,
  OfferInterviewQuestion,
  OfferInterviewSession,
} from '../types/offerAiCoach';

export function useOfferComparison(offerId: string | undefined) {
  const [data, setData] = useState<OfferComparisonData | null>(null);
  const [loading, setLoading] = useState(Boolean(offerId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!offerId) return;
    setLoading(true);
    setError(null);
    const result = await fetchOfferComparisonSafe(offerId);
    if (result.ok) {
      setData(result.data);
    } else {
      setError(result.error);
      setData(null);
    }
    setLoading(false);
  }, [offerId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

type InterviewPhase = 'idle' | 'loading' | 'active' | 'feedback' | 'summary';

export function useOfferInterviewSimulation(offerId: string | undefined) {
  const [phase, setPhase] = useState<InterviewPhase>('idle');
  const [session, setSession] = useState<OfferInterviewSession | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<OfferInterviewAnswerFeedback | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  const currentQuestion: OfferInterviewQuestion | null =
    session?.questions[questionIndex] ?? null;

  const start = useCallback(async () => {
    if (!offerId) return;
    setPhase('loading');
    setError(null);
    setScores([]);
    setQuestionIndex(0);
    setAnswer('');
    setFeedback(null);
    try {
      const result = await startOfferInterviewSession(offerId);
      setSession(result);
      setPhase('active');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Simulation failed';
      setError(message);
      setPhase('idle');
    }
  }, [offerId]);

  const submitAnswer = useCallback(async () => {
    if (!offerId || !currentQuestion || !answer.trim()) return;
    setEvaluating(true);
    setError(null);
    try {
      const result = await evaluateOfferInterviewAnswer(offerId, {
        question: currentQuestion,
        answer: answer.trim(),
      });
      setFeedback(result.feedback);
      setScores((prev) => [...prev, result.feedback.score]);
      setPhase('feedback');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Evaluation failed';
      setError(message);
    } finally {
      setEvaluating(false);
    }
  }, [offerId, currentQuestion, answer]);

  const nextQuestion = useCallback(() => {
    if (!session) return;
    const nextIndex = questionIndex + 1;
    if (nextIndex >= session.questions.length) {
      setPhase('summary');
      return;
    }
    setQuestionIndex(nextIndex);
    setAnswer('');
    setFeedback(null);
    setPhase('active');
  }, [session, questionIndex]);

  const reset = useCallback(() => {
    setPhase('idle');
    setSession(null);
    setQuestionIndex(0);
    setAnswer('');
    setFeedback(null);
    setScores([]);
    setError(null);
  }, []);

  const averageScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return {
    phase,
    session,
    currentQuestion,
    questionIndex,
    totalQuestions: session?.questions.length ?? 0,
    answer,
    setAnswer,
    feedback,
    scores,
    averageScore,
    error,
    evaluating,
    start,
    submitAnswer,
    nextQuestion,
    reset,
  };
}
