import { FunctionComponent } from 'react';
import { MessageSquare, Clock } from 'lucide-react';

interface AdminSidebarItemProps {
  label: string;
  onClick?: () => void;
}

const AdminSidebarItem: FunctionComponent<AdminSidebarItemProps> = ({ label, onClick }) => {
  const iconMap: { [key: string]: any } = {
    Chat: MessageSquare,
    History: Clock,
    Reports: Clock,
  };

  const Icon = iconMap[label];

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-neutral-950 text-sm font-normal leading-5 hover:bg-[var(--admin-row-hover)] transition-colors"
    >
      {Icon && <Icon className="w-4 h-4 text-gray-500" />}
      <span className="ml-6">{label}</span>
    </button>
  );
};

export default AdminSidebarItem;
