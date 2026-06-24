import { FunctionComponent, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { CoachOfferContext } from '../types/careerCoach';
import { useCareerCoachChat } from '../hooks/useCareerCoachChat';
import { useCareerCoachChatSummary } from '../hooks/useCareerCoachChatSummary';
import { useCareerCoachPinnedMessages } from '../hooks/useCareerCoachPinnedMessages';
import {
  AI_CAREER_COACH_GRID,
  AI_CAREER_COACH_LAYOUT,
  AI_CAREER_COACH_WORKSPACE_ROOT,
} from '../constants/careerCoachLayout';
import CareerCoachConversation from './CareerCoachConversation';
import CareerCoachSidebar from './CareerCoachSidebar';

const handledOfferLaunchTokens = new Set<string>();
const HANDLED_OFFER_LAUNCH_STORAGE_KEY = 'careerCoachHandledOfferLaunchTokens';

function readHandledLaunchTokensFromStorage(): Set<string> {
  if (typeof window === 'undefined') return new Set<string>();
  try {
    const raw = window.sessionStorage.getItem(HANDLED_OFFER_LAUNCH_STORAGE_KEY);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set<string>();
    return new Set(parsed.filter((token): token is string => typeof token === 'string' && token.trim().length > 0));
  } catch {
    return new Set<string>();
  }
}

function persistHandledLaunchToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    const tokens = readHandledLaunchTokensFromStorage();
    tokens.add(token);
    window.sessionStorage.setItem(HANDLED_OFFER_LAUNCH_STORAGE_KEY, JSON.stringify(Array.from(tokens)));
  } catch {
    // Ignore storage failures; in-memory guard still prevents same-mount duplicates.
  }
}

interface CareerCoachWorkspaceProps {
  offerContext?: CoachOfferContext & {
    launchToken?: string;
  };
}

