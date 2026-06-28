import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, Gauge, Globe, Loader2, Play, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BackButtonRow from '../../../../../../shared/navigation/BackButtonRow';
import { useBackNavigation } from '../../../../../../shared/navigation/useBackNavigation';
import { INTERVIEW_MODES, INTERVIEW_STUDENT_PROFILE } from '../../data/interviewSimulatorDashboardMock';
import type { SimulatorConfig } from '../../types/interviewSimulatorDashboard';
import {
  canProceedWizardStep,
  getStepId,
  getWizardSteps,
} from '../../utils/interviewWizardSteps';
import InternshipAssistantBot from '../../../components/InternshipAssistantBot';
import {
  StepInterviewSettings,
  StepInterviewType,
  StepOfferData,
} from './config/InterviewConfigBranchSteps';
import InterviewConfigSidebar from './config/InterviewConfigSidebar';
import InterviewConfigStepper from './config/InterviewConfigStepper';
import { StepBasis, StepReview } from './config/InterviewConfigStepContent';

interface InterviewConfigWizardProps {
  config: SimulatorConfig;
  step: number;
  onConfigChange: (patch: Partial<SimulatorConfig>) => void;
  onStepChange: (step: number) => void;
  onStart: () => void;
  onBack: () => void;
  isStarting?: boolean;
}

const InterviewConfigWizard: FunctionComponent<InterviewConfigWizardProps> = ({
  config,
  step,
  onConfigChange,
  onStepChange,
  onStart,
  onBack,
  isStarting = false,
}) => {
  const { t } = useTranslation();
  const { BackIcon, controlClassName } = useBackNavigation();
  const modeMeta = INTERVIEW_MODES.find((m) => m.id === config.modeId);
  const readiness = INTERVIEW_STUDENT_PROFILE.readinessScore;

  const wizardSteps = useMemo(
    () => getWizardSteps(config.basis, { linkedOfferId: config.linkedOfferId }),
    [config.basis, config.linkedOfferId],
  );
  const currentStepId = getStepId(wizardSteps, step);
  const isLastStep = step >= wizardSteps.length - 1;

  useEffect(() => {
    if (step >= wizardSteps.length) {
      onStepChange(Math.max(0, wizardSteps.length - 1));
    }
  }, [step, wizardSteps.length, onStepChange]);

  const handleConfigChange = useCallback(
    (patch: Partial<SimulatorConfig>) => {
      if (patch.basis && patch.basis !== config.basis) {
        onStepChange(0);
      }
      onConfigChange(patch);
    },
    [config.basis, onConfigChange, onStepChange],
  );

  const stepContent = useMemo(() => {
    const props = { config, isCustom: false, onConfigChange: handleConfigChange };
    switch (currentStepId) {
      case 'basis':
        return <StepBasis key="basis" {...props} />;
      case 'offerData':
        return <StepOfferData key="offerData" config={config} onConfigChange={handleConfigChange} />;
      case 'interviewType':
        return <StepInterviewType key="interviewType" config={config} onConfigChange={handleConfigChange} />;
      case 'settings':
        return <StepInterviewSettings key="settings" config={config} onConfigChange={handleConfigChange} />;
      case 'review':
        return <StepReview key="review" {...props} />;
      default:
        return <StepBasis key="basis-fallback" {...props} />;
    }
  }, [config, currentStepId, handleConfigChange]);

  const handleNext = () => {
    if (isStarting) return;
    if (isLastStep) onStart();
    else onStepChange(step + 1);
  };

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
          <div className="sr-is-config__hero-leading">
            <div className="sr-is-config__hero-bot" aria-hidden>
              <div className="sr-is-config__hero-bot-glow" />
              <InternshipAssistantBot
                variant="avatar"
                animated
                className="sr-is-bot sr-is-bot--sim"
                ariaLabel="Simulateur IA"
              />
            </div>

            <div className="sr-is-config__hero-copy">
              <p className="sr-is-config__eyebrow">
                <Sparkles className="h-4 w-4" aria-hidden />
                {modeMeta ? t(modeMeta.titleKey) : t('student.internshipOffers.interviewSim.config.eyebrow')}
              </p>
              <h1 className="sr-is-hero__title">{t('student.internshipOffers.interviewSim.config.pageTitle')}</h1>
              <p className="sr-is-hero__subtitle">{t('student.internshipOffers.interviewSim.config.pageSubtitle')}</p>
            </div>
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
            <span className="sr-is-config__chip">
              <Globe className="h-3.5 w-3.5" aria-hidden />
              {t(`student.internshipOffers.interviewSim.config.language.${config.language}`)}
            </span>
            <span className="sr-is-config__chip sr-is-config__chip--accent">
              {t('student.internshipOffers.interviewSim.config.meta.readiness')}: {readiness}%
            </span>
          </div>
        </div>
      </header>

      <InterviewConfigStepper steps={wizardSteps} step={step} onStepChange={onStepChange} />

      {config.linkedOfferId && config.customCompany ? (
        <div className="sr-is-config-offer-preview sr-is-panel sr-is-config__linked-offer">
          <p className="sr-is-config-offer-preview__eyebrow">
            {t('student.internshipOffers.interviewSim.config.linkedOffer.eyebrow')}
          </p>
          <h3 className="sr-is-config-offer-preview__title">
            {config.customJobTitle || t('student.internshipOffers.interviewSim.config.offerData.defaultTitle')}
          </h3>
          <p className="sr-is-config-offer-preview__company">{config.customCompany}</p>
          {config.customDescription ? (
            <p className="sr-is-config-offer-preview__desc sr-is-config-offer-preview__desc--clamped">
              {config.customDescription}
            </p>
          ) : null}
        </div>
      ) : null}

      <div
        className={[
          'sr-is-config__layout',
          currentStepId !== 'basis' && 'sr-is-config__layout--full',
        ]
          .filter(Boolean)
          .join(' ')}
      >
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
                className={[
                  'sr-is-btn sr-is-btn--primary',
                  isLastStep && 'sr-is-btn--launch',
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={isStarting || !canProceedWizardStep(currentStepId, config)}
                onClick={handleNext}
              >
                {isLastStep ? (
                  <>
                    {isStarting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        Please wait, starting simulation...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" aria-hidden />
                        {t('student.internshipOffers.interviewSim.config.review.startCta')}
                      </>
                    )}
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

        {currentStepId === 'basis' ? <InterviewConfigSidebar basis={config.basis} /> : null}
      </div>
    </div>
  );
};

export default InterviewConfigWizard;
