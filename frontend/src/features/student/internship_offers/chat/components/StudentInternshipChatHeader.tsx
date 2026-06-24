import { FunctionComponent } from 'react';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { InternshipConversation } from '../../../../admin/offres-stage/chat/types/internshipChatTypes';
import InternshipOfferAvatar from '../../../../admin/offres-stage/chat/components/InternshipOfferAvatar';
import { applicationStatusPillClass } from '../../../../admin/offres-stage/chat/utils/internshipChatStatusStyles';

type Props = {
  conversation: InternshipConversation;
  onBack?: () => void;
  onViewOffer: () => void;
};

const StudentInternshipChatHeader: FunctionComponent<Props> = ({
  conversation,
  onBack,
  onViewOffer,
}) => {
  const { t } = useTranslation();

  return (
    <header className="isi-chat-header isi-chat-header--student">
      <div className="isi-chat-header-left">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="isi-icon-btn lg:hidden"
            aria-label={t('student.internshipOffers.chat.back')}
          >
            <ArrowLeft className="size-5" />
          </button>
        ) : null}
        <InternshipOfferAvatar
          url={conversation.companyLogoUrl}
          companyName={conversation.company}
          offerTitle={conversation.offerTitle}
          size="header"
        />
        <div className="isi-chat-header-copy min-w-0">
          <h2 className="isi-chat-name truncate">{conversation.offerTitle}</h2>
          <div className="isi-chat-header-badges">
            <span className="isi-chat-company-chip">{conversation.company}</span>
            {conversation.internshipType !== 'Other' ? (
              <span className="isi-chat-type-chip">{conversation.internshipType}</span>
            ) : null}
            <span className={applicationStatusPillClass(conversation.applicationStatus)}>
              {conversation.applicationStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="isi-chat-actions">
        <button type="button" onClick={onViewOffer} className="isi-header-btn isi-header-btn--accent">
          <Briefcase className="size-4" />
          <span>{t('student.internshipOffers.chat.viewOffer')}</span>
        </button>
      </div>
    </header>
  );
};

export default StudentInternshipChatHeader;
