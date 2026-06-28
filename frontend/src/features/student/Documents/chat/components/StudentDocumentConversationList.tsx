import { FunctionComponent } from 'react';
import { Archive, FileText, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SupportInboxSidebarBrandHeader from '../../../../admin/shared/admin-support-inbox/components/SupportInboxSidebarBrandHeader';
import ChatToolbarActions from '../../../../shared/chat-design-system/components/ChatToolbarActions';
import { InternshipChatSidebarSkeleton } from '../../../../admin/offres-stage/chat/components/InternshipChatLoadingSkeletons';
import InternshipSidebarEmptyState from '../../../../admin/offres-stage/chat/components/InternshipSidebarEmptyState';
import { formatConversationPreview } from '../../../../admin/offres-stage/chat/utils/internshipChatDisplayUtils';
import type {
  StudentDocumentInboxFilters,
  StudentDocumentPrimaryFilterCounts,
} from '../types/studentDocumentChatTypes';
import type { StudentDocumentConversation } from '../utils/studentDocumentChatMappers';
import DocumentServiceChatIcon from './DocumentServiceChatIcon';

type Props = {
  conversations: StudentDocumentConversation[];
  selectedId: string;
  loading: boolean;
  loadError?: string | null;
  filters: StudentDocumentInboxFilters;
  hasActiveFilters: boolean;
  primaryFilterCounts: StudentDocumentPrimaryFilterCounts;
  search: string;
  sidebarTitle: string;
  sidebarSubtitle?: string;
  searchPlaceholder: string;
  onSetPrimary: (value: StudentDocumentInboxFilters['primary']) => void;
  onToggleQuickFilter: (key: 'unread') => void;
  onClearFilters: () => void;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
};

function resolveDocumentPreview(
  conversation: StudentDocumentConversation,
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

const StudentDocumentConversationList: FunctionComponent<Props> = ({
  conversations,
  selectedId,
  loading,
  loadError,
  filters,
  hasActiveFilters,
  primaryFilterCounts,
  search,
  sidebarTitle,
  sidebarSubtitle,
  searchPlaceholder,
  onSetPrimary,
  onToggleQuickFilter,
  onClearFilters,
  onSearchChange,
  onSelect,
}) => {
  const { t } = useTranslation();
  const prefix = 'student.documents.chat.inbox';
  const previewYouPrefix = t('student.documents.chat.previewYou', { defaultValue: 'Vous : ' });
  const viewingArchived = filters.primary === 'archived';

  if (loading && conversations.length === 0) {
    return <InternshipChatSidebarSkeleton />;
  }

  return (
    <aside className="isi-sidebar">
      <SupportInboxSidebarBrandHeader
        title={sidebarTitle}
        subtitle={sidebarSubtitle}
        icon={FileText}
        actions={
          <ChatToolbarActions
            viewingArchived={viewingArchived}
            archivedCount={primaryFilterCounts.archived}
            hasActiveFilters={hasActiveFilters}
            filtersOpen={false}
            onToggleArchive={() => onSetPrimary(viewingArchived ? 'all' : 'archived')}
            onToggleFilters={() => onToggleQuickFilter('unread')}
            archiveAriaLabel={
              viewingArchived
                ? t(`${prefix}.backToActive`, { defaultValue: 'Retour aux conversations actives' })
                : t(`${prefix}.viewArchived`, { defaultValue: 'Voir les conversations archivées' })
            }
            archiveTitle={
              viewingArchived
                ? t(`${prefix}.backToActive`, { defaultValue: 'Retour aux conversations actives' })
                : t(`${prefix}.archived`, { defaultValue: 'Archives' })
            }
            filterAriaLabel={t(`${prefix}.unread`, { defaultValue: 'Non lus' })}
          />
        }
      />

      {loadError ? (
        <p className="isi-load-error px-4 py-2 text-sm text-[var(--admin-danger,#dc2626)]" role="alert">
          {loadError}
        </p>
      ) : null}

      {viewingArchived ? (
        <div className="isi-archived-strip">
          <Archive className="isi-archived-strip-icon" strokeWidth={2} aria-hidden />
          <span className="isi-archived-strip-label">
            {t(`${prefix}.archivedBanner`, { defaultValue: 'Conversations archivées' })}
          </span>
          <button type="button" onClick={() => onSetPrimary('all')} className="isi-archived-strip-back">
            {t(`${prefix}.backToActive`, { defaultValue: 'Retour aux actives' })}
          </button>
        </div>
      ) : null}

      {hasActiveFilters && filters.unread ? (
        <div className="px-4 pb-2">
          <button type="button" onClick={onClearFilters} className="text-xs text-[var(--admin-accent)]">
            {t(`${prefix}.clearFilters`, { defaultValue: 'Réinitialiser les filtres' })}
          </button>
        </div>
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
              aria-label={t('student.documents.chat.clearSearch', { defaultValue: 'Effacer' })}
            >
              <X className="size-3.5" strokeWidth={2.25} />
            </button>
          ) : null}
        </label>
      </div>

      <nav className="isi-conv-list" aria-label={sidebarTitle}>
        {conversations.length === 0 ? (
          search.trim() ? (
            <div className="isi-conv-empty isi-conv-empty--search">
              <Search className="isi-empty-search-icon" strokeWidth={1.5} aria-hidden />
              <p className="isi-empty-search-title">
                {t('student.documents.chat.noSearchResults', { defaultValue: 'Aucun résultat' })}
              </p>
              <p className="isi-empty-search-desc">
                {t('student.documents.chat.noSearchResultsDesc', {
                  defaultValue: 'Aucune conversation pour « {{query}} »',
                  query: search.trim(),
                })}
              </p>
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="isi-empty-search-clear-btn"
              >
                {t('student.documents.chat.clearSearch', { defaultValue: 'Effacer la recherche' })}
              </button>
            </div>
          ) : (
            <InternshipSidebarEmptyState
              title={
                viewingArchived
                  ? t(`${prefix}.noArchived`, { defaultValue: 'Aucune conversation archivée' })
                  : t('student.documents.chat.noThreads', {
                      defaultValue: 'Aucune conversation pour le moment.',
                    })
              }
              description={
                viewingArchived
                  ? t(`${prefix}.noArchivedDesc`, {
                      defaultValue: 'Les conversations que vous archivez apparaîtront ici.',
                    })
                  : t('student.documents.chat.noThreadsDesc', {
                      defaultValue: 'Posez une question depuis un document pour démarrer une conversation.',
                    })
              }
              variant={viewingArchived ? 'archived' : 'default'}
            />
          )
        ) : (
          conversations.map((conv) => {
            const active = conv.id === selectedId;
            const preview = resolveDocumentPreview(conv, previewYouPrefix);
            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelect(conv.id)}
                className={`isi-conv-item isi-conv-item--offer ${active ? 'isi-conv-item--active' : ''}`}
              >
                <DocumentServiceChatIcon
                  iconKey={conv.iconKey}
                  colorTheme={conv.colorTheme}
                  size="list"
                />
                <div className="isi-conv-body">
                  <div className="isi-conv-row">
                    <span className="isi-conv-name">{conv.serviceName}</span>
                    {conv.timeLabel ? <span className="isi-conv-time">{conv.timeLabel}</span> : null}
                  </div>
                  {conv.category ? (
                    <p className="isi-conv-company-label">{conv.category}</p>
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

export default StudentDocumentConversationList;
