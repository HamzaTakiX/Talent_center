import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { chatTagColor } from '../utils/chatTagDisplay';
import '../styles/chat-composer-tags.css';

type Props = {
  tags?: string[];
};

const ChatMessageTags: FunctionComponent<Props> = ({ tags }) => {
  const { t } = useTranslation();
  if (!tags?.length) return null;

  return (
    <div className="isi-msg-tags">
      {tags.map((code) => (
        <span
          key={code}
          className="isi-msg-tag"
          style={{ ['--chip-color' as string]: chatTagColor(code) }}
        >
          <span className="isi-msg-tag__dot" aria-hidden />
          {t(`admin.chat.tags.${code}`, { defaultValue: code })}
        </span>
      ))}
    </div>
  );
};

export default ChatMessageTags;
