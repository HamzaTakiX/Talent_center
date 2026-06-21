import { DragEvent, useCallback, useState } from 'react';
import type { CoachContextData, CoachMessage, CoachMode, MessageQuickAction } from '../types/careerCoach';
import { getModeConfig } from '../data/careerCoachMock';

const EMPTY_CONTEXT: CoachContextData = {
  cvFileName: '',
  cvScore: 0,
  atsScore: 0,
  lastAnalysis: '—',
  readinessPercent: 0,
  focusAreas: [],
  activeGoals: [],
};

export function useCareerCoachChat() {
  const [mode, setMode] = useState<CoachMode>('career-coach');
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [pendingAttachment, setPendingAttachment] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [apiUnavailable] = useState(true);

  const modeConfig = getModeConfig(mode);

  const sendUserMessage = useCallback(
    (text: string, attachment?: File | null, activeMode: CoachMode = mode) => {
      const trimmed = text.trim();
      if (!trimmed && !attachment) return;

      const userMsg: CoachMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        mode: activeMode,
        text: trimmed || undefined,
        attachmentName: attachment?.name,
      };

      setMessages((prev) => [...prev, userMsg]);
      setChatInput('');
      setPendingAttachment(null);
    },
    [mode],
  );

  const handleQuickAction = useCallback(
    (action: MessageQuickAction, t: (key: string) => string) => {
      sendUserMessage(t(`student.internshipOffers.careerCoach.quickActions.${action}`));
    },
    [sendUserMessage],
  );

  const handlePromptClick = useCallback(
    (labelKey: string, t: (key: string) => string) => {
      sendUserMessage(t(labelKey));
    },
    [sendUserMessage],
  );

  const handleFileSelect = useCallback((files: FileList | null) => {
    const file = files?.[0];
    if (file) setPendingAttachment(file);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect],
  );

  return {
    context: EMPTY_CONTEXT,
    modeConfig,
    mode,
    setMode,
    messages,
    chatInput,
    setChatInput,
    isTyping: false,
    pendingAttachment,
    setPendingAttachment,
    isDragging,
    setIsDragging,
    apiUnavailable,
    sendUserMessage,
    handleQuickAction,
    handlePromptClick,
    handleFileSelect,
    handleDrop,
  };
}
