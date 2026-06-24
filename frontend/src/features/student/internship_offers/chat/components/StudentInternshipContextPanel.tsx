import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  Calendar,
  CalendarClock,
  ChevronRight,
  ClipboardCheck,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import InternshipInspectorRow from '../../../../admin/offres-stage/chat/components/InternshipInspectorRow';
import InternshipOfferAvatar from '../../../../admin/offres-stage/chat/components/InternshipOfferAvatar';
import type { InternshipConversation } from '../../../../admin/offres-stage/chat/types/internshipChatTypes';
import { applicationStatusPillClass } from '../../../../admin/offres-stage/chat/utils/internshipChatStatusStyles';
import { getInternshipOfferDetailsPath } from '../../constants/routes';

type Props = {
  conversation: InternshipConversation | null;
};

const ICON = { className: 'size-4', strokeWidth: 2.25 };

const StudentInternshipContextPanel: FunctionComponent<Props> = ({ conversation }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!conversation) return null;

  const goOffer = () => {
    if (conversation.offerUuid) {
      navigate(getInternshipOfferDetailsPath(conversation.offerUuid));
    }
  };

  return (
    <aside className="isi-inspector isi-inspector--student">
      <header className="isi-inspector-head">
        <span className="isi-inspector-head-title">
          {t('student.internshipOffers.chat.contextTitle')}
        </span>
        <span className="isi-inspector-head-badge">{conversation.internshipType}</span>
      </header>

      <div className="isi-inspector-offer-card">
        <InternshipOfferAvatar
          url={conversation.companyLogoUrl}
          companyName={conversation.company}
          offerTitle={conversation.offerTitle}
          size="header"
        />
        <div className="isi-inspector-offer-card-copy min-w-0">
          <p className="isi-inspector-offer-card-company">{conversation.company}</p>
          <p className="isi-inspector-offer-card-title">{conversation.offerTitle}</p>
        </div>
      </div>

      <div className="isi-inspector-section-title">
        {t('student.internshipOffers.chat.sections.offer')}
      </div>
      <div className="isi-inspector-fields isi-inspector-fields--card">
        <InternshipInspectorRow
          icon={<FileText {...ICON} />}
          label={t('student.internshipOffers.chat.fields.title')}
        >
          <span>{conversation.offerTitle}</span>
        </InternshipInspectorRow>
        <InternshipInspectorRow
          icon={<Building2 {...ICON} />}
          label={t('student.internshipOffers.chat.fields.company')}
        >
          <span>{conversation.company}</span>
        </InternshipInspectorRow>
        <InternshipInspectorRow
          icon={<Briefcase {...ICON} />}
          label={t('student.internshipOffers.chat.fields.internshipType')}
        >
          <span>{conversation.internshipType}</span>
        </InternshipInspectorRow>
        <InternshipInspectorRow
          icon={<CalendarClock {...ICON} />}
          label={t('student.internshipOffers.chat.fields.deadline')}
        >
          <span>{conversation.deadline}</span>
        </InternshipInspectorRow>
      </div>

      <div className="isi-inspector-divider" />

      <div className="isi-inspector-section-title">
        {t('student.internshipOffers.chat.sections.application')}
      </div>
      <div className="isi-inspector-fields isi-inspector-fields--card">
        <InternshipInspectorRow
          icon={<ClipboardCheck {...ICON} />}
          label={t('student.internshipOffers.chat.fields.status')}
        >
          <span className={applicationStatusPillClass(conversation.applicationStatus)}>
            {conversation.applicationStatus}
          </span>
        </InternshipInspectorRow>
        <InternshipInspectorRow
          icon={<Calendar {...ICON} />}
          label={t('student.internshipOffers.chat.fields.appliedDate')}
        >
          <span className={conversation.appliedDate === '—' ? 'isi-inspector-empty' : undefined}>
            {conversation.appliedDate}
          </span>
        </InternshipInspectorRow>
        <InternshipInspectorRow
          icon={<Calendar {...ICON} />}
          label={t('student.internshipOffers.chat.fields.interview')}
        >
          <span className={conversation.interviewDate === '—' ? 'isi-inspector-empty' : undefined}>
            {conversation.interviewDate}
          </span>
        </InternshipInspectorRow>
      </div>

      <div className="isi-inspector-divider" />

      <div className="isi-inspector-actions">
        <span className="isi-inspector-actions-title">
          {t('student.internshipOffers.chat.sections.quickActions')}
        </span>
        <button type="button" className="isi-inspector-action isi-inspector-action--primary" onClick={goOffer}>
          <span className="isi-inspector-action-icon">
            <ExternalLink {...ICON} />
          </span>
          <span className="isi-inspector-action-text">
            {t('student.internshipOffers.chat.viewOffer')}
          </span>
          <ChevronRight className="isi-inspector-action-chevron size-4" strokeWidth={2.25} />
        </button>
      </div>
    </aside>
  );
};

export default StudentInternshipContextPanel;
