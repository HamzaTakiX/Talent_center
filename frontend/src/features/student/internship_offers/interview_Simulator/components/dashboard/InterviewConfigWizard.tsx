import { FunctionComponent, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, Gauge, Play, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BackButtonRow from '../../../../../../shared/navigation/BackButtonRow';
import { useBackNavigation } from '../../../../../../shared/navigation/useBackNavigation';
import { INTERVIEW_MODES, INTERVIEW_STUDENT_PROFILE } from '../../data/interviewSimulatorDashboardMock';
import type { SimulatorConfig } from '../../types/interviewSimulatorDashboard';
import InterviewConfigSidebar from './config/InterviewConfigSidebar';
import InterviewConfigStepper from './config/InterviewConfigStepper';
import {
  StepDifficulty,
  StepDuration,
  StepLanguage,
  StepReview,
  StepRole,
} from './config/InterviewConfigStepContent';

const STEPS = 5;

interface InterviewConfigWizardProps {
  config: SimulatorConfig;
  step: number;
  onConfigChange: (patch: Partial<SimulatorConfig>) => void;
  onStepChange: (step: number) => void;
  onStart: () => void;
  onBack: () => void;
}

const InterviewConfigWizard: FunctionComponent<InterviewConfigWizardProps> = ({
  config,
  step,
  onConfigChange,
  onStepChange,
  onStart,
  onBack,
}) => {
  const { t } = useTranslation();
  const { BackIcon, controlClassName } = useBackNavigation();
  const isCustom = config.modeId === 'custom';
  const modeMeta = INTERVIEW_MODES.find((m) => m.id === config.modeId);
  const readiness = INTERVIEW_STUDENT_PROFILE.readinessScore;

  const canNext = () => {
    if (step === 0) {
      if (isCustom) return !!(config.customJobTitle && config.customCompany);
      return !!config.role;
    }
    return true;
  };

  const handleNext = () => {
    if (step < STEPS - 1) onStepChange(step + 1);
    else onStart();
  };

  const stepContent = useMemo(() => {
    const props = { config, isCustom, onConfigChange };
    switch (step) {
      case 0:
        return <StepRole key="role" {...props} />;
      case 1:
        return <StepDifficulty key="difficulty" {...props} />;
      case 2:
        return <StepDuration key="duration" {...props} />;
      case 3:
        return <StepLanguage key="language" {...props} />;
      case 4:
        return <StepReview key="review" {...props} />;
      default:
        return null;
    }
  }, [config, isCustom, onConfigChange, step]);

  return (
    <div className="sr-is__root sr-is sr-is-config">
      <header className="sr-is-config__hero sr-is-panel">
        <BackButtonRow>
          <button
            type="button"
            className={`sr-is-btn sr-is-btn--ghost sr-is-config__back ${controlClassName}`}
            onClick={onBack}
          >
            <BackIcon className="h-4 w-4" aria-hidden />
            {t('student.internshipOffers.interviewSim.config.back')}
          </button>
        </BackButtonRow>

        <div className="sr-is-config__hero-inner">
          <div className="sr-is-config__hero-copy">
            <p className="sr-is-config__eyebrow">
              <Sparkles className="h-4 w-4" aria-hidden />
              {modeMeta ? t(modeMeta.titleKey) : t('student.internshipOffers.interviewSim.config.eyebrow')}
            </p>
            <h1 className="sr-is-hero__title">{t('student.internshipOffers.interviewSim.config.pageTitle')}</h1>
            <p className="sr-is-hero__subtitle">{t('student.internshipOffers.interviewSim.config.pageSubtitle')}</p>
          </div>

          <div className="sr-is-config__meta-chips">
            <span className="sr-is-config__chip">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {modeMeta ? t(modeMeta.titleKey) : '—'}
            </span>
            <span className="sr-is-config__chip">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {config.length} min
            </span>
            <span className="sr-is-config__chip">
              <Gauge className="h-3.5 w-3.5" aria-hidden />
              {t(`student.internshipOffers.interviewSim.config.difficulty.${config.difficulty}`)}
            </span>
            <span className="sr-is-config__chip sr-is-config__chip--accent">
              {t('student.internshipOffers.interviewSim.config.meta.readiness')}: {readiness}%
            </span>
          </div>
        </div>
      </header>

      <InterviewConfigStepper step={step} onStepChange={onStepChange} />

      <div className="sr-is-config__layout">
        <main className="sr-is-config__main">
          <div className="sr-is-config__step-shell sr-is-panel">
            <AnimatePresence mode="wait">{stepContent}</AnimatePresence>

            <footer className="sr-is-config__footer">
              <button
                type="button"
                className="sr-is-btn sr-is-btn--secondary"
                disabled={step === 0}
                onClick={() => onStepChange(step - 1)}
              >
                {t('student.internshipOffers.interviewSim.config.prev')}
              </button>
              <button
                type="button"
                className="sr-is-btn sr-is-btn--primary"
                disabled={!canNext()}
                onClick={handleNext}
              >
                {step === STEPS - 1 ? (
                  <>
                    <Play className="h-4 w-4" aria-hidden />
                    {t('student.internshipOffers.interviewSim.config.review.startCta')}
                  </>
                ) : (
                  <>
                    {t('student.internshipOffers.interviewSim.config.next')}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </>
                )}
              </button>
            </footer>
          </div>
        </main>

        <InterviewConfigSidebar />
      </div>
    </div>
  );
};

export default InterviewConfigWizard;
