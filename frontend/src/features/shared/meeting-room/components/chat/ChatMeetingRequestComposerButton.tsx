import { FunctionComponent } from 'react';
import { Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ChatComposerTooltip from '../../../contextual-chat/components/ChatComposerTooltip';

interface ChatMeetingRequestComposerButtonProps {
  disabled?: boolean;
  onClick: () => void;
  tooltipLabel?: string;
}

export const ChatMeetingRequestComposerButton: FunctionComponent<
  ChatMeetingRequestComposerButtonProps
> = ({ disabled = false, onClick, tooltipLabel }) => {
  const { t } = useTranslation();
  const label = tooltipLabel ?? t('meetingRoom.chat.sendRequest');

  return (
    <ChatComposerTooltip label={label} disabled={disabled}>
      <button
        type="button"
        className="isi-composer-action isi-composer-action--meeting"
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
      >
        <Video className="size-[1.05rem]" strokeWidth={1.85} aria-hidden />
      </button>
    </ChatComposerTooltip>
  );
};
