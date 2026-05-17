import { FunctionComponent, useState } from 'react';
import { ChevronDown, ChevronUp, LayoutDashboard, Briefcase, Megaphone, History, FileText, DollarSign, UserCheck, Users, Shield } from 'lucide-react';
import AdminSidebarItem from './AdminSidebarItem';

interface AdminSidebarGroupProps {
  label: string;
  icon: string;
  expandable: boolean;
  children?: string[];
  isActive?: boolean;
  onClick?: () => void;
}

const AdminSidebarGroup: FunctionComponent<AdminSidebarGroupProps> = ({
  label,
  icon,
  expandable,
  children = [],
  isActive = false,
  onClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const iconMap: { [key: string]: any } = {
    LayoutDashboard,
    Briefcase,
    Megaphone,
    History,
    FileText,
    DollarSign,
    UserCheck,
    Users,
    Shield,
  };

  const Icon = iconMap[icon];

  const handleClick = () => {
    if (expandable) {
      setIsExpanded(!isExpanded);
    }
    onClick?.();
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`admin-nav-item w-full ${isActive ? 'admin-nav-item-active' : ''}`}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5" />}
          {label}
        </div>
        {expandable && (
          <span className="text-gray-500">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        )}
      </button>
      
      {expandable && isExpanded && (
        <div className="mt-1 space-y-1">
          {children.map((child) => (
            <AdminSidebarItem key={child} label={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSidebarGroup;
