import { FunctionComponent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useCareerCoachChat } from '../hooks/useCareerCoachChat';
import CareerCoachConversation from './CareerCoachConversation';
import CareerCoachContextPanel from './CareerCoachContextPanel';

const CareerCoachWorkspace: FunctionComponent = () => {
  const { t } = useTranslation();
  const {
    context,
    modeConfig,
    mode,
    setMode,
    messages,
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
  } = useCareerCoachChat();

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
    <div className="sr-acc sr-acc__workspace">
      <div className="sr-acc__shell">
        <CareerCoachConversation
          mode={mode}
          modeConfig={modeConfig}
          onModeChange={setMode}
          messages={messages}
          isTyping={isTyping}
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
        />
        <CareerCoachContextPanel context={context} />
      </div>
    </div>
  );
};

export default CareerCoachWorkspace;
