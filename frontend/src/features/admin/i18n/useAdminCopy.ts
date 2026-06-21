import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChatModule } from '../../shared/contextual-chat/types';
import type {
  ChatEmptyModuleType,
  ChatEmptyStateProps,
} from '../shared/admin-module-chat/types/chatEmptyStateTypes';

export type AdminBackTarget =
  | 'dashboard'
  | 'announcements'
  | 'offers'
  | 'encadrants'
  | 'documents'
  | 'students'
  | 'srf'
  | 'history'
  | 'administrators';

export type AdminSearchScope =
  | 'admins'
  | 'students'
  | 'documents'
  | 'offers'
  | 'announcements'
  | 'encadrants'
  | 'applications'
  | 'activity'
  | 'reports'
  | 'srf'
  | 'documentsOrStudents';

export function useAdminBackLabel(target: AdminBackTarget): string {
  const { t } = useTranslation();
  return t(`admin.back.${target}`);
}

export function useAdminSearchPlaceholder(scope: AdminSearchScope): string {
  const { t } = useTranslation();
  return t(`admin.search.${scope}`);
}

export type AdminChatChannel =
  | 'students'
  | 'encadrants'
  | 'documents'
  | 'offers'
  | 'announcements'
  | 'srf'
  | 'admins'
  | 'meetings';

const CHANNEL_MODULE_TYPE: Record<AdminChatChannel, ChatEmptyModuleType> = {
  offers: 'internship',
  documents: 'documents',
  announcements: 'announcements',
  meetings: 'meetings',
  students: 'student-support',
  srf: 'student-support',
  encadrants: 'meetings',
  admins: 'general',
};

export function useAdminChatChannel(channel: AdminChatChannel) {
  const { t } = useTranslation();
  return {
    participantSubtitle: t(`admin.common.chatChannels.${channel}.participantSubtitle`),
    searchPlaceholder: t(`admin.common.chatChannels.${channel}.searchPlaceholder`),
    composerPlaceholder: t(`admin.common.chatChannels.${channel}.composerPlaceholder`),
    emptyConversationLabel: t(`admin.common.chatChannels.${channel}.emptyConversation`),
  };
}

export function useChatEmptyState(channel: AdminChatChannel): Omit<ChatEmptyStateProps, 'stats' | 'className'> {
  const { t } = useTranslation();
  return {
    title: t(`admin.chatEmpty.channels.${channel}.title`),
    description: t(`admin.chatEmpty.channels.${channel}.description`),
    moduleType: CHANNEL_MODULE_TYPE[channel],
  };
}

export function chatModuleToEmptyModuleType(module: ChatModule): ChatEmptyModuleType {
  const map: Record<ChatModule, ChatEmptyModuleType> = {
    offers: 'internship',
    documents: 'documents',
    meetings: 'meetings',
    announcements: 'announcements',
    srf: 'student-support',
    encadrant: 'meetings',
    platform: 'general',
    smart_assignment: 'general',
  };
  return map[module];
}

export function useAdminCopy() {
  const { t, i18n } = useTranslation();

  const backLabel = useCallback(
    (target: AdminBackTarget) => t(`admin.back.${target}`),
    [t, i18n.language]
  );

  const searchPlaceholder = useCallback(
    (scope: AdminSearchScope) => t(`admin.search.${scope}`),
    [t, i18n.language]
  );

  const filterSubtitle = useCallback(
    (key: 'announcements' | 'offers' | 'admins' | 'encadrantsDetail') =>
      t(`admin.filters.${key}`),
    [t, i18n.language]
  );

  const pageTitle = useCallback(
    (key: string, vars?: Record<string, string | number>) => t(`admin.pages.${key}`, vars),
    [t, i18n.language]
  );

  const pageToolbarAria = useCallback(
    (key: string) => t(`admin.pages.${key}Toolbar`),
    [t, i18n.language]
  );

  const kpiLabel = useCallback(
    (key: string) => t(`admin.kpi.${key}`),
    [t, i18n.language]
  );

  const tableColumn = useCallback(
    (key: string) => t(`admin.tables.columns.${key}`),
    [t, i18n.language]
  );

  const emptyState = useCallback(
    (key: string) => t(`admin.empty.${key}`),
    [t, i18n.language]
  );

  const action = useCallback(
    (key: 'view' | 'edit' | 'delete' | 'assign') => t(`admin.common.actions.${key}`),
    [t, i18n.language]
  );

  const createLabel = useCallback(
    (key: 'announcement' | 'offer' | 'student' | 'encadrant' | 'admin') =>
      t(`admin.common.create.${key}`),
    [t, i18n.language]
  );

  const filterLabel = useCallback(
    (key: string) => t(`admin.tables.filter.${key}`),
    [t, i18n.language]
  );

  const announcementTypeLabel = useCallback(
    (type: 'Event' | 'Interview' | 'Info') => {
      const map = { Event: 'event', Interview: 'interview', Info: 'info' } as const;
      return t(`admin.tables.filter.announcementTypes.${map[type]}`);
    },
    [t, i18n.language]
  );

  return useMemo(
    () => ({
      backLabel,
      searchPlaceholder,
      filterSubtitle,
      pageTitle,
      pageToolbarAria,
      kpiLabel,
      tableColumn,
      emptyState,
      action,
      createLabel,
      filterLabel,
      announcementTypeLabel,
      t,
    }),
    [
      backLabel,
      searchPlaceholder,
      filterSubtitle,
      pageTitle,
      pageToolbarAria,
      kpiLabel,
      tableColumn,
      emptyState,
      action,
      createLabel,
      filterLabel,
      announcementTypeLabel,
      t,
    ]
  );
}
