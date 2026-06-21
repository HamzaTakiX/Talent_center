import { FunctionComponent, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useInterviewSimulator } from '../../hooks/useInterviewSimulator';
import InterviewActiveSession from './InterviewActiveSession';
import InterviewConfigWizard from './InterviewConfigWizard';
import InterviewSimulatorHub from './InterviewSimulatorHub';
import InterviewSummaryView from './InterviewSummaryView';
import type { InterviewModeId } from '../../types/interviewSimulatorDashboard';

const InterviewSimulatorDashboard: FunctionComponent = () => {
  const sim = useInterviewSimulator(true);

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

  return (
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
            hasHistory
            onStartMode={handleStartMode}
            onContinue={sim.continueLastSession}
            onStartFirst={handleStartFirst}
          />
        )}

        {sim.view === 'config' && (
          <InterviewConfigWizard
            config={sim.config}
            step={sim.configStep}
            onConfigChange={(patch) => sim.setConfig((c) => ({ ...c, ...patch }))}
            onStepChange={sim.setConfigStep}
            onStart={sim.startSimulation}
            onBack={sim.backToHub}
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
          />
        )}

        {sim.view === 'summary' && (
          <InterviewSummaryView
            overallScore={sim.overallSummaryScore}
            onRetake={() => sim.startConfig('general')}
            onBackToHub={sim.backToHub}
            expandedTranscriptId={sim.expandedTranscriptId}
            onToggleTranscript={handleToggleTranscript}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default InterviewSimulatorDashboard;
