import { FunctionComponent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  ChevronRight,
  CircleDot,
  Clock,
  ExternalLink,
  FileText,
  Mail,
  Phone,
  Send,
  User,
  UserPlus,
} from 'lucide-react';
import type { InternshipConversation } from '../types/internshipChatTypes';
import { useInternshipInboxCopy } from '../../hooks/useOffersListLabels';

type Props = {
  conversation: InternshipConversation | null;
};

function InspectorRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="isi-inspector-row">
      <div className="isi-inspector-row-icon" aria-hidden>
        {icon}
      </div>
      <div className="isi-inspector-row-content">
        <span className="isi-inspector-row-label">{label}</span>
        <div className="isi-inspector-row-value">{children}</div>
      </div>
    </div>
  );
}

const InternshipContextPanel: FunctionComponent<Props> = ({ conversation }) => {
  const navigate = useNavigate();
  const { t } = useInternshipInboxCopy();

  if (!conversation) return null;

  const goStudent = () => {
    if (conversation.studentProfileId) {
      navigate(`/admin/students/${conversation.studentProfileId}`);
    }
  };

  const goOffer = () => {
    if (conversation.offerUuid) {
      navigate(`/admin/internship-offers/${conversation.offerUuid}`);
    }
  };

  const goApplication = () => {
    if (conversation.applicationUuid) {
      navigate(`/admin/internship-offers/applications/${conversation.applicationUuid}`);
    }
  };

  return (
    <aside className="isi-inspector">
      <header className="isi-inspector-head">
        <span className="isi-inspector-head-title">{t('contextTitle')}</span>
        <span className="isi-inspector-head-badge">{conversation.internshipType}</span>
      </header>

      <div className="isi-inspector-section-title">{t('sections.student')}</div>
      <div className="isi-inspector-fields">
        <InspectorRow icon={<User className="size-3.5" />} label={t('fields.name')}>
          <span>{conversation.studentName}</span>
        </InspectorRow>
        <InspectorRow icon={<CircleDot className="size-3.5" />} label={t('fields.program')}>
          <span>{conversation.program}</span>
        </InspectorRow>
        <InspectorRow icon={<CircleDot className="size-3.5" />} label={t('fields.class')}>
          <span>{conversation.className}</span>
        </InspectorRow>
        {conversation.studentEmail ? (
          <InspectorRow icon={<Mail className="size-3.5" />} label={t('fields.email')}>
            <span>{conversation.studentEmail}</span>
          </InspectorRow>
        ) : null}
        {conversation.studentPhone ? (
          <InspectorRow icon={<Phone className="size-3.5" />} label={t('fields.phone')}>
            <span>{conversation.studentPhone}</span>
          </InspectorRow>
        ) : null}
      </div>

      <div className="isi-inspector-divider" />

      <div className="isi-inspector-section-title">{t('sections.currentOffer')}</div>
      <div className="isi-inspector-fields">
        <InspectorRow icon={<FileText className="size-3.5" />} label={t('fields.title')}>
          <span>{conversation.offerTitle}</span>
        </InspectorRow>
        <InspectorRow icon={<CircleDot className="size-3.5" />} label={t('fields.company')}>
          <span>{conversation.company}</span>
        </InspectorRow>
        <InspectorRow icon={<CircleDot className="size-3.5" />} label={t('fields.internshipType')}>
          <span>{conversation.internshipType}</span>
        </InspectorRow>
        <InspectorRow icon={<Clock className="size-3.5" />} label={t('fields.deadline')}>
          <span>{conversation.deadline}</span>
        </InspectorRow>
      </div>

      <div className="isi-inspector-divider" />

      <div className="isi-inspector-section-title">{t('sections.application')}</div>
      <div className="isi-inspector-fields">
        <InspectorRow icon={<CircleDot className="size-3.5" />} label={t('fields.status')}>
          <span>{conversation.applicationStatus}</span>
        </InspectorRow>
        <InspectorRow icon={<Clock className="size-3.5" />} label={t('fields.appliedDate')}>
          <span>{conversation.appliedDate}</span>
        </InspectorRow>
        <InspectorRow icon={<Calendar className="size-3.5" />} label={t('fields.interview')}>
          <span>{conversation.interviewDate}</span>
        </InspectorRow>
        <InspectorRow icon={<Clock className="size-3.5" />} label={t('fields.lastChange')}>
          <span>{conversation.lastStatusChange}</span>
        </InspectorRow>
      </div>

      <div className="isi-inspector-divider" />

      <div className="isi-inspector-actions">
        <span className="isi-inspector-actions-title">{t('sections.quickActions')}</span>
        <button type="button" className="isi-inspector-action" onClick={() => {}}>
          <span className="isi-inspector-action-icon">
            <Bell className="size-3.5" />
          </span>
          <span className="isi-inspector-action-text">{t('quickActions.sendReminder')}</span>
          <ChevronRight className="isi-inspector-action-chevron size-3.5" />
        </button>
        <button type="button" className="isi-inspector-action" onClick={() => {}}>
          <span className="isi-inspector-action-icon">
            <FileText className="size-3.5" />
          </span>
          <span className="isi-inspector-action-text">{t('quickActions.requestDocuments')}</span>
          <ChevronRight className="isi-inspector-action-chevron size-3.5" />
        </button>
        <button type="button" className="isi-inspector-action" onClick={() => {}}>
          <span className="isi-inspector-action-icon">
            <Calendar className="size-3.5" />
          </span>
          <span className="isi-inspector-action-text">{t('quickActions.scheduleInterview')}</span>
          <ChevronRight className="isi-inspector-action-chevron size-3.5" />
        </button>
        <button type="button" className="isi-inspector-action" onClick={() => {}}>
          <span className="isi-inspector-action-icon">
            <Send className="size-3.5" />
          </span>
          <span className="isi-inspector-action-text">{t('quickActions.updateApplication')}</span>
          <ChevronRight className="isi-inspector-action-chevron size-3.5" />
        </button>
        <button type="button" className="isi-inspector-action" onClick={() => {}}>
          <span className="isi-inspector-action-icon">
            <UserPlus className="size-3.5" />
          </span>
          <span className="isi-inspector-action-text">{t('quickActions.assignAdmin')}</span>
          <ChevronRight className="isi-inspector-action-chevron size-3.5" />
        </button>
        <button type="button" className="isi-inspector-action" onClick={goStudent}>
          <span className="isi-inspector-action-icon">
            <User className="size-3.5" />
          </span>
          <span className="isi-inspector-action-text">{t('viewStudent')}</span>
          <ChevronRight className="isi-inspector-action-chevron size-3.5" />
        </button>
        <button type="button" className="isi-inspector-action" onClick={goApplication}>
          <span className="isi-inspector-action-icon">
            <FileText className="size-3.5" />
          </span>
          <span className="isi-inspector-action-text">{t('viewApplication')}</span>
          <ChevronRight className="isi-inspector-action-chevron size-3.5" />
        </button>
        <button type="button" className="isi-inspector-action" onClick={goOffer}>
          <span className="isi-inspector-action-icon">
            <ExternalLink className="size-3.5" />
          </span>
          <span className="isi-inspector-action-text">{t('viewOffer')}</span>
          <ChevronRight className="isi-inspector-action-chevron size-3.5" />
        </button>
      </div>
    </aside>
  );
};

export default InternshipContextPanel;
