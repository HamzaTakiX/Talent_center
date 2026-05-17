import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminChatMessage, AdminChatParticipant } from '../shared/admin-module-chat/adminChatTypes';
import type { AdminChatChannel } from './useAdminCopy';

const TIME_LABEL_KEYS: Record<string, string> = {
  Yesterday: 'admin.chatMocks.common.yesterday',
  '2 days ago': 'admin.chatMocks.common.twoDaysAgo',
  '3 days ago': 'admin.chatMocks.common.threeDaysAgo',
};

function translateField(
  t: (key: string) => string,
  channel: AdminChatChannel,
  suffix: string,
  fallback: string
): string {
  const key = `admin.chatMocks.${channel}.${suffix}`;
  const value = t(key);
  return value === key ? fallback : value;
}

export function useAdminChatMockData(
  channel: AdminChatChannel,
  participantsSeed: AdminChatParticipant[],
  initialMessages: Record<string, AdminChatMessage[]>
): { participants: AdminChatParticipant[]; messages: Record<string, AdminChatMessage[]> } {
  const { t, i18n } = useTranslation();

  return useMemo(() => {
    const translateTimeLabel = (label: string) => {
      const mapped = TIME_LABEL_KEYS[label];
      if (!mapped) return label;
      const value = t(mapped);
      return value === mapped ? label : value;
    };

    const participants = participantsSeed.map((p) => ({
      ...p,
      title: translateField(t, channel, `participants.${p.id}.title`, p.title),
      lastPreview: translateField(t, channel, `participants.${p.id}.lastPreview`, p.lastPreview),
      timeLabel: translateTimeLabel(p.timeLabel),
    }));

    const messages: Record<string, AdminChatMessage[]> = {};
    for (const [convId, msgs] of Object.entries(initialMessages)) {
      messages[convId] = msgs.map((m) => ({
        ...m,
        text: translateField(t, channel, `messages.${m.id}.text`, m.text),
        separatorBefore: m.separatorBefore
          ? translateField(t, channel, `messages.${m.id}.separatorBefore`, m.separatorBefore)
          : undefined,
      }));
    }

    return { participants, messages };
  }, [channel, participantsSeed, initialMessages, t, i18n.language]);
}
