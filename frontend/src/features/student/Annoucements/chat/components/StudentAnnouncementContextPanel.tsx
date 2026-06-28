import { FunctionComponent } from 'react';
import {
  Building2,
  Calendar,
  CalendarClock,
  ChevronRight,
  CircleDot,
  ExternalLink,
  FileText,
  Megaphone,
  Tag,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AnnouncementInspectorAttachments from '../../../../admin/announcements-stage/chat/components/AnnouncementInspectorAttachments';
import AnnouncementInspectorUrls from '../../../../admin/announcements-stage/chat/components/AnnouncementInspectorUrls';
import InternshipInspectorRow from '../../../../admin/offres-stage/chat/components/InternshipInspectorRow';
import InternshipOfferAvatar from '../../../../admin/offres-stage/chat/components/InternshipOfferAvatar';
import { useStudentAnnouncementAttachments } from '../hooks/useStudentAnnouncementAttachments';
import type {
  StudentAnnouncementConversation,
  StudentAnnouncementPublishStatus,
} from '../utils/studentAnnouncementChatMappers';
import type { StudentAnnouncementPriority } from '../types/studentAnnouncementChatTypes';

type Props = {
  conversation: StudentAnnouncementConversation | null;
  onViewAnnouncement: () => void;
};

const ICON = { className: 'size-4', strokeWidth: 2.25 };

const STATUS_KEYS: Record<StudentAnnouncementPublishStatus, string> = {
  Published: 'student.announcements.chat.statusLabels.published',
  Scheduled: 'student.announcements.chat.statusLabels.scheduled',
  Draft: 'student.announcements.chat.statusLabels.draft',
  Expired: 'student.announcements.chat.statusLabels.expired',
};

const PRIORITY_KEYS: Record<StudentAnnouncementPriority, string> = {
  Normal: 'student.announcements.chat.priorityLabels.normal',
  Important: 'student.announcements.chat.priorityLabels.important',
  Urgent: 'student.announcements.chat.priorityLabels.urgent',
};

const StudentAnnouncementContextPanel: FunctionComponent<Props> = ({
  conversation,
  onViewAnnouncement,
}) => {
  const { t } = useTranslation();
  const externalLinkLabel = t('student.announcements.detail.externalLink', {
    defaultValue: 'Lien principal',
  });
  const { attachments, urlLinks, loading: attachmentsLoading } = useStudentAnnouncementAttachments(
    conversation?.announcementId,
    externalLinkLabel,
  );

  if (!conversation) return null;

  const announcementType = conversation.announcementType?.trim() || '';
  const status = conversation.publishStatus;

  return (
    <aside className="isi-inspector">
      <header className="isi-inspector-head">
        <span className="isi-inspector-head-title">
          {t('student.announcements.chat.contextTitle', { defaultValue: 'Contexte' })}
        </span>
      </header>

      <div className="isi-inspector-section-title">
        {t('student.announcements.chat.sections.announcement', { defaultValue: 'Annonce' })}
      </div>
      <div className="isi-inspector-offer-card">
        <InternshipOfferAvatar
          url={conversation.coverImageUrl}
          companyName={conversation.companyName}
          offerTitle={conversation.announcementTitle}
          size="header"
        />
        <div className="isi-inspector-offer-card-copy min-w-0">
          {conversation.companyName ? (
            <p className="isi-inspector-offer-card-company">{conversation.companyName}</p>
          ) : null}
          <p className="isi-inspector-offer-card-title">{conversation.announcementTitle}</p>
        </div>
      </div>
      <div className="isi-inspector-fields isi-inspector-fields--card">
        <InternshipInspectorRow
          icon={<FileText {...ICON} />}
          label={t('student.announcements.chat.fields.title', { defaultValue: 'Titre' })}
        >
          <span>{conversation.announcementTitle}</span>
        </InternshipInspectorRow>
        {conversation.companyName ? (
          <InternshipInspectorRow
            icon={<Building2 {...ICON} />}
            label={t('student.announcements.chat.fields.company', { defaultValue: 'Organisation' })}
          >
            <span>{conversation.companyName}</span>
          </InternshipInspectorRow>
        ) : null}
        {announcementType ? (
          <InternshipInspectorRow
            icon={<Megaphone {...ICON} />}
            label={t('student.announcements.chat.fields.type', { defaultValue: 'Type' })}
          >
            <span>{announcementType}</span>
          </InternshipInspectorRow>
        ) : null}
        <InternshipInspectorRow
          icon={<Tag {...ICON} />}
          label={t('student.announcements.chat.fields.category', { defaultValue: 'Catégorie' })}
        >
          <span>{conversation.category}</span>
        </InternshipInspectorRow>
        <InternshipInspectorRow
          icon={<CircleDot {...ICON} />}
          label={t('student.announcements.chat.fields.status', { defaultValue: 'Statut' })}
        >
          <span className={`isi-status-pill isi-status-pill--${status.toLowerCase()}`}>
            {t(STATUS_KEYS[status], { defaultValue: status })}
          </span>
        </InternshipInspectorRow>
        <InternshipInspectorRow
          icon={<CircleDot {...ICON} />}
          label={t('student.announcements.chat.fields.priority', { defaultValue: 'Priorité' })}
        >
          <span>{t(PRIORITY_KEYS[conversation.priority], { defaultValue: conversation.priority })}</span>
        </InternshipInspectorRow>
        <InternshipInspectorRow
          icon={<Calendar {...ICON} />}
          label={t('student.announcements.chat.fields.publishedAt', { defaultValue: 'Date de publication' })}
        >
          <span>{conversation.publishDate}</span>
        </InternshipInspectorRow>
        <InternshipInspectorRow
          icon={<CalendarClock {...ICON} />}
          label={t('student.announcements.chat.fields.expiryDate', { defaultValue: "Date d'expiration" })}
        >
          <span>{conversation.expiryDate}</span>
        </InternshipInspectorRow>
        <InternshipInspectorRow
          icon={<Users {...ICON} />}
          label={t('student.announcements.chat.fields.audience', { defaultValue: 'Audience' })}
        >
          <span>{conversation.audience}</span>
        </InternshipInspectorRow>
      </div>

      <div className="isi-inspector-divider" />

      <AnnouncementInspectorAttachments
        attachments={attachments}
        loading={attachmentsLoading}
        title={t('student.announcements.chat.sections.attachments', { defaultValue: 'Pièces jointes' })}
        emptyLabel={t('student.announcements.chat.emptyAttachments', {
          defaultValue: 'Aucune pièce jointe',
        })}
        listAriaLabel={t('student.announcements.chat.attachmentsAria', {
          defaultValue: "Pièces jointes de l'annonce",
        })}
      />

      <div className="isi-inspector-divider" />

      <AnnouncementInspectorUrls
        links={urlLinks}
        loading={attachmentsLoading}
        title={t('student.announcements.chat.sections.urls', { defaultValue: 'URLs' })}
        emptyLabel={t('student.announcements.chat.emptyUrls', { defaultValue: 'Aucune URL' })}
        listAriaLabel={t('student.announcements.chat.urlsAria', {
          defaultValue: "Liens de l'annonce",
        })}
      />

      <div className="isi-inspector-divider" />

      <div className="isi-inspector-actions">
        <span className="isi-inspector-actions-title">
          {t('student.announcements.chat.sections.quickActions', { defaultValue: 'Actions rapides' })}
        </span>
        <button
          type="button"
          className="isi-inspector-action isi-inspector-action--primary"
          onClick={onViewAnnouncement}
          disabled={!conversation.announcementId}
        >
          <span className="isi-inspector-action-icon">
            <ExternalLink {...ICON} />
          </span>
          <span className="isi-inspector-action-text">
            {t('student.announcements.chat.viewAnnouncement', { defaultValue: "Voir l'annonce" })}
          </span>
          <ChevronRight className="isi-inspector-action-chevron size-4" strokeWidth={2.25} />
        </button>
      </div>
    </aside>
  );
};

export default StudentAnnouncementContextPanel;
