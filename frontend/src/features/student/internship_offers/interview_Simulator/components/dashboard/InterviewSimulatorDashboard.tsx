import { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useInterviewSimulator } from '../../hooks/useInterviewSimulator';
import { useInterviewHubData } from '../../hooks/useInterviewHubData';
import InterviewActiveSession from './InterviewActiveSession';
import InterviewConfigWizard from './InterviewConfigWizard';
import InterviewSimulatorHub from './InterviewSimulatorHub';
import { InterviewSimulatorBootstrapLoading } from './InterviewSimulatorLoadingStates';
import InterviewReportModal from './InterviewReportModal';
import InterviewSummaryView from './InterviewSummaryView';
import type { InterviewModeId } from '../../types/interviewSimulatorDashboard';
import { stageApi } from '../../../../../shared/api/stageApi';
import { mapStageDetailToStudentDetails } from '../../../../../shared/utils/stageMappers';
import { getInternshipOfferDetailsPath } from '../../../constants/routes';
import type { InternshipOfferDetails } from '../../../types';
import { INTERVIEW_SIMULATOR_OFFER_QUERY } from '../../constants/routes';

type OfferBootstrapState = 'idle' | 'loading' | 'ready' | 'error';

interface LocationOfferState {
  offerSnapshot?: InternshipOfferDetails;
}

