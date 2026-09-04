import { FunctionComponent, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import PlatformHeaderBrand from '../../platform-header/components/PlatformHeaderBrand';

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
    <PlatformHeaderBrand title={title} subtitle={subtitle} icon={Icon} titleAs="h2" />
    {actions ? <div className="isi-sidebar-actions">{actions}</div> : null}
  </div>
);

export default ChatSidebarHeader;
