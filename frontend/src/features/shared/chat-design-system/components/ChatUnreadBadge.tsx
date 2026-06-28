import { FunctionComponent } from 'react';

export type ChatUnreadBadgeProps = {
  count: number;
  variant?: 'default' | 'compact';
  className?: string;
};

const ChatUnreadBadge: FunctionComponent<ChatUnreadBadgeProps> = ({
  count,
  variant = 'default',
  className = '',
}) => {
  if (count <= 0) return null;

  const label = count > 99 ? '99+' : String(count);
  const variantClass = variant === 'compact' ? 'isi-offer-thread-unread' : 'isi-unread';

  return (
    <span className={`${variantClass} ${className}`.trim()} aria-label={`${count} unread`}>
      {label}
    </span>
  );
};

export default ChatUnreadBadge;
