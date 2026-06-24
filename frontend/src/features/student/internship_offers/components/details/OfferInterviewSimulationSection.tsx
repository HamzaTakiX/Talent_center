import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  Loader2,
  MessageSquare,
  Mic,
  RotateCcw,
  Send,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { getScoreColorVar, getScoreTone } from '../../CV_Analyse/utils/cvAnalysisScore';
import { useOfferInterviewSimulation } from '../../hooks/useOfferAiCoach';
import { DETAILS_SECTION_SUBTITLE, DETAILS_SECTION_TITLE, DETAILS_SIMULATION_CTA } from '../../constants/internshipOfferDetailsStyles';
import {
  STUDENT_CALLOUT_INSET_BRAND,
  STUDENT_CALLOUT_INSET_SUCCESS,
  STUDENT_CALLOUT_INSET_WARNING,
} from '../../../design-system/studentSemanticStyles';
import DetailsSectionCard from './DetailsSectionCard';

interface OfferInterviewSimulationSectionProps {
  offerId: string;
  offerTitle: string;
  company: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  behavioral: 'Comportemental',
  technical: 'Technique',
  offer: 'Offre',
  motivation: 'Motivation',
};

const OfferInterviewSimulationSection: FunctionComponent<OfferInterviewSimulationSectionProps> = ({
  offerId,
  offerTitle,
  company,
}) => {
  const { t } = useTranslation();
  const {
    phase,
    currentQuestion,
    questionIndex,
    totalQuestions,
    answer,
    setAnswer,
    feedback,
    averageScore,
    scores,
    error,
    evaluating,
    start,
    submitAnswer,
    nextQuestion,
    reset,
  } = useOfferInterviewSimulation(offerId);

  const progressPct =
    totalQuestions > 0 ? Math.round(((questionIndex + (phase === 'summary' ? 1 : 0)) / totalQuestions) * 100) : 0;

  return (
    <DetailsSectionCard>
      <div className="mb-5 flex min-w-0 items-start gap-2.5">
        <div className="student-icon-chip student-icon-chip--brand flex h-9 w-9 shrink-0 items-center justify-center">
          <Mic className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0">
          <h2 className={`${DETAILS_SECTION_TITLE} m-0`}>
            {t('student.internshipOffers.details.interviewSim.title', {
              defaultValue: 'Simulation d\'entretien',
            })}
          </h2>
          <p className={`${DETAILS_SECTION_SUBTITLE} m-0 mt-1`}>
            {t('student.internshipOffers.details.interviewSim.subtitle', {
              defaultValue:
                'Entraînez-vous avec des questions basées sur cette offre avant de postuler.',
            })}
          </p>
        </div>
      </div>

      {phase === 'idle' ? (
        <div className="student-interview-sim-intro">
          <div className="student-interview-sim-intro__icon" aria-hidden>
            <MessageSquare className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <p className="student-interview-sim-intro__text">
            {t('student.internshipOffers.details.interviewSim.intro', {
              defaultValue:
                'L\'IA génère des questions sur « {{title}} » chez {{company}} pour vous préparer à l\'entretien.',
              title: offerTitle,
              company,
            })}
          </p>
          <button
            type="button"
            className={DETAILS_SIMULATION_CTA}
            onClick={() => void start()}
          >
            <span className="student-interview-sim-cta__icon" aria-hidden>
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            {t('student.internshipOffers.details.interviewSim.start', {
              defaultValue: 'Lancer la simulation',
            })}
          </button>
        </div>
      ) : null}

      {phase === 'loading' ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-[var(--admin-text-secondary)]">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          {t('student.internshipOffers.details.interviewSim.preparing', {
            defaultValue: 'Préparation des questions…',
          })}
        </div>
      ) : null}

      {error ? (
        <div className={`${STUDENT_CALLOUT_INSET_WARNING} mb-4 text-sm`}>{error}</div>
      ) : null}

      {(phase === 'active' || phase === 'feedback') && currentQuestion ? (
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-2 flex items-center justify-between gap-2 text-xs text-[var(--admin-text-secondary)]">
              <span>
                {t('student.internshipOffers.details.interviewSim.questionProgress', {
                  defaultValue: 'Question {{current}} / {{total}}',
                  current: questionIndex + 1,
                  total: totalQuestions,
                })}
              </span>
              <span className="admin-badge admin-badge--info">
                {CATEGORY_LABELS[currentQuestion.category] ?? currentQuestion.category}
              </span>
            </div>
            <div
              className="mb-3 h-1.5 overflow-hidden rounded-full bg-[var(--admin-border)]"
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-[var(--admin-brand)] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="m-0 text-base font-medium leading-7 text-[var(--admin-text)]">
              {currentQuestion.text}
            </p>
            {currentQuestion.hint ? (
              <p className="m-0 mt-2 text-xs text-[var(--admin-text-secondary)]">
                💡 {currentQuestion.hint}
              </p>
            ) : null}
          </div>

          {phase === 'active' ? (
            <>
              <textarea
                className="admin-input min-h-[120px] w-full resize-y text-sm leading-6"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={t('student.internshipOffers.details.interviewSim.answerPlaceholder', {
                  defaultValue: 'Rédigez votre réponse ici…',
                })}
                disabled={evaluating}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="admin-btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
                  onClick={() => void submitAnswer()}
                  disabled={!answer.trim() || evaluating}
                >
                  {evaluating ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Send className="h-4 w-4" aria-hidden />
                  )}
                  {t('student.internshipOffers.details.interviewSim.submit', {
                    defaultValue: 'Soumettre',
                  })}
                </button>
                <button
                  type="button"
                  className="admin-btn-secondary px-4 py-2 text-sm"
                  onClick={reset}
                  disabled={evaluating}
                >
                  {t('common.cancel', { defaultValue: 'Annuler' })}
                </button>
              </div>
            </>
          ) : null}

          {phase === 'feedback' && feedback ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span
                  className="text-3xl font-bold tabular-nums"
                  style={{ color: getScoreColorVar(getScoreTone(feedback.score)) }}
                >
                  {feedback.score}%
                </span>
                <span className="text-sm text-[var(--admin-text-secondary)]">
                  {t('student.internshipOffers.details.interviewSim.score', {
                    defaultValue: 'Score de cette réponse',
                  })}
                </span>
              </div>

              {feedback.wentWell.length ? (
                <div className={STUDENT_CALLOUT_INSET_SUCCESS}>
                  <p className="m-0 mb-2 text-sm font-semibold text-[var(--admin-text)]">
                    {t('student.internshipOffers.details.interviewSim.wentWell', {
                      defaultValue: 'Ce qui est bien',
                    })}
                  </p>
                  <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                    {feedback.wentWell.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-[var(--admin-text-secondary)]"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {feedback.needsImprovement.length ? (
                <div className={STUDENT_CALLOUT_INSET_WARNING}>
                  <p className="m-0 mb-2 text-sm font-semibold text-[var(--admin-text)]">
                    {t('student.internshipOffers.details.interviewSim.improve', {
                      defaultValue: 'À améliorer',
                    })}
                  </p>
                  <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                    {feedback.needsImprovement.map((item) => (
                      <li key={item} className="text-sm text-[var(--admin-text-secondary)]">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {feedback.suggestedAnswer ? (
                <div className={STUDENT_CALLOUT_INSET_BRAND}>
                  <p className="m-0 mb-1 text-sm font-semibold text-[var(--admin-text)]">
                    {t('student.internshipOffers.details.interviewSim.suggestion', {
                      defaultValue: 'Exemple de structure',
                    })}
                  </p>
                  <p className="m-0 text-sm leading-6 text-[var(--admin-text-secondary)]">
                    {feedback.suggestedAnswer}
                  </p>
                </div>
              ) : null}

              <button
                type="button"
                className="admin-btn-primary inline-flex items-center gap-2 self-start px-4 py-2 text-sm"
                onClick={nextQuestion}
              >
                {questionIndex + 1 >= totalQuestions
                  ? t('student.internshipOffers.details.interviewSim.finish', {
                      defaultValue: 'Voir le résumé',
                    })
                  : t('student.internshipOffers.details.interviewSim.next', {
                      defaultValue: 'Question suivante',
                    })}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {phase === 'summary' ? (
        <div className={`${STUDENT_CALLOUT_INSET_BRAND} text-center`}>
          <Trophy className="mx-auto mb-3 h-10 w-10 text-[var(--admin-brand)]" aria-hidden />
          <p className="m-0 text-lg font-semibold text-[var(--admin-text)]">
            {t('student.internshipOffers.details.interviewSim.complete', {
              defaultValue: 'Simulation terminée !',
            })}
          </p>
          <p
            className="m-0 mt-2 text-3xl font-bold tabular-nums"
            style={{ color: getScoreColorVar(getScoreTone(averageScore)) }}
          >
            {averageScore}%
          </p>
          <p className="m-0 mt-1 text-sm text-[var(--admin-text-secondary)]">
            {t('student.internshipOffers.details.interviewSim.averageScore', {
              defaultValue: 'Score moyen sur {{count}} réponses',
              count: scores.length,
            })}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              className="admin-btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
              onClick={() => void start()}
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              {t('student.internshipOffers.details.interviewSim.retry', {
                defaultValue: 'Recommencer',
              })}
            </button>
            <button type="button" className="admin-btn-secondary px-4 py-2 text-sm" onClick={reset}>
              {t('common.close', { defaultValue: 'Fermer' })}
            </button>
          </div>
        </div>
      ) : null}
    </DetailsSectionCard>
  );
};

export default OfferInterviewSimulationSection;
