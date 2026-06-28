import { FunctionComponent, ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

interface Props {
  avatarInitials: string;
  title: string;
  meta?: string;
  onBack?: () => void;
  actions?: ReactNode;
  conversationMenu?: ReactNode;
}

const SupportChatHeader: FunctionComponent<Props> = ({
  avatarInitials,
  title,
  meta,
  onBack,
  actions,
  conversationMenu,
}) => {
  return (
    <header className="isi-chat-header">
      <div className="isi-chat-header-left">
        {onBack ? (
          <button type="button" onClick={onBack} className="isi-icon-btn lg:hidden" aria-label="Retour">
            <ArrowLeft className="size-5" />
          </button>
        ) : null}
        <div className="isi-avatar isi-avatar--header">{avatarInitials}</div>
        <div className="min-w-0">
          <h2 className="isi-chat-name truncate">{title}</h2>
          {meta ? <p className="isi-chat-meta truncate">{meta}</p> : null}
        </div>
      </div>

      <div className="isi-chat-actions">
        {actions}
        {conversationMenu}
      </div>
    </header>
  );
};

export default SupportChatHeader;
