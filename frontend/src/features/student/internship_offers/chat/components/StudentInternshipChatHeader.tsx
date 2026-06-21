import { FunctionComponent } from 'react';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { InternshipConversation } from '../../../../admin/offres-stage/chat/types/internshipChatTypes';

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
    <header className="isi-chat-header">
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
        <div className="isi-avatar isi-avatar--header">
          {(conversation.company || conversation.offerTitle).slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h2 className="isi-chat-name truncate">{conversation.offerTitle}</h2>
          <p className="isi-chat-meta truncate">
            {conversation.company}
            <span className="isi-chat-meta-sep" aria-hidden> · </span>
            {conversation.internshipType}
            <span className="isi-chat-meta-sep" aria-hidden> · </span>
            {conversation.applicationStatus}
          </p>
        </div>
      </div>

      <div className="isi-chat-actions">
        <button type="button" onClick={onViewOffer} className="isi-header-btn">
          <Briefcase className="size-4" />
          <span>{t('student.internshipOffers.chat.viewOffer')}</span>
        </button>
      </div>
    </header>
  );
};

export default StudentInternshipChatHeader;
