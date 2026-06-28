import { FunctionComponent, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export type ChatSidebarHeaderProps = {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  actions?: ReactNode;
};

const ChatSidebarHeader: FunctionComponent<ChatSidebarHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  actions,
}) => (
  <div className="isi-sidebar-head isi-sidebar-head--brand">
    <div className="isi-sidebar-brand">
      <span className="isi-sidebar-brand-icon" aria-hidden>
        <Icon strokeWidth={2.25} />
      </span>
      <div className="isi-sidebar-brand-copy">
        <h2 className="isi-sidebar-title">{title}</h2>
        {subtitle ? <p className="isi-sidebar-subtitle">{subtitle}</p> : null}
      </div>
    </div>
    {actions ? <div className="isi-sidebar-actions">{actions}</div> : null}
  </div>
);

export default ChatSidebarHeader;
