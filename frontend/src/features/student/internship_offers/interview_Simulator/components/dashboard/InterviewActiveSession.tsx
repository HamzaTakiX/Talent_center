import { CSSProperties, FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Briefcase,
  CheckCircle2,
  Code2,
  Gauge,
  HelpCircle,
  LayoutList,
  Lightbulb,
  MessageSquare,
  Mic,
  RefreshCw,
  Loader2,
  RotateCcw,
  Send,
  SkipForward,
  Sparkles,
  StopCircle,
  Target,
  Timer,
  Trophy,
  Volume2,
  type LucideIcon,
} from 'lucide-react';
import { transcribeInterviewAudio } from '../../../api/offerAiCoachApi';
import type { AnswerFeedback, InterviewQuestion, LiveFeedbackCategory, SimulatorConfig } from '../../types/interviewSimulatorDashboard';
import { AnimatedCounter, ScoreBar, TypingText, fadeUp } from './InterviewPrimitives';
import { interviewerAvatarUrl, interviewerInitials } from '../../utils/interviewerAvatars';

type BrowserSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((event?: unknown) => void) | null;
  maxAlternatives?: number;
  start: () => void;
  stop: () => void;
};

const LIVE_FEEDBACK_ICONS: Record<string, LucideIcon> = {
  communication: MessageSquare,
  technical: Code2,
  confidence: Sparkles,
  structure: LayoutList,
  relevance: Target,
  professionalism: Briefcase,
};

const liveScoreTone = (score: number) => {
  if (score >= 75) return 'high';
  if (score >= 50) return 'medium';
  if (score > 0) return 'low';
  return 'idle';
};

interface InterviewActiveSessionProps {
  config: SimulatorConfig;
  questionIndex: number;
  totalQuestions: number;
  currentQuestion: InterviewQuestion;
  answer: string;
  onAnswerChange: (v: string) => void;
  timeRemaining: number;
  sessionScore: number;
  formatTime: (s: number) => string;
  showFeedback: boolean;
  answerFeedback: AnswerFeedback;
  liveFeedback: LiveFeedbackCategory[];
  isRecording: boolean;
  onToggleRecording: () => void;
  onSubmit: () => void;
  onSkip: () => void;
  onNext: () => void;
  onEndSimulation: () => void;
  isBusy: boolean;
}