const InterviewSimulatorDashboard: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const linkedOfferIdParam = searchParams.get(INTERVIEW_SIMULATOR_OFFER_QUERY);
  const hub = useInterviewHubData();
  const sim = useInterviewSimulator(hub.hasHistory);

  const [serverReadinessScore, setServerReadinessScore] = useState<number | null>(null);
  const [offerBootstrap, setOfferBootstrap] = useState<OfferBootstrapState>(
    linkedOfferIdParam ? 'loading' : 'idle',
  );
  const bootstrappedOfferRef = useRef<string | null>(null);

  useEffect(() => {
    if (sim.view === 'hub') {
      void hub.refresh();
    }
  }, [sim.view, hub.refresh]);

  useEffect(() => {
    let cancelled = false;
    stageApi.journeyDashboard().then((data) => {
      if (!cancelled) setServerReadinessScore(data.internship_readiness_score ?? null);
    }).catch(() => { /* fallback to local computation */ });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!linkedOfferIdParam) {
      setOfferBootstrap('idle');
      bootstrappedOfferRef.current = null;
      return undefined;
    }

    if (bootstrappedOfferRef.current === linkedOfferIdParam) {
      return undefined;
    }

    let cancelled = false;
    bootstrappedOfferRef.current = linkedOfferIdParam;

    async function bootstrapLinkedOffer() {
      setOfferBootstrap('loading');
      try {
        const snapshot = (location.state as LocationOfferState | null)?.offerSnapshot;
        let offer = snapshot?.id === linkedOfferIdParam ? snapshot : undefined;

        if (!offer) {
          const detail = await stageApi.detail(linkedOfferIdParam);
          offer = mapStageDetailToStudentDetails(detail, 0);
        }

        if (cancelled) return;

        sim.startConfigWithOffer(offer!);
        setOfferBootstrap('ready');
      } catch {
        if (!cancelled) {
          bootstrappedOfferRef.current = null;
          setOfferBootstrap('error');
        }
      }
    }

    void bootstrapLinkedOffer();
    return () => { cancelled = true; };
  }, [linkedOfferIdParam, location.state, sim.startConfigWithOffer]);

  const handleStartMode = useCallback(
    (modeId: InterviewModeId) => sim.startConfig(modeId),
    [sim],
  );

  const handleStartFirst = useCallback(() => {
    sim.startConfig('general');
  }, [sim]);

  const handleToggleTranscript = useCallback(
    (id: string) => sim.setExpandedTranscriptId((prev) => (prev === id ? null : id)),
    [sim],
  );

  const handleConfigBack = useCallback(() => {
    if (sim.config.linkedOfferId) {
      navigate(getInternshipOfferDetailsPath(sim.config.linkedOfferId));
      return;
    }
    sim.backToHub();
  }, [navigate, sim]);

  if (offerBootstrap === 'loading') {
    return (
      <InterviewSimulatorBootstrapLoading
        message={t('student.internshipOffers.interviewSim.config.linkedOffer.loading')}
      />
    );
  }

  if (offerBootstrap === 'error' && linkedOfferIdParam) {
    return (
      <div className="sr-is-panel mx-auto max-w-lg p-6 text-center">
        <p className="m-0 text-sm text-[var(--admin-text-secondary)]">
          {t('student.internshipOffers.interviewSim.config.linkedOffer.loadError')}
        </p>
        <button
          type="button"
          className="sr-is-btn sr-is-btn--secondary mt-4"
          onClick={() => navigate(getInternshipOfferDetailsPath(linkedOfferIdParam))}
        >
          {t('student.internshipOffers.interviewSim.config.linkedOffer.backToOffer')}
        </button>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={sim.view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full min-w-0"
        >
          {sim.view === 'hub' && (
            <InterviewSimulatorHub
              hasHistory={hub.hasHistory}
              serverReadinessScore={serverReadinessScore}
              avgPreparationScore={hub.analytics.avgPreparation}
              completedCount={hub.completedCount}
              historyRows={hub.historyRows}
              analyticsMetrics={hub.analytics.metrics}
              avgOverallScore={hub.analytics.avgOverall}
              isInitialLoad={hub.isInitialLoad}
              onStartMode={handleStartMode}
              onContinue={sim.continueLastSession}
              onStartFirst={handleStartFirst}
              onViewReports={() => void hub.openLatestReport()}
              onViewSessionReport={(uuid) => void hub.openReportForSession(uuid)}
            />
          )}

          {sim.view === 'config' && (
            <InterviewConfigWizard
              config={sim.config}
              step={sim.configStep}
              onConfigChange={(patch) => sim.setConfig((c) => ({ ...c, ...patch }))}
              onStepChange={sim.setConfigStep}
              onStart={sim.startSimulation}
              onBack={handleConfigBack}
              isStarting={sim.isBusy}
            />
          )}

          {sim.view === 'active' && (
            <InterviewActiveSession
              config={sim.config}
              questionIndex={sim.questionIndex}
              totalQuestions={sim.totalQuestions}
              currentQuestion={sim.currentQuestion}
              answer={sim.answer}
              onAnswerChange={sim.setAnswer}
              timeRemaining={sim.timeRemaining}
              sessionScore={sim.sessionScore}
              formatTime={sim.formatTime}
              showFeedback={sim.showFeedback}
              answerFeedback={sim.answerFeedback}
              liveFeedback={sim.liveFeedback}
              isRecording={sim.isRecording}
              onToggleRecording={sim.toggleRecording}
              onSubmit={sim.submitAnswer}
              onSkip={sim.skipQuestion}
              onNext={sim.nextQuestion}
              onExit={sim.backToHub}
              onEndSimulation={sim.endSimulation}
              isBusy={sim.isBusy}
            />
          )}

          {sim.view === 'summary' && (
            <InterviewSummaryView
              overallScore={sim.overallSummaryScore}
              report={sim.sessionReport}
              transcript={sim.transcript}
              onRetake={() => sim.startConfig('general')}
              onBackToHub={sim.backToHub}
              onOpenReport={sim.openReportModal}
              expandedTranscriptId={sim.expandedTranscriptId}
              onToggleTranscript={handleToggleTranscript}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <InterviewReportModal
        open={sim.showReportModal || hub.reportModalOpen}
        report={sim.sessionReport ?? hub.selectedReport}
        isLoading={sim.isCompleting || hub.reportLoading}
        onClose={() => {
          sim.closeReportModal();
          hub.closeReportModal();
        }}
        onRetry={() => {
          sim.closeReportModal();
          hub.closeReportModal();
          sim.startConfig('general');
        }}
        onViewDetails={() => {
          sim.closeReportModal();
          hub.closeReportModal();
          if (sim.view !== 'summary') sim.setView('summary');
        }}
      />
    </>
  );
};

export default InterviewSimulatorDashboard;
