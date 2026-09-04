import { FunctionComponent, useState } from 'react';
import { Megaphone, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SupportInboxSidebarBrandHeader from '../../../../admin/shared/admin-support-inbox/components/SupportInboxSidebarBrandHeader';
import ChatToolbarActions from '../../../../shared/chat-design-system/components/ChatToolbarActions';
import InternshipOfferAvatar from '../../../../admin/offres-stage/chat/components/InternshipOfferAvatar';
import { InternshipChatSidebarSkeleton } from '../../../../admin/offres-stage/chat/components/InternshipChatLoadingSkeletons';
import InternshipSidebarEmptyState from '../../../../admin/offres-stage/chat/components/InternshipSidebarEmptyState';
import { formatConversationPreview } from '../../../../admin/offres-stage/chat/utils/internshipChatDisplayUtils';
import type {
  StudentAnnouncementInboxFilters,
  StudentAnnouncementPrimaryFilterCounts,
} from '../types/studentAnnouncementChatTypes';
import type { StudentAnnouncementConversation } from '../utils/studentAnnouncementChatMappers';
import StudentAnnouncementFilterAccordion from './StudentAnnouncementFilterAccordion';

type Props = {
  conversations: StudentAnnouncementConversation[];
  selectedId: string;
  loading: boolean;
  loadError?: string | null;
  filters: StudentAnnouncementInboxFilters;
  hasActiveFilters: boolean;
  primaryFilterCounts: StudentAnnouncementPrimaryFilterCounts;
  announcementTypeOptions: string[];
  search: string;
  sidebarTitle: string;
  sidebarSubtitle?: string;
  searchPlaceholder: string;
  onSetPrimary: (value: StudentAnnouncementInboxFilters['primary']) => void;
  onToggleAnnouncementType: (value: string) => void;
  onTogglePriority: (value: StudentAnnouncementInboxFilters['priorities'][number]) => void;
  onToggleQuickFilter: (key: 'unread' | 'urgent') => void;
  onClearFilters: () => void;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
};

function resolveAnnouncementPreview(
  conversation: StudentAnnouncementConversation,
  youPrefix?: string,
): string {
  const fromMessages = [...conversation.messages]
    .reverse()
    .find((msg) => formatConversationPreview(msg.text));
  const text = formatConversationPreview(fromMessages?.text ?? conversation.lastMessage);
  if (!text) return '';
  const isOwn = fromMessages ? fromMessages.direction === 'out' : conversation.lastMessageIsOwn;
  if (isOwn && youPrefix) return `${youPrefix}${text}`;
  return text;
}

const StudentAnnouncementConversationList: FunctionComponent<Props> = ({
  conversations,
  selectedId,
  loading,
  loadError,
  filters,
  hasActiveFilters,
  primaryFilterCounts,
  announcementTypeOptions,
  search,
  sidebarTitle,
  sidebarSubtitle,
  searchPlaceholder,
  onSetPrimary,
  onToggleAnnouncementType,
  onTogglePriority,
  onToggleQuickFilter,
  onClearFilters,
  onSearchChange,
  onSelect,
}) => {
  const { t } = useTranslation();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const prefix = 'student.announcements.chat.inbox';
  const previewYouPrefix = t('student.announcements.chat.previewYou', { defaultValue: 'Vous : ' });
  const viewingArchived = filters.primary === 'archived';

  if (loading && conversations.length === 0) {
    return <InternshipChatSidebarSkeleton />;
  }

  return (
    <aside className="isi-sidebar">
      <SupportInboxSidebarBrandHeader
        title={sidebarTitle}
        subtitle={sidebarSubtitle}
        icon={Megaphone}
        actions={
          <ChatToolbarActions
            viewingArchived={viewingArchived}
            archivedCount={primaryFilterCounts.archived}
            hasActiveFilters={hasActiveFilters}
            filtersOpen={filtersOpen}
            showArchive={false}
            onToggleFilters={() => setFiltersOpen((value) => !value)}
            filterAriaLabel={t(`${prefix}.filters`, { defaultValue: 'Filtres' })}
          />
        }
      />

      {loadError ? (
        <p className="isi-load-error px-4 py-2 text-sm text-[var(--admin-danger,#dc2626)]" role="alert">
          {loadError}
        </p>
      ) : null}

      <div className="isi-search-wrap">
        <label className="admin-header-search-field isi-search-field">
          <Search className="admin-header-search-icon" strokeWidth={2} aria-hidden />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="admin-input admin-header-search-input isi-search-input"
            aria-label={searchPlaceholder}
            autoComplete="off"
            spellCheck={false}
          />
          {search ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="admin-header-search-clear"
              aria-label={t('student.announcements.chat.clearSearch', { defaultValue: 'Effacer' })}
            >
              <X className="size-3.5" strokeWidth={2.25} />
            </button>
          ) : null}
        </label>
      </div>

      {filtersOpen ? (
        <StudentAnnouncementFilterAccordion
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          announcementTypeOptions={announcementTypeOptions}
          onToggleType={onToggleAnnouncementType}
          onTogglePriority={onTogglePriority}
          onToggleQuick={onToggleQuickFilter}
          onClear={onClearFilters}
        />
      ) : null}

      <nav className="isi-conv-list" aria-label={sidebarTitle}>
        {conversations.length === 0 ? (
          search.trim() ? (
            <div className="isi-conv-empty isi-conv-empty--search">
              <Search className="isi-empty-search-icon" strokeWidth={1.5} aria-hidden />
              <p className="isi-empty-search-title">
                {t('student.announcements.chat.noSearchResults', { defaultValue: 'Aucun résultat' })}
              </p>
              <p className="isi-empty-search-desc">
                {t('student.announcements.chat.noSearchResultsDesc', {
                  defaultValue: 'Aucune conversation pour « {{query}} »',
                  query: search.trim(),
                })}
              </p>
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="isi-empty-search-clear-btn"
              >
                {t('student.announcements.chat.clearSearch', { defaultValue: 'Effacer la recherche' })}
              </button>
            </div>
          ) : (
            <InternshipSidebarEmptyState
              title={
                viewingArchived
                  ? t(`${prefix}.noArchived`, { defaultValue: 'Aucune conversation archivée' })
                  : t('student.announcements.chat.noThreads')
              }
              description={
                viewingArchived
                  ? t(`${prefix}.noArchivedDesc`, {
                      defaultValue: 'Les conversations que vous archivez apparaîtront ici.',
                    })
                  : t('student.announcements.chat.noThreadsDesc', {
                      defaultValue: 'Posez une question depuis une annonce pour démarrer une conversation.',
                    })
              }
              variant={viewingArchived ? 'archived' : 'default'}
            />
          )
        ) : (
          conversations.map((conv) => {
            const active = conv.id === selectedId;
            const preview = resolveAnnouncementPreview(conv, previewYouPrefix);
            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelect(conv.id)}
                className={`isi-conv-item isi-conv-item--offer ${active ? 'isi-conv-item--active' : ''}`}
              >
                <InternshipOfferAvatar
                  url={conv.coverImageUrl}
                  companyName={conv.companyName}
                  offerTitle={conv.announcementTitle}
                  size="list"
                />
                <div className="isi-conv-body">
                  <div className="isi-conv-row">
                    <span className="isi-conv-name">{conv.announcementTitle}</span>
                    {conv.timeLabel ? <span className="isi-conv-time">{conv.timeLabel}</span> : null}
                  </div>
                  {conv.announcementType ? (
                    <p className="isi-conv-company-label">{conv.announcementType}</p>
                  ) : conv.companyName ? (
                    <p className="isi-conv-company-label">{conv.companyName}</p>
                  ) : null}
                  {preview ? <p className="isi-conv-preview isi-conv-preview--offer">{preview}</p> : null}
                </div>
                {conv.unreadCount > 0 ? (
                  <span className="isi-unread">
                    {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </nav>
    </aside>
  );
};

export default StudentAnnouncementConversationList;
