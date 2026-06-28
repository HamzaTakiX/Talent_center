import { FunctionComponent, ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { StudentDocumentConversation } from '../utils/studentDocumentChatMappers';
import DocumentServiceChatIcon from './DocumentServiceChatIcon';

type Props = {
  conversation: StudentDocumentConversation;
  onBack?: () => void;
  conversationMenu?: ReactNode;
};

const StudentDocumentChatHeader: FunctionComponent<Props> = ({
  conversation,
  onBack,
  conversationMenu,
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
            aria-label={t('student.documents.chat.back', { defaultValue: 'Retour à la liste' })}
          >
            <ArrowLeft className="size-5" />
          </button>
        ) : null}
        <DocumentServiceChatIcon
          iconKey={conversation.iconKey}
          colorTheme={conversation.colorTheme}
          size="header"
        />
        <div className="isi-chat-header-copy min-w-0">
          <h2 className="isi-chat-name truncate">{conversation.serviceName}</h2>
          <div className="isi-chat-header-badges">
            {conversation.category ? (
              <span className="isi-chat-type-chip">{conversation.category}</span>
            ) : null}
            {conversation.serviceCode ? (
              <span className="isi-chat-company-chip">{conversation.serviceCode}</span>
            ) : null}
          </div>
        </div>
      </div>

      {conversationMenu ? <div className="isi-chat-actions">{conversationMenu}</div> : null}
    </header>
  );
};

export default StudentDocumentChatHeader;