const InterviewActiveSession: FunctionComponent<InterviewActiveSessionProps> = ({
  config,
  questionIndex,
  totalQuestions,
  currentQuestion,
  answer,
  onAnswerChange,
  timeRemaining,
  sessionScore,
  formatTime,
  showFeedback,
  answerFeedback,
  liveFeedback,
  isRecording,
  onToggleRecording,
  onSubmit,
  onSkip,
  onNext,
  onEndSimulation,
  isBusy,
}) => {
  const { t } = useTranslation();
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [recognitionActive, setRecognitionActive] = useState(false);
  const [questionSpeaking, setQuestionSpeaking] = useState(false);
  const [micTestActive, setMicTestActive] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [voiceError, setVoiceError] = useState<string>('');
  const [mediaRecorderSupported, setMediaRecorderSupported] = useState(false);
  const [useBackendSttFallback, setUseBackendSttFallback] = useState(false);
  const [fallbackTranscribing, setFallbackTranscribing] = useState(false);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micRafRef = useRef<number | null>(null);
  const answerBaseRef = useRef('');
  const userStoppedRef = useRef(false);
  const shouldKeepListeningRef = useRef(false);
  const restartTimeoutRef = useRef<number | null>(null);
  const blockAutoRestartRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaRecorderStreamRef = useRef<MediaStream | null>(null);
  const mediaChunksRef = useRef<Blob[]>([]);
  const autoStartFallbackRef = useRef(false);
  const fallbackAutoStopRef = useRef<number | null>(null);

  const languageCode = useMemo(() => {
    if (config.language === 'ar') return 'ar';
    if (config.language === 'en') return 'en-US';
    return 'fr-FR';
  }, [config.language]);

  useEffect(() => {
    const hasTts = typeof window !== 'undefined' && 'speechSynthesis' in window;
    const SpeechRecognitionCtor = (
      window as typeof window & {
        SpeechRecognition?: new () => BrowserSpeechRecognition;
        webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
      }
    ).SpeechRecognition || (
      window as typeof window & {
        webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
      }
    ).webkitSpeechRecognition;
    setTtsSupported(Boolean(hasTts));
    setSpeechRecognitionSupported(Boolean(SpeechRecognitionCtor));
    setMediaRecorderSupported(typeof window !== 'undefined' && 'MediaRecorder' in window);
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = languageCode;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    setVoiceError('');
    recognition.onresult = (event) => {
      let fullTranscript = '';
      for (let i = 0; i < event.results.length; i += 1) {
        const chunk = event.results[i][0]?.transcript ?? '';
        if (chunk) fullTranscript += `${chunk} `;
      }
      const next = `${answerBaseRef.current}${fullTranscript}`.trimStart();
      onAnswerChange(next);
    };
    recognition.onend = () => {
      setRecognitionActive(false);
      if (!shouldKeepListeningRef.current || userStoppedRef.current || blockAutoRestartRef.current) {
        blockAutoRestartRef.current = false;
        userStoppedRef.current = false;
        return;
      }
      if (restartTimeoutRef.current) {
        window.clearTimeout(restartTimeoutRef.current);
      }
      restartTimeoutRef.current = window.setTimeout(() => {
        if (!shouldKeepListeningRef.current || !recognitionRef.current) return;
        try {
          recognitionRef.current.start();
          setRecognitionActive(true);
        } catch {
          // Browser may throw if restart is too quick.
        }
      }, 180);
      userStoppedRef.current = false;
    };
    recognition.onerror = (event: unknown) => {
      setRecognitionActive(false);
      const maybe = event as { error?: string };
      const err = maybe?.error || 'unknown';
      if (err === 'not-allowed' || err === 'service-not-allowed') {
        shouldKeepListeningRef.current = false;
        blockAutoRestartRef.current = true;
        setVoiceError('Microphone permission blocked. Allow mic access in browser settings.');
      } else if (err === 'no-speech') {
        setVoiceError('No speech detected. Try speaking louder/closer to the mic.');
      } else if (err === 'audio-capture') {
        shouldKeepListeningRef.current = false;
        blockAutoRestartRef.current = true;
        setVoiceError('No microphone detected by browser.');
      } else if (err === 'network') {
        shouldKeepListeningRef.current = false;
        blockAutoRestartRef.current = true;
        autoStartFallbackRef.current = true;
        setUseBackendSttFallback(true);
        setVoiceError('');
      } else {
        shouldKeepListeningRef.current = false;
        blockAutoRestartRef.current = true;
        setVoiceError(`Voice recognition error: ${err}`);
      }
    };
    recognitionRef.current = recognition;
  }, [languageCode, onAnswerChange]);

  useEffect(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.lang = languageCode;
  }, [languageCode]);

  const speakQuestion = useCallback(() => {
    if (!ttsSupported || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQuestion.text);
    utterance.lang = languageCode;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setQuestionSpeaking(true);
    utterance.onend = () => setQuestionSpeaking(false);
    utterance.onerror = () => setQuestionSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [currentQuestion.text, languageCode, ttsSupported]);

  useEffect(() => {
    if (config.medium === 'text') return;
    speakQuestion();
  }, [config.medium, currentQuestion.id, speakQuestion]);

  const stopMediaRecorderStream = useCallback(() => {
    if (mediaRecorderStreamRef.current) {
      mediaRecorderStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaRecorderStreamRef.current = null;
    }
  }, []);

  const stopBackendSttRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    setRecognitionActive(false);
    if (fallbackAutoStopRef.current) {
      window.clearTimeout(fallbackAutoStopRef.current);
      fallbackAutoStopRef.current = null;
    }
    if (!recorder) return;
    if (recorder.state !== 'inactive') {
      recorder.stop();
    }
    mediaRecorderRef.current = null;
  }, []);

  const startBackendSttRecording = useCallback(async () => {
    if (!mediaRecorderSupported || !navigator.mediaDevices?.getUserMedia) {
      window.alert('Audio recording fallback is not supported in this browser.');
      return;
    }
    setVoiceError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderStreamRef.current = stream;
      mediaChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          mediaChunksRef.current.push(event.data);
        }
      };
      recorder.onerror = () => {
        setRecognitionActive(false);
        stopMediaRecorderStream();
        setVoiceError('Audio recorder failed. Please retry.');
      };
      recorder.onstop = async () => {
        try {
          setFallbackTranscribing(true);
          if (fallbackAutoStopRef.current) {
            window.clearTimeout(fallbackAutoStopRef.current);
            fallbackAutoStopRef.current = null;
          }
          const audioBlob = new Blob(mediaChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          if (audioBlob.size === 0) {
            setVoiceError('No audio captured. Please speak and retry.');
            return;
          }
          const result = await transcribeInterviewAudio(audioBlob, {
            language: languageCode,
            filename: `interview-answer-${Date.now()}.webm`,
          });
          if (result.text?.trim()) {
            const merged = `${answer.trimEnd()} ${result.text.trim()}`.trim();
            onAnswerChange(merged);
            setVoiceError('');
          } else {
            setVoiceError('Transcription returned empty text.');
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Audio transcription failed.';
          setVoiceError(message);
        } finally {
          mediaChunksRef.current = [];
          stopMediaRecorderStream();
          setRecognitionActive(false);
          setFallbackTranscribing(false);
        }
      };
      recorder.start();
      setRecognitionActive(true);
      fallbackAutoStopRef.current = window.setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      }, 7000);
    } catch {
      setRecognitionActive(false);
      setVoiceError('Microphone permission denied or unavailable.');
    }
  }, [answer, languageCode, mediaRecorderSupported, onAnswerChange, stopMediaRecorderStream]);

  useEffect(() => {
    if (!useBackendSttFallback || !autoStartFallbackRef.current || recognitionActive) return;
    autoStartFallbackRef.current = false;
    void startBackendSttRecording();
  }, [recognitionActive, startBackendSttRecording, useBackendSttFallback]);

  const toggleVoiceInput = useCallback(() => {
    if (useBackendSttFallback) {
      if (recognitionActive) {
        stopBackendSttRecording();
        return;
      }
      void startBackendSttRecording();
      return;
    }
    if (!speechRecognitionSupported || !recognitionRef.current) {
      window.alert('Voice recognition is not supported in this browser.');
      return;
    }
    if (recognitionActive) {
      shouldKeepListeningRef.current = false;
      userStoppedRef.current = true;
      recognitionRef.current.stop();
      return;
    }
    answerBaseRef.current = answer ? `${answer.trimEnd()} ` : '';
    setVoiceError('');
    blockAutoRestartRef.current = false;
    shouldKeepListeningRef.current = true;
    userStoppedRef.current = false;
    try {
      recognitionRef.current.start();
      setRecognitionActive(true);
    } catch {
      shouldKeepListeningRef.current = false;
      setRecognitionActive(false);
      setVoiceError('Unable to start voice recognition. Check internet and try again.');
    }
  }, [
    answer,
    recognitionActive,
    speechRecognitionSupported,
    startBackendSttRecording,
    stopBackendSttRecording,
    useBackendSttFallback,
  ]);

  const stopMicTest = useCallback(() => {
    if (micRafRef.current) {
      window.cancelAnimationFrame(micRafRef.current);
      micRafRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setMicLevel(0);
    setMicTestActive(false);
  }, []);

  const startMicTest = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      window.alert('Microphone test is not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        stream.getTracks().forEach((track) => track.stop());
        window.alert('Audio context is not supported in this browser.');
        return;
      }
      const audioContext = new AudioCtx();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      micStreamRef.current = stream;
      setMicTestActive(true);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        const currentAnalyser = analyserRef.current;
        if (!currentAnalyser) return;
        currentAnalyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i += 1) sum += dataArray[i];
        const avg = Math.min(100, Math.round(sum / dataArray.length));
        setMicLevel(avg);
        micRafRef.current = window.requestAnimationFrame(tick);
      };
      micRafRef.current = window.requestAnimationFrame(tick);
    } catch {
      window.alert('Microphone permission denied or unavailable.');
    }
  }, []);

  const toggleMicTest = useCallback(() => {
    if (micTestActive) {
      stopMicTest();
      return;
    }
    void startMicTest();
  }, [micTestActive, startMicTest, stopMicTest]);

  useEffect(() => () => {
    if (recognitionRef.current) {
      try {
        shouldKeepListeningRef.current = false;
        recognitionRef.current.stop();
      } catch {
        // no-op
      }
    }
    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
    }
    stopBackendSttRecording();
    stopMediaRecorderStream();
    stopMicTest();
  }, [stopBackendSttRecording, stopMediaRecorderStream, stopMicTest]);

  return (
    <div className="sr-is sr-is-active">
      <header className="sr-is-active__topbar">
        <div className="sr-is-active__topbar-stats">
          <article
            className="admin-students-stat-card admin-students-stat-card--compact sr-is-active__stat-card"
            style={
              {
                '--student-stat-accent': timeRemaining <= 30 ? '#f97316' : '#3b82f6',
                '--student-stat-accent-bg':
                  timeRemaining <= 30 ? 'rgba(249, 115, 22, 0.16)' : 'rgba(59, 130, 246, 0.16)',
              } as CSSProperties
            }
          >
            <div className="admin-students-stat-card__body">
              <div className="admin-students-stat-card__head">
                <span className="admin-students-stat-card__icon" aria-hidden>
                  <Timer className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <p className="admin-students-stat-card__title">
                  {t('student.internshipOffers.interviewSim.active.time')}
                </p>
              </div>
              <p
                className={`admin-students-stat-card__value${
                  timeRemaining <= 30 ? ' sr-is-active__stat-value--warning' : ''
                }`}
              >
                {formatTime(timeRemaining)}
              </p>
              <span className="admin-students-stat-card__badge">
                {timeRemaining <= 30
                  ? t('student.internshipOffers.interviewSim.active.timeUrgent', {
                      defaultValue: 'Urgent',
                    })
                  : t('student.internshipOffers.interviewSim.active.timeLive', {
                      defaultValue: 'En cours',
                    })}
              </span>
            </div>
          </article>

          <article
            className="admin-students-stat-card admin-students-stat-card--compact sr-is-active__stat-card"
            style={
              {
                '--student-stat-accent': '#6366f1',
                '--student-stat-accent-bg': 'rgba(99, 102, 241, 0.16)',
              } as CSSProperties
            }
          >
            <div className="admin-students-stat-card__body">
              <div className="admin-students-stat-card__head">
                <span className="admin-students-stat-card__icon" aria-hidden>
                  <Gauge className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <p className="admin-students-stat-card__title">
                  {t('student.internshipOffers.interviewSim.active.difficulty')}
                </p>
              </div>
              <p className="admin-students-stat-card__value capitalize">{config.difficulty}</p>
              <span className="admin-students-stat-card__badge">
                {t('student.internshipOffers.interviewSim.active.difficultyBadge', {
                  defaultValue: 'Niveau',
                })}
              </span>
            </div>
          </article>

          <article
            className="admin-students-stat-card admin-students-stat-card--compact sr-is-active__stat-card"
            style={
              {
                '--student-stat-accent': '#f59e0b',
                '--student-stat-accent-bg': 'rgba(245, 158, 11, 0.16)',
              } as CSSProperties
            }
          >
            <div className="admin-students-stat-card__body">
              <div className="admin-students-stat-card__head">
                <span className="admin-students-stat-card__icon" aria-hidden>
                  <Trophy className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <p className="admin-students-stat-card__title">
                  {t('student.internshipOffers.interviewSim.active.score')}
                </p>
              </div>
              <p className="admin-students-stat-card__value">
                <AnimatedCounter value={sessionScore} />
              </p>
              <span className="admin-students-stat-card__badge">
                {t('student.internshipOffers.interviewSim.active.scoreBadge', {
                  defaultValue: 'Points',
                })}
              </span>
            </div>
          </article>
        </div>

        <button
          type="button"
          className="sr-is-btn sr-is-active__end-btn"
          onClick={onEndSimulation}
          aria-label={t('student.internshipOffers.interviewSim.active.endSimulation')}
        >
          <StopCircle className="h-4 w-4" aria-hidden />
          {t('student.internshipOffers.interviewSim.active.end')}
        </button>
      </header>

      <div className="sr-is-active__body">
        <div className="sr-is-active__main">
          <motion.div className="sr-is-glass sr-is-interviewer" {...fadeUp}>
            <div className="sr-is-interviewer__avatar" aria-hidden>
              <img
                src={
                  currentQuestion.interviewerAvatarUrl ??
                  interviewerAvatarUrl(currentQuestion.interviewerName)
                }
                alt=""
                className="sr-is-interviewer__avatar-img"
                loading="lazy"
                onError={(event) => {
                  const target = event.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling;
                  if (fallback instanceof HTMLElement) fallback.hidden = false;
                }}
              />
              <span className="sr-is-interviewer__avatar-fallback" hidden>
                {interviewerInitials(currentQuestion.interviewerName)}
              </span>
            </div>
            <div>
              <p className="m-0 text-sm font-bold text-[var(--admin-text)]">{currentQuestion.interviewerName}</p>
              <p className="m-0 text-xs text-[var(--admin-text-muted)]">{currentQuestion.interviewerRole}</p>
            </div>
          </motion.div>

          <motion.div className="sr-is-glass sr-is-question-card" {...fadeUp} key={currentQuestion.id}>
            <TypingText text={currentQuestion.text} />
            <div className="sr-is-question-actions">
              <button
                type="button"
                className={`sr-is-icon-btn${questionSpeaking ? ' sr-is-icon-btn--recording' : ''}`}
                onClick={speakQuestion}
                aria-label={t('student.internshipOffers.interviewSim.active.playVoice')}
              >
                <Volume2 className="h-4 w-4" />
              </button>
              <button type="button" className="sr-is-icon-btn" aria-label={t('student.internshipOffers.interviewSim.active.regenerate')}>
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="sr-is-icon-btn"
                onClick={speakQuestion}
                aria-label={t('student.internshipOffers.interviewSim.active.repeat')}
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

          <motion.div className="sr-is-answer-shell" {...fadeUp}>
            <textarea
              className="sr-is-textarea sr-is-active__answer-textarea"
              placeholder={fallbackTranscribing ? 'Transcribing voice...' : t('student.internshipOffers.interviewSim.active.placeholder')}
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              disabled={showFeedback || isBusy || fallbackTranscribing}
            />
            {fallbackTranscribing ? (
              <div className="sr-is-input-loading" aria-live="polite">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                <span>Voice recognized, preparing text...</span>
              </div>
            ) : null}
            <div className="sr-is-answer-meta">
              <span>{answer.length} {t('student.internshipOffers.interviewSim.active.chars')}</span>
              {config.medium === 'voice' && (
                <span>{t('student.internshipOffers.interviewSim.active.liveTranscript')}</span>
              )}
            </div>
            <div className="sr-is-active__answer-actions">
              <button
                type="button"
                className={`sr-is-icon-btn${recognitionActive ? ' sr-is-icon-btn--recording' : ''}`}
                onClick={toggleVoiceInput}
                aria-label={t('student.internshipOffers.interviewSim.active.record')}
                disabled={!speechRecognitionSupported && !mediaRecorderSupported}
              >
                <Mic className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={`sr-is-btn sr-is-btn--ghost${micTestActive ? ' sr-is-btn--ghost-active' : ''}`}
                onClick={toggleMicTest}
              >
                {micTestActive ? 'Stop mic test' : 'Test mic'}
              </button>
              <div className="sr-is-mic-meter" aria-label="Microphone level">
                <span className="sr-is-mic-meter__label">{micTestActive ? 'Mic live' : 'Mic idle'}</span>
                <div className="sr-is-mic-meter__track">
                  <div className="sr-is-mic-meter__fill" style={{ width: `${micLevel}%` }} />
                </div>
              </div>
              {voiceError ? <span className="sr-is-mic-error">{voiceError}</span> : null}
              {useBackendSttFallback ? <span className="sr-is-mic-info">Fallback transcription mode enabled (auto-send after ~7s or on second mic click).</span> : null}
              {fallbackTranscribing ? <span className="sr-is-mic-info">Transcribing audio...</span> : null}
              {isBusy ? <span className="sr-is-mic-info">Analyzing your answer...</span> : null}
              {!showFeedback ? (
                <>
                  <button type="button" className="sr-is-btn sr-is-btn--primary" onClick={onSubmit} disabled={!answer.trim() || isBusy}>
                    {isBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
                    {isBusy ? 'Analyzing...' : t('student.internshipOffers.interviewSim.active.submit')}
                  </button>
                  <button type="button" className="sr-is-btn sr-is-btn--secondary" onClick={onSkip} disabled={isBusy}>
                    <SkipForward className="h-4 w-4" aria-hidden />
                    {t('student.internshipOffers.interviewSim.active.skip')}
                  </button>
                  <button type="button" className="sr-is-btn sr-is-btn--ghost" disabled={isBusy}>
                    <HelpCircle className="h-4 w-4" aria-hidden />
                    {t('student.internshipOffers.interviewSim.active.hint')}
                  </button>
                </>
              ) : (
                <button type="button" className="sr-is-btn sr-is-btn--primary" onClick={onNext} disabled={isBusy}>
                  {questionIndex + 1 >= totalQuestions
                    ? t('student.internshipOffers.interviewSim.active.finish')
                    : t('student.internshipOffers.interviewSim.active.nextQuestion')}
                </button>
              )}
            </div>
          </motion.div>

          <AnimatePresence>
            {showFeedback && (
              <motion.div
                className="sr-is-answer-feedback"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="sr-is-feedback-heading sr-is-feedback-heading--positive">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      {t('student.internshipOffers.interviewSim.feedback.wentWell')}
                    </h4>
                    <ul className="sr-is-feedback-list">
                      {answerFeedback.wentWell.map((item) => (
                        <li key={item} className="sr-is-feedback-list__item sr-is-feedback-list__item--positive">{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="sr-is-feedback-heading sr-is-feedback-heading--warning">
                      <Lightbulb className="h-3.5 w-3.5" aria-hidden />
                      {t('student.internshipOffers.interviewSim.feedback.needsImprovement')}
                    </h4>
                    <ul className="sr-is-feedback-list">
                      {answerFeedback.needsImprovement.map((item) => (
                        <li key={item} className="sr-is-feedback-list__item sr-is-feedback-list__item--warning">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="sr-is-feedback-heading">{t('student.internshipOffers.interviewSim.feedback.suggested')}</h4>
                  <p className="m-0 mt-1 text-sm text-[var(--admin-text-secondary)]">{answerFeedback.suggestedAnswer}</p>
                </div>
                <div className="mt-3">
                  <h4 className="sr-is-feedback-heading">{t('student.internshipOffers.interviewSim.feedback.professional')}</h4>
                  <p className="m-0 mt-1 rounded-lg bg-[var(--admin-bg-elevated)] p-3 text-sm italic text-[var(--admin-text-secondary)]">
                    {answerFeedback.professionalExample}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {answerFeedback.vocabulary.map((w) => (
                    <span key={w} className="sr-is-tag sr-is-tag--vocab">{w}</span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="sr-is-active__feedback">
          <header className="sr-is-live-eval__header">
            <span className="sr-is-live-eval__header-icon" aria-hidden>
              <Lightbulb className="h-4 w-4" strokeWidth={1.8} />
            </span>
            <div className="sr-is-live-eval__header-copy">
              <h3 className="sr-is-live-eval__title">
                {t('student.internshipOffers.interviewSim.feedback.liveTitle')}
              </h3>
              <p className="sr-is-live-eval__subtitle">
                {t('student.internshipOffers.interviewSim.feedback.liveSubtitle', {
                  defaultValue: 'Scores mis à jour à chaque réponse',
                })}
              </p>
            </div>
          </header>

          <div className="sr-is-live-eval__list">
            {liveFeedback.map((cat, i) => {
              const Icon = LIVE_FEEDBACK_ICONS[cat.id] ?? Gauge;
              const tone = liveScoreTone(cat.score);

              return (
                <div
                  key={cat.id}
                  className={`sr-is-live-eval__item sr-is-live-eval__item--${tone}`}
                  style={{ '--live-eval-delay': `${i * 40}ms` } as CSSProperties}
                >
                  <div className="sr-is-live-eval__item-head">
                    <span className="sr-is-live-eval__item-icon" aria-hidden>
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </span>
                    <span className="sr-is-live-eval__item-label">{t(cat.labelKey)}</span>
                    <span className="sr-is-live-eval__item-score">
                      <AnimatedCounter value={cat.score} suffix="%" />
                    </span>
                  </div>
                  <ScoreBar score={cat.score} delay={i * 0.08} className="sr-is-live-eval__bar" />
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default InterviewActiveSession;
