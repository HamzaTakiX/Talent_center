import { FunctionComponent } from 'react';
import type { ChatEntityReference } from '../types/chatEntityTypes';
import ChatEntityBadge, { entityRefKey } from './ChatEntityBadge';

type Props = {
  entityRefs?: ChatEntityReference[];
};

const ChatMessageEntityRefs: FunctionComponent<Props> = ({ entityRefs }) => {
  if (!entityRefs?.length) return null;

  return (
    <div className="isi-msg-entity-refs">
      {entityRefs.map((ref) => (
        <ChatEntityBadge key={entityRefKey(ref)} entity={ref} variant="message" />
      ))}
    </div>
  );
};

export default ChatMessageEntityRefs;
