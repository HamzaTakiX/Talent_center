import { FunctionComponent } from 'react';
import { UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SupportInboxSidebarBrandHeader from '../../../../admin/shared/admin-support-inbox/components/SupportInboxSidebarBrandHeader';
import { InternshipChatSidebarSkeleton } from '../../../../admin/offres-stage/chat/components/InternshipChatLoadingSkeletons';
import { formatConversationPreview } from '../../../../admin/offres-stage/chat/utils/internshipChatDisplayUtils';

type Props = {
  loading: boolean;
  loadError?: string | null;
  noAssignedEncadrant?: boolean;
  encadrantName: string;
  encadrantInitials: string;
  avatarUrl?: string | null;
  lastPreview?: string;
  lastMessageIsOwn?: boolean;
  timeLabel?: string;
  unreadCount?: number;
  selected: boolean;
  onSelect: () => void;
};

const StudentEncadrantConversationList: FunctionComponent<Props> = ({
  loading,
  loadError,
  noAssignedEncadrant = false,
  encadrantName,
  encadrantInitials,
  avatarUrl = null,
  lastPreview = '',
  lastMessageIsOwn = false,
  timeLabel,
  unreadCount = 0,
  selected,
  onSelect,
}) => {
  const { t } = useTranslation();
  const previewYouPrefix = t('student.encadrant.chat.previewYou', { defaultValue: 'Vous : ' });
  const previewText = formatConversationPreview(lastPreview);
  const preview =
    previewText && lastMessageIsOwn ? `${previewYouPrefix}${previewText}` : previewText;

  if (loading) {
    return <InternshipChatSidebarSkeleton />;
  }

  return (
    <aside className="isi-sidebar">
      <SupportInboxSidebarBrandHeader
        title={t('student.encadrant.chat.sidebarTitle', { defaultValue: 'Chat encadrant' })}
        subtitle={t('student.encadrant.chat.sidebarSubtitle', {
          defaultValue: 'Discutez avec votre encadrant assigné',
        })}
        icon={UserCheck}
      />

      {loadError ? (
        <p className="isi-load-error px-4 py-2 text-sm text-[var(--admin-danger,#dc2626)]" role="alert">
          {loadError}
        </p>
      ) : null}

      {noAssignedEncadrant ? (
        <div className="px-4 py-6 text-sm text-[var(--admin-text-secondary)]">
          {t('student.encadrant.chat.noAssigned', {
            defaultValue: 'Aucun encadrant ne vous est assigné pour le moment.',
          })}
        </div>
      ) : (
        <nav
          className="isi-conv-list"
          aria-label={t('student.encadrant.chat.sidebarTitle', { defaultValue: 'Chat encadrant' })}
        >
          <button
            type="button"
            onClick={onSelect}
            className={`isi-conv-item ${selected ? 'isi-conv-item--active' : ''}`}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="isi-avatar isi-avatar--lg object-cover" />
            ) : (
              <span className="isi-avatar isi-avatar--lg bg-[var(--admin-brand)] text-white">
                {encadrantInitials}
              </span>
            )}
            <div className="isi-conv-body">
              <div className="isi-conv-row">
                <span className="isi-conv-name">{encadrantName}</span>
                {timeLabel ? <span className="isi-conv-time">{timeLabel}</span> : null}
              </div>
              <p className="isi-conv-company-label">
                {t('student.encadrant.chat.roleLabel', { defaultValue: 'Encadrant' })}
              </p>
              {preview ? <p className="isi-conv-preview">{preview}</p> : null}
            </div>
            {unreadCount > 0 ? (
              <span className="isi-unread">{unreadCount > 99 ? '99+' : unreadCount}</span>
            ) : null}
          </button>
        </nav>
      )}
    </aside>
  );
};

export default StudentEncadrantConversationList;
