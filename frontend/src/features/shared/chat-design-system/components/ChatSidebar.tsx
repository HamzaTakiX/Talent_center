import { FunctionComponent, ReactNode } from 'react';

export type ChatSidebarProps = {
  children: ReactNode;
  className?: string;
  busy?: boolean;
  ariaLabel?: string;
};

const ChatSidebar: FunctionComponent<ChatSidebarProps> = ({
  children,
  className = '',
  busy = false,
  ariaLabel,
}) => (
  <aside
    className={`isi-sidebar ${className}`.trim()}
    aria-busy={busy || undefined}
    aria-label={ariaLabel}
  >
    {children}
  </aside>
);

export default ChatSidebar;
