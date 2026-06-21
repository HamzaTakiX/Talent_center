import { DragEvent, FunctionComponent, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { CoachMessage, CoachMode, CoachModeConfig, MessageQuickAction } from '../types/careerCoach';
import CareerCoachEmptyState from './CareerCoachEmptyState';
import CareerCoachMessageBubble from './CareerCoachMessageBubble';
import CareerCoachModeSwitcher from './CareerCoachModeSwitcher';
import CareerCoachComposer from './CareerCoachComposer';

interface CareerCoachConversationProps {
  mode: CoachMode;
  modeConfig: CoachModeConfig;
  onModeChange: (mode: CoachMode) => void;
  messages: CoachMessage[];
  isTyping: boolean;
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
}

const CareerCoachConversation: FunctionComponent<CareerCoachConversationProps> = ({
  mode,
  modeConfig,
  onModeChange,
  messages,
  isTyping,
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
}) => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isEmpty = messages.length === 0;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      onDragStateChange(true);
    },
    [onDragStateChange],
  );

  const handleDragLeave = useCallback(() => onDragStateChange(false), [onDragStateChange]);

  return (
    <section className="sr-acc-chat-panel sr-acc-glass">
      <div className="sr-acc-chat-panel__toolbar">
        <CareerCoachModeSwitcher mode={mode} onModeChange={onModeChange} />
      </div>

      <div ref={scrollRef} className="sr-acc-chat-panel__messages" role="log" aria-live="polite">
        {isEmpty ? (
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
              />
            ))}
            {isTyping && (
              <div className="sr-acc-msg sr-acc-msg--ai">
                <div className="sr-acc-msg__avatar" aria-hidden>
                  <span className="sr-acc-typing">
                    <span /><span /><span />
                  </span>
                </div>
                <div className="sr-acc-msg__bubble sr-acc-msg__bubble--ai sr-acc-msg__bubble--typing">
                  {t('student.internshipOffers.careerCoach.conversation.thinking')}
                </div>
              </div>
            )}
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
      />
    </section>
  );
};

export default CareerCoachConversation;
