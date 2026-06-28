import { FunctionComponent } from 'react';
import { CircleDollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SupportInboxSidebarBrandHeader from '../../../../admin/shared/admin-support-inbox/components/SupportInboxSidebarBrandHeader';
import { InternshipChatSidebarSkeleton } from '../../../../admin/offres-stage/chat/components/InternshipChatLoadingSkeletons';
import { formatConversationPreview } from '../../../../admin/offres-stage/chat/utils/internshipChatDisplayUtils';

type Props = {
  loading: boolean;
  loadError?: string | null;
  lastPreview?: string;
  lastMessageIsOwn?: boolean;
  timeLabel?: string;
  unreadCount?: number;
  selected: boolean;
  onSelect: () => void;
};

const StudentSrfConversationList: FunctionComponent<Props> = ({
  loading,
  loadError,
  lastPreview = '',
  lastMessageIsOwn = false,
  timeLabel,
  unreadCount = 0,
  selected,
  onSelect,
}) => {
  const { t } = useTranslation();
  const previewYouPrefix = t('student.srf.chat.previewYou', { defaultValue: 'Vous : ' });
  const previewText = formatConversationPreview(lastPreview);
  const preview =
    previewText && lastMessageIsOwn ? `${previewYouPrefix}${previewText}` : previewText;

  if (loading) {
    return <InternshipChatSidebarSkeleton />;
  }

  return (
    <aside className="isi-sidebar">
      <SupportInboxSidebarBrandHeader
        title={t('student.srf.chat.sidebarTitle', { defaultValue: 'SRF — Suivi financier' })}
        subtitle={t('student.srf.chat.sidebarSubtitle', {
          defaultValue: 'Discutez avec le Service des Ressources Financières',
        })}
        icon={CircleDollarSign}
      />

      {loadError ? (
        <p className="isi-load-error px-4 py-2 text-sm text-[var(--admin-danger,#dc2626)]" role="alert">
          {loadError}
        </p>
      ) : null}

      <nav className="isi-conv-list" aria-label={t('student.srf.chat.sidebarTitle', { defaultValue: 'SRF — Suivi financier' })}>
        <button
          type="button"
          onClick={onSelect}
          className={`isi-conv-item ${selected ? 'isi-conv-item--active' : ''}`}
        >
          <span className="isi-avatar isi-avatar--lg bg-emerald-500 text-white">SRF</span>
          <div className="isi-conv-body">
            <div className="isi-conv-row">
              <span className="isi-conv-name">{t('student.srf.chat.serviceName')}</span>
              {timeLabel ? <span className="isi-conv-time">{timeLabel}</span> : null}
            </div>
            <p className="isi-conv-company-label">
              {t('student.srf.chat.desk', { defaultValue: 'bureau finance' })}
            </p>
            {preview ? <p className="isi-conv-preview">{preview}</p> : null}
          </div>
          {unreadCount > 0 ? (
            <span className="isi-unread">{unreadCount > 99 ? '99+' : unreadCount}</span>
          ) : null}
        </button>
      </nav>
    </aside>
  );
};

export default StudentSrfConversationList;
