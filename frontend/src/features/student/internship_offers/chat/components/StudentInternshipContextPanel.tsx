import { FunctionComponent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, CircleDot, Clock, ExternalLink, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { InternshipConversation } from '../../../../admin/offres-stage/chat/types/internshipChatTypes';
import { getInternshipOfferDetailsPath } from '../../constants/routes';

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
    <aside className="isi-inspector">
      <header className="isi-inspector-head">
        <span className="isi-inspector-head-title">
          {t('student.internshipOffers.chat.contextTitle')}
        </span>
        <span className="isi-inspector-head-badge">{conversation.internshipType}</span>
      </header>

      <div className="isi-inspector-section-title">
        {t('student.internshipOffers.chat.sections.offer')}
      </div>
      <div className="isi-inspector-fields">
        <InspectorRow icon={<FileText className="size-3.5" />} label={t('student.internshipOffers.chat.fields.title')}>
          <span>{conversation.offerTitle}</span>
        </InspectorRow>
        <InspectorRow icon={<CircleDot className="size-3.5" />} label={t('student.internshipOffers.chat.fields.company')}>
          <span>{conversation.company}</span>
        </InspectorRow>
        <InspectorRow icon={<CircleDot className="size-3.5" />} label={t('student.internshipOffers.chat.fields.internshipType')}>
          <span>{conversation.internshipType}</span>
        </InspectorRow>
        <InspectorRow icon={<Clock className="size-3.5" />} label={t('student.internshipOffers.chat.fields.deadline')}>
          <span>{conversation.deadline}</span>
        </InspectorRow>
      </div>

      <div className="isi-inspector-divider" />

      <div className="isi-inspector-section-title">
        {t('student.internshipOffers.chat.sections.application')}
      </div>
      <div className="isi-inspector-fields">
        <InspectorRow icon={<CircleDot className="size-3.5" />} label={t('student.internshipOffers.chat.fields.status')}>
          <span>{conversation.applicationStatus}</span>
        </InspectorRow>
        <InspectorRow icon={<Clock className="size-3.5" />} label={t('student.internshipOffers.chat.fields.appliedDate')}>
          <span>{conversation.appliedDate}</span>
        </InspectorRow>
        <InspectorRow icon={<Calendar className="size-3.5" />} label={t('student.internshipOffers.chat.fields.interview')}>
          <span>{conversation.interviewDate}</span>
        </InspectorRow>
      </div>

      <div className="isi-inspector-divider" />

      <div className="isi-inspector-actions">
        <span className="isi-inspector-actions-title">
          {t('student.internshipOffers.chat.sections.quickActions')}
        </span>
        <button type="button" className="isi-inspector-action" onClick={goOffer}>
          <span className="isi-inspector-action-icon">
            <ExternalLink className="size-3.5" />
          </span>
          <span className="isi-inspector-action-text">
            {t('student.internshipOffers.chat.viewOffer')}
          </span>
          <ChevronRight className="isi-inspector-action-chevron size-3.5" />
        </button>
      </div>
    </aside>
  );
};

export default StudentInternshipContextPanel;
