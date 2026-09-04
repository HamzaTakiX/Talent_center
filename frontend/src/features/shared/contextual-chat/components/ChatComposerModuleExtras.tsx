import { FunctionComponent } from 'react';
import ChatComposerEntityPicker from './ChatComposerEntityPicker';
import ChatComposerTagPicker from './ChatComposerTagPicker';
import type { ChatModule } from '../types';
import type { useSupportChatAreaComposer } from '../hooks/useSupportChatAreaComposer';

type ComposerState = ReturnType<typeof useSupportChatAreaComposer>;

type Props = {
  chatModule: ChatModule;
  conversationId?: string;
  composer: ComposerState;
  disabled?: boolean;
  showEntityPicker?: boolean;
  showTagPicker?: boolean;
};

const ChatComposerModuleExtras: FunctionComponent<Props> = ({
  chatModule,
  conversationId,
  composer,
  disabled = false,
  showEntityPicker = true,
  showTagPicker = true,
}) => (
  <>
    {showEntityPicker ? (
      <ChatComposerEntityPicker
        chatModule={chatModule}
        conversationId={conversationId}
        enabled
        disabled={disabled}
        selected={composer.pendingEntities}
        onChange={composer.setPendingEntities}
      />
    ) : null}
    {showTagPicker ? (
      <ChatComposerTagPicker
        chatModule={chatModule}
        enabled
        disabled={disabled}
        selectedCodes={composer.pendingTags.map((tag) => tag.code)}
        onChange={composer.setPendingTags}
      />
    ) : null}
  </>
);

export default ChatComposerModuleExtras;
