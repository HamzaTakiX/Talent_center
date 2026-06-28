import { DragEvent, FunctionComponent, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { CoachMessage, CoachMode, CoachModeConfig, MessageQuickAction } from '../types/careerCoach';
import CareerCoachEmptyState from './CareerCoachEmptyState';
import CareerCoachMessageBubble from './CareerCoachMessageBubble';
import CareerCoachMessagesHeader from './CareerCoachMessagesHeader';
import CareerCoachMessagesSkeleton from './CareerCoachMessagesSkeleton';
import CareerCoachComposer from './CareerCoachComposer';
import CareerCoachChatSummary from './CareerCoachChatSummary';
import CareerCoachOfferContextPanel from './CareerCoachOfferContextPanel';
import type { CoachChatSummary } from '../types/careerCoach';

interface CareerCoachConversationProps {
  mode: CoachMode;
  modeConfig: CoachModeConfig;
  messages: CoachMessage[];
  isTyping: boolean;
  isMessagesLoading?: boolean;
  isComposerDisabled?: boolean;
  chatInput: string;
  onChatInputChange: (value: string) => void;
  pendingAttachment: File | null;
  onClearAttachment: () => void;
  onSend: () => void;
  onPromptClick: (labelKey: string) => void;
  onQuickAction: (action: MessageQuickAction) => void;
  onFileSelect: (files: FileList | null) => void;
  isDragging: boolean;
  onDragStateChange: (dragging: boolean) => void;
  onDrop: (e: DragEvent) => void;
  summaryOpen: boolean;
  summary: CoachChatSummary | null;
  summaryLoading: boolean;
  summaryError: string | null;
  summaryCopied: boolean;
  summaryHasNewContent: boolean;
  onSummaryToggle: () => void;
  onSummaryClose: () => void;
  onSummaryRefresh: () => void;
  onSummaryCopy: () => void;
  onSummaryDownloadWord: () => void;
  onSummaryDownloadPdf: () => void;
  summaryDownloading?: boolean;
  summaryIsPinnedReport?: boolean;
  isMessagePinned: (messageId: string) => boolean;
  onTogglePinMessage: (messageId: string) => void;
  offerContext?: {
    offerId?: string;
    title?: string;
    company?: string;
    companyLogoUrl?: string;
    internshipType?: string;
    deadline?: string;
    applicationStatus?: string;
    appliedDate?: string;
    interviewDate?: string;
  };
  mobileSidebarOpen?: boolean;
  onMobileSidebarToggle?: () => void;
}

const CareerCoachConversation: FunctionComponent<CareerCoachConversationProps> = ({
  mode,
  modeConfig,
  messages,
  isTyping,
  isMessagesLoading = false,
  isComposerDisabled = false,
  chatInput,
  onChatInputChange,
  pendingAttachment,
  onClearAttachment,
  onSend,
  onPromptClick,
  onQuickAction,
  onFileSelect,
  isDragging,
  onDragStateChange,
  onDrop,
  summaryOpen,
  summary,
  summaryLoading,
  summaryError,
  summaryCopied,
  summaryHasNewContent,
  onSummaryToggle,
  onSummaryClose,
  onSummaryRefresh,
  onSummaryCopy,
  onSummaryDownloadWord,
  onSummaryDownloadPdf,
  summaryDownloading = false,
  summaryIsPinnedReport = false,
  isMessagePinned,
  onTogglePinMessage,
  offerContext,
  mobileSidebarOpen = false,
  onMobileSidebarToggle,
}) => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isEmpty = messages.length === 0;
  const showMessagesLoading = isMessagesLoading && isEmpty;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping, showMessagesLoading]);

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      onDragStateChange(true);
    },
    [onDragStateChange],
  );

  const handleDragLeave = useCallback(() => onDragStateChange(false), [onDragStateChange]);

  return (
    <section
      className={`sr-acc-chat-panel${isEmpty && !showMessagesLoading ? ' sr-acc-chat-panel--empty' : ''}${
        summaryOpen ? ' sr-acc-chat-panel--summary-open' : ''
      }`}
      aria-label={t('student.internshipOffers.careerCoach.modes.aria')}
      aria-busy={showMessagesLoading}
    >
      <div className="sr-acc-chat-panel__main">
        <div className="sr-acc-chat-panel__glow sr-acc-chat-panel__glow--tl" aria-hidden />
        <div className="sr-acc-chat-panel__glow sr-acc-chat-panel__glow--br" aria-hidden />

        <CareerCoachMessagesHeader
          mode={mode}
          isTyping={isTyping}
          messageCount={messages.length}
          summaryOpen={summaryOpen}
          summaryHasNewContent={summaryHasNewContent}
          onSummaryToggle={onSummaryToggle}
          mobileSidebarOpen={mobileSidebarOpen}
          onMobileSidebarToggle={onMobileSidebarToggle}
        />

        <div
          ref={scrollRef}
          className={`sr-acc-chat-panel__messages${
            isEmpty && !showMessagesLoading ? ' sr-acc-chat-panel__messages--empty' : ''
          }${showMessagesLoading ? ' sr-acc-chat-panel__messages--loading' : ''}`}
          role="log"
          aria-live="polite"
        >
          {showMessagesLoading ? (
            <CareerCoachMessagesSkeleton />
          ) : isEmpty ? (
            <CareerCoachEmptyState
              key={mode}
              modeConfig={modeConfig}
              onPromptClick={(key) => onPromptClick(key)}
            />
          ) : (
            <>
              {messages.map((msg) => (
                <CareerCoachMessageBubble
                  key={msg.id}
                  message={msg}
                  onQuickAction={msg.role === 'assistant' ? onQuickAction : undefined}
                  isPinned={msg.role === 'assistant' ? isMessagePinned(msg.id) : false}
                  onTogglePin={
                    msg.role === 'assistant' ? () => onTogglePinMessage(msg.id) : undefined
                  }
                />
              ))}
            </>
          )}
        </div>

        <CareerCoachComposer
          value={chatInput}
          onChange={onChatInputChange}
          onSend={onSend}
          pendingAttachment={pendingAttachment}
          onClearAttachment={onClearAttachment}
          onFileSelect={onFileSelect}
          isDragging={isDragging}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={onDrop}
          disabled={isComposerDisabled}
        />
      </div>

      <CareerCoachChatSummary
        isOpen={summaryOpen}
        hasMessages={messages.length > 0}
        summary={summary}
        isLoading={summaryLoading}
        error={summaryError}
        copied={summaryCopied}
        isDownloading={summaryDownloading}
        isPinnedReport={summaryIsPinnedReport}
        onClose={onSummaryClose}
        onRefresh={onSummaryRefresh}
        onCopy={onSummaryCopy}
        onDownloadWord={onSummaryDownloadWord}
        onDownloadPdf={onSummaryDownloadPdf}
      />
      {offerContext ? <CareerCoachOfferContextPanel offerContext={offerContext} /> : null}
    </section>
  );
};

export default CareerCoachConversation;
