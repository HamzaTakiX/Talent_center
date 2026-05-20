import { FunctionComponent, ReactNode, useMemo } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../dashboard/ui/animations';
import {
  BarChart3,
  FileText,
  Inbox,
  SearchX,
  Users,
  type LucideIcon,
} from 'lucide-react';
import AdminSearchEmptyState from './AdminSearchEmptyState';

export type AdminSectionEmptyIconPreset =
  | 'search'
  | 'inbox'
  | 'reports'
  | 'users'
  | 'chart';

const PRESET_ICONS: Record<AdminSectionEmptyIconPreset, LucideIcon> = {
  search: SearchX,
  inbox: Inbox,
  reports: FileText,
  users: Users,
  chart: BarChart3,
};

interface AdminSectionEmptyStateProps {
  title?: string;
  description?: string;
  titleKey?: string;
  descriptionKey?: string;
  icon?: ReactNode;
  iconPreset?: AdminSectionEmptyIconPreset;
  /** panel = section pleine ; inline = compact (filtres, graphiques) */
  variant?: 'panel' | 'inline';
  className?: string;
}

const AdminSectionEmptyState: FunctionComponent<AdminSectionEmptyStateProps> = ({
  title,
  description,
  titleKey,
  descriptionKey,
  icon,
  iconPreset = 'inbox',
  variant = 'panel',
  className = '',
}) => {
  const resolvedIcon = useMemo(() => {
    if (icon) return icon;
    const Icon = PRESET_ICONS[iconPreset];
    return <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />;
  }, [icon, iconPreset]);

  return (
    <motion.div
      {...fadeInUp}
      transition={{ duration: 0.35 }}
      className={`admin-section-empty-state admin-section-empty-state--${variant} ${className}`.trim()}
    >
      <AdminSearchEmptyState
        variant={variant === 'inline' ? 'inline' : 'panel'}
        title={title}
        description={description}
        titleKey={titleKey}
        descriptionKey={descriptionKey}
        icon={resolvedIcon}
      />
    </motion.div>
  );
};

export default AdminSectionEmptyState;
