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
import { applicationStatusPillClass } from '../../../../admin/offres-stage/chat/utils/internshipChatStatusStyles';
import type { ApplicationStatusLabel } from '../../../../admin/offres-stage/chat/types/internshipChatTypes';
import { getInternshipOfferDetailsPath } from '../../constants/routes';

interface CareerCoachOfferContextPanelProps {
  offerContext: {
    offerId?: string;
    title?: string;
    company?: string;
    companyLogoUrl?: string;
    internshipType?: string;
    deadline?: string;
    applicationStatus?: string;
    appliedDate?: string;
    interviewDate?: string;
  };
}

const ICON = { className: 'size-4', strokeWidth: 2.25 };

const asApplicationStatus = (status?: string): ApplicationStatusLabel => {
  switch (status) {
    case 'Applied':
    case 'Under Review':
    case 'Shortlisted':
    case 'Interview':
    case 'Accepted':
    case 'Rejected':
    case 'Withdrawn':
    case 'Completed':
    case 'Not Applied':
      return status;
    default:
      return 'Not Applied';
  }
};

const safeText = (value?: string) => (value && value.trim() ? value : '—');

const CareerCoachOfferContextPanel: FunctionComponent<CareerCoachOfferContextPanelProps> = ({
  offerContext,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const hasOfferContext = Boolean(
    offerContext.offerId?.trim() ||
      offerContext.title?.trim() ||
      offerContext.company?.trim() ||
      offerContext.internshipType?.trim() ||
      offerContext.deadline?.trim(),
  );

  if (!hasOfferContext) return null;

  const title = safeText(offerContext.title);
  const company = safeText(offerContext.company);
  const internshipType = safeText(offerContext.internshipType);
  const deadline = safeText(offerContext.deadline);
  const appliedDate = safeText(offerContext.appliedDate);
  const interviewDate = safeText(offerContext.interviewDate);
  const applicationStatus = asApplicationStatus(offerContext.applicationStatus);

  const goOffer = () => {
    if (offerContext.offerId) {
      navigate(getInternshipOfferDetailsPath(offerContext.offerId));
    }
  };

  return (
    <aside className="isi-inspector isi-inspector--student sr-acc-chat-panel__offer-context">
      <header className="isi-inspector-head">
        <span className="isi-inspector-head-title">{t('student.internshipOffers.chat.contextTitle')}</span>
        <span className="isi-inspector-head-badge">{internshipType}</span>
      </header>

      <div className="isi-inspector-offer-card">
        <InternshipOfferAvatar
          url={offerContext.companyLogoUrl}
          companyName={company}
          offerTitle={title}
          size="header"
        />
        <div className="isi-inspector-offer-card-copy min-w-0">
          <p className="isi-inspector-offer-card-company">{company}</p>
          <p className="isi-inspector-offer-card-title">{title}</p>
        </div>
      </div>

      <div className="isi-inspector-section-title">{t('student.internshipOffers.chat.sections.offer')}</div>
      <div className="isi-inspector-fields isi-inspector-fields--card">
        <InternshipInspectorRow icon={<FileText {...ICON} />} label={t('student.internshipOffers.chat.fields.title')}>
          <span>{title}</span>
        </InternshipInspectorRow>
        <InternshipInspectorRow
          icon={<Building2 {...ICON} />}
          label={t('student.internshipOffers.chat.fields.company')}
        >
          <span>{company}</span>
        </InternshipInspectorRow>
        <InternshipInspectorRow
          icon={<Briefcase {...ICON} />}
          label={t('student.internshipOffers.chat.fields.internshipType')}
        >
          <span>{internshipType}</span>
        </InternshipInspectorRow>
        <InternshipInspectorRow
          icon={<CalendarClock {...ICON} />}
          label={t('student.internshipOffers.chat.fields.deadline')}
        >
          <span>{deadline}</span>
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
          <span className={applicationStatusPillClass(applicationStatus)}>{applicationStatus}</span>
        </InternshipInspectorRow>
        <InternshipInspectorRow
          icon={<Calendar {...ICON} />}
          label={t('student.internshipOffers.chat.fields.appliedDate')}
        >
          <span className={appliedDate === '—' ? 'isi-inspector-empty' : undefined}>{appliedDate}</span>
        </InternshipInspectorRow>
        <InternshipInspectorRow
          icon={<Calendar {...ICON} />}
          label={t('student.internshipOffers.chat.fields.interview')}
        >
          <span className={interviewDate === '—' ? 'isi-inspector-empty' : undefined}>{interviewDate}</span>
        </InternshipInspectorRow>
      </div>

      <div className="isi-inspector-divider" />

      <div className="isi-inspector-actions">
        <span className="isi-inspector-actions-title">
          {t('student.internshipOffers.chat.sections.quickActions')}
        </span>
        <button
          type="button"
          className="isi-inspector-action isi-inspector-action--primary"
          onClick={goOffer}
          disabled={!offerContext.offerId}
        >
          <span className="isi-inspector-action-icon">
            <ExternalLink {...ICON} />
          </span>
          <span className="isi-inspector-action-text">{t('student.internshipOffers.chat.viewOffer')}</span>
          <ChevronRight className="isi-inspector-action-chevron size-4" strokeWidth={2.25} />
        </button>
      </div>
    </aside>
  );
};

export default CareerCoachOfferContextPanel;