const CareerCoachWorkspace: FunctionComponent<CareerCoachWorkspaceProps> = ({
  offerContext,
}) => {
  const { t } = useTranslation();
  const {
    modeConfig,
    mode,
    activeOfferContext,
    messages,
    conversations,
    archivedConversations,
    showArchived,
    activeConversationId,
    isSessionsLoading,
    isHistoryLoading,
    selectConversation,
    renameConversation,
    archiveConversation,
    unarchiveConversation,
    deleteConversation,
    toggleArchivedView,
    startNewConversation,
    chatInput,
    setChatInput,
    isTyping,
    pendingAttachment,
    setPendingAttachment,
    isDragging,
    setIsDragging,
    sendUserMessage,
    handleQuickAction,
    handlePromptClick,
    handleFileSelect,
    handleDrop,
  } = useCareerCoachChat({
    skipInitialHistory: Boolean(offerContext?.launchToken?.trim()),
  });
  const offerConversationHandledRef = useRef<string>('');

  useEffect(() => {
    const launchToken = offerContext?.launchToken?.trim();
    const offerKey = offerContext?.offerId?.trim();
    if (!launchToken || !offerKey) return;
    if (offerConversationHandledRef.current === launchToken) return;
    if (handledOfferLaunchTokens.has(launchToken)) return;
    if (readHandledLaunchTokensFromStorage().has(launchToken)) return;

    offerConversationHandledRef.current = launchToken;
    handledOfferLaunchTokens.add(launchToken);
    persistHandledLaunchToken(launchToken);

    void (async () => {
      await startNewConversation({
        offerId: offerContext.offerId,
        title: offerContext.title,
        company: offerContext.company,
        companyLogoUrl: offerContext.companyLogoUrl,
        internshipType: offerContext.internshipType,
        deadline: offerContext.deadline,
        applicationStatus: offerContext.applicationStatus,
        appliedDate: offerContext.appliedDate,
        interviewDate: offerContext.interviewDate,
      });
    })();
  }, [
    offerContext?.appliedDate,
    offerContext?.applicationStatus,
    offerContext?.company,
    offerContext?.companyLogoUrl,
    offerContext?.deadline,
    offerContext?.interviewDate,
    offerContext?.internshipType,
    offerContext?.launchToken,
    offerContext?.offerId,
    offerContext?.title,
    startNewConversation,
  ]);

  const {
    isPinned,
    togglePin,
    pinnedSummary,
  } = useCareerCoachPinnedMessages(activeConversationId, messages);

  const {
    isOpen: summaryOpen,
    summary,
    isLoading: summaryLoading,
    error: summaryError,
    copied: summaryCopied,
    isDownloading: summaryDownloading,
    hasNewContent: summaryHasNewContent,
    isPinnedReport: summaryIsPinnedReport,
    toggleOpen: onSummaryToggle,
    close: onSummaryClose,
    refresh: onSummaryRefresh,
    copySummary: onSummaryCopy,
    downloadSummaryAsWord: onSummaryDownloadWord,
    downloadSummaryAsPdf: onSummaryDownloadPdf,
  } = useCareerCoachChatSummary(
    activeConversationId,
    messages.length,
    isTyping,
    pinnedSummary,
  );

  const handleTogglePinMessage = useCallback(
    (messageId: string) => {
      const wasPinned = isPinned(messageId);
      togglePin(messageId);
      if (!wasPinned && !summaryOpen) {
        onSummaryToggle();
      }
    },
    [isPinned, summaryOpen, togglePin, onSummaryToggle],
  );

  const onSend = useCallback(() => {
    sendUserMessage(chatInput, pendingAttachment);
  }, [chatInput, pendingAttachment, sendUserMessage]);

  const onPromptClick = useCallback(
    (labelKey: string) => handlePromptClick(labelKey, t),
    [handlePromptClick, t],
  );

  const onQuickAction = useCallback(
    (action: Parameters<typeof handleQuickAction>[0]) => handleQuickAction(action, t),
    [handleQuickAction, t],
  );

  return (
    <div className={AI_CAREER_COACH_WORKSPACE_ROOT} id="student-ai-career-coach-dashboard">
      <div className={AI_CAREER_COACH_LAYOUT}>
        <CareerCoachSidebar
          conversations={conversations}
          archivedConversations={archivedConversations}
          showArchived={showArchived}
          activeConversationId={activeConversationId}
          isLoading={isSessionsLoading}
          onSelectConversation={selectConversation}
          onRenameConversation={renameConversation}
          onArchiveConversation={archiveConversation}
          onUnarchiveConversation={unarchiveConversation}
          onDeleteConversation={deleteConversation}
          onToggleArchivedView={toggleArchivedView}
          onNewConversation={startNewConversation}
        />

        <div className={AI_CAREER_COACH_GRID}>
          <CareerCoachConversation
            mode={mode}
            modeConfig={modeConfig}
            messages={messages}
            isTyping={isTyping}
            isMessagesLoading={isHistoryLoading || isSessionsLoading}
            chatInput={chatInput}
            onChatInputChange={setChatInput}
            pendingAttachment={pendingAttachment}
            onClearAttachment={() => setPendingAttachment(null)}
            onSend={onSend}
            onPromptClick={onPromptClick}
            onQuickAction={onQuickAction}
            onFileSelect={handleFileSelect}
            isDragging={isDragging}
            onDragStateChange={setIsDragging}
            onDrop={handleDrop}
            summaryOpen={summaryOpen}
            summary={summary}
            summaryLoading={summaryLoading}
            summaryError={summaryError}
            summaryCopied={summaryCopied}
            summaryHasNewContent={summaryHasNewContent}
            onSummaryToggle={onSummaryToggle}
            onSummaryClose={onSummaryClose}
            onSummaryRefresh={onSummaryRefresh}
            onSummaryCopy={onSummaryCopy}
            onSummaryDownloadWord={onSummaryDownloadWord}
            onSummaryDownloadPdf={() => void onSummaryDownloadPdf()}
            summaryDownloading={summaryDownloading}
            summaryIsPinnedReport={summaryIsPinnedReport}
            isMessagePinned={isPinned}
            onTogglePinMessage={handleTogglePinMessage}
            offerContext={activeOfferContext}
          />
        </div>
      </div>
    </div>
  );
};

export default CareerCoachWorkspace;
