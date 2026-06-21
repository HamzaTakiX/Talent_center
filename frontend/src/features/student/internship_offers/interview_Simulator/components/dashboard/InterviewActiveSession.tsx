import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HelpCircle,
  Lightbulb,
  Mic,
  RefreshCw,
  RotateCcw,
  Send,
  SkipForward,
  Volume2,
  X,
} from 'lucide-react';
import type { AnswerFeedback, InterviewQuestion, LiveFeedbackCategory, SimulatorConfig } from '../../types/interviewSimulatorDashboard';
import { AnimatedCounter, ScoreBar, TypingText, fadeUp } from './InterviewPrimitives';

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
  onExit: () => void;
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
  onExit,
}) => {
  const { t } = useTranslation();
  const progress = ((questionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="sr-is sr-is-active">
      <header className="sr-is-active__topbar">
        <button type="button" className="sr-is-icon-btn" onClick={onExit} aria-label={t('student.internshipOffers.interviewSim.active.exit')}>
          <X className="h-4 w-4" />
        </button>
        <div className="sr-is-active__stat">
          <span className="sr-is-active__stat-label">{t('student.internshipOffers.interviewSim.active.progress')}</span>
          <span className="sr-is-active__stat-value">{questionIndex + 1} / {totalQuestions}</span>
        </div>
        <div className="sr-is-active__stat" style={{ flex: 1, maxWidth: 160 }}>
          <span className="sr-is-active__stat-label">{t('student.internshipOffers.interviewSim.active.progress')}</span>
          <div className="sr-is-progress mt-1">
            <motion.div className="sr-is-progress__fill" animate={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="sr-is-active__stat">
          <span className="sr-is-active__stat-label">{t('student.internshipOffers.interviewSim.active.time')}</span>
          <span className="sr-is-active__stat-value">{formatTime(timeRemaining)}</span>
        </div>
        <div className="sr-is-active__stat">
          <span className="sr-is-active__stat-label">{t('student.internshipOffers.interviewSim.active.difficulty')}</span>
          <span className="sr-is-active__stat-value capitalize">{config.difficulty}</span>
        </div>
        <div className="sr-is-active__stat">
          <span className="sr-is-active__stat-label">{t('student.internshipOffers.interviewSim.active.score')}</span>
          <span className="sr-is-active__stat-value text-[var(--admin-brand)]">
            <AnimatedCounter value={sessionScore} />
          </span>
        </div>
      </header>

      <div className="sr-is-active__body">
        <div className="sr-is-active__main">
          <motion.div className="sr-is-glass sr-is-interviewer" {...fadeUp}>
            <div className="sr-is-interviewer__avatar" aria-hidden>
              {currentQuestion.interviewerName.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <p className="m-0 text-sm font-bold text-[var(--admin-text)]">{currentQuestion.interviewerName}</p>
              <p className="m-0 text-xs text-[var(--admin-text-muted)]">{currentQuestion.interviewerRole}</p>
            </div>
          </motion.div>

          <motion.div className="sr-is-glass sr-is-question-card" {...fadeUp} key={currentQuestion.id}>
            <TypingText text={currentQuestion.text} />
            <div className="sr-is-question-actions">
              <button type="button" className="sr-is-icon-btn" aria-label={t('student.internshipOffers.interviewSim.active.playVoice')}>
                <Volume2 className="h-4 w-4" />
              </button>
              <button type="button" className="sr-is-icon-btn" aria-label={t('student.internshipOffers.interviewSim.active.regenerate')}>
                <RefreshCw className="h-4 w-4" />
              </button>
              <button type="button" className="sr-is-icon-btn" aria-label={t('student.internshipOffers.interviewSim.active.repeat')}>
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

          <motion.div {...fadeUp}>
            <textarea
              className="sr-is-textarea"
              placeholder={t('student.internshipOffers.interviewSim.active.placeholder')}
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              disabled={showFeedback}
            />
            <div className="sr-is-answer-meta">
              <span>{answer.length} {t('student.internshipOffers.interviewSim.active.chars')}</span>
              {config.medium === 'voice' && (
                <span>{t('student.internshipOffers.interviewSim.active.liveTranscript')}</span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className={`sr-is-icon-btn${isRecording ? ' sr-is-icon-btn--recording' : ''}`}
                onClick={onToggleRecording}
                aria-label={t('student.internshipOffers.interviewSim.active.record')}
              >
                <Mic className="h-4 w-4" />
              </button>
              {!showFeedback ? (
                <>
                  <button type="button" className="sr-is-btn sr-is-btn--primary" onClick={onSubmit} disabled={!answer.trim()}>
                    <Send className="h-4 w-4" aria-hidden />
                    {t('student.internshipOffers.interviewSim.active.submit')}
                  </button>
                  <button type="button" className="sr-is-btn sr-is-btn--secondary" onClick={onSkip}>
                    <SkipForward className="h-4 w-4" aria-hidden />
                    {t('student.internshipOffers.interviewSim.active.skip')}
                  </button>
                  <button type="button" className="sr-is-btn sr-is-btn--ghost">
                    <HelpCircle className="h-4 w-4" aria-hidden />
                    {t('student.internshipOffers.interviewSim.active.hint')}
                  </button>
                </>
              ) : (
                <button type="button" className="sr-is-btn sr-is-btn--primary" onClick={onNext}>
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
                    <h4>{t('student.internshipOffers.interviewSim.feedback.wentWell')}</h4>
                    <ul>{answerFeedback.wentWell.map((item) => <li key={item}>{item}</li>)}</ul>
                  </div>
                  <div>
                    <h4>{t('student.internshipOffers.interviewSim.feedback.needsImprovement')}</h4>
                    <ul>{answerFeedback.needsImprovement.map((item) => <li key={item}>{item}</li>)}</ul>
                  </div>
                </div>
                <div className="mt-4">
                  <h4>{t('student.internshipOffers.interviewSim.feedback.suggested')}</h4>
                  <p className="m-0 mt-1 text-sm text-[var(--admin-text-secondary)]">{answerFeedback.suggestedAnswer}</p>
                </div>
                <div className="mt-3">
                  <h4>{t('student.internshipOffers.interviewSim.feedback.professional')}</h4>
                  <p className="m-0 mt-1 rounded-lg bg-[var(--admin-bg-elevated)] p-3 text-sm italic text-[var(--admin-text-secondary)]">
                    {answerFeedback.professionalExample}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {answerFeedback.vocabulary.map((w) => (
                    <span key={w} className="sr-is-tag">{w}</span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="sr-is-active__feedback">
          <h3 className="sr-is-section-title text-sm">
            <Lightbulb className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
            {t('student.internshipOffers.interviewSim.feedback.liveTitle')}
          </h3>
          {liveFeedback.map((cat, i) => (
            <div key={cat.id} className="sr-is-feedback-cat">
              <div className="sr-is-feedback-cat__head">
                <span>{t(cat.labelKey)}</span>
                <span className="font-bold">{cat.score}%</span>
              </div>
              <ScoreBar score={cat.score} delay={i * 0.08} />
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
};

export default InterviewActiveSession;
