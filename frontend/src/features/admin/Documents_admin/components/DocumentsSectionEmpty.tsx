import { FunctionComponent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Ban,
  Calendar,
  FileStack,
  LayoutGrid,
  PieChart,
} from 'lucide-react';
import AdminSectionEmptyState from '../../ui/AdminSectionEmptyState';
import type { AdminSectionEmptyIconPreset } from '../../ui';

export type DocumentsEmptySection =
  | 'requests'
  | 'search'
  | 'reservations'
  | 'templates'
  | 'resources'
  | 'workload'
  | 'analytics'
  | 'statusMix'
  | 'rejectionCauses'
  | 'reservationOccupancy';

interface Props {
  section: DocumentsEmptySection;
  variant?: 'panel' | 'inline';
  className?: string;
}

const iconProps = { className: 'h-6 w-6', strokeWidth: 1.75, 'aria-hidden': true as const };

const SECTION_CONFIG: Record<
  DocumentsEmptySection,
  { i18nPath: string; iconPreset?: AdminSectionEmptyIconPreset; icon?: ReactNode }
> = {
  requests: { i18nPath: 'requests', iconPreset: 'inbox' },
  search: { i18nPath: 'search', iconPreset: 'search' },
  reservations: { i18nPath: 'reservations', icon: <Calendar {...iconProps} /> },
  templates: { i18nPath: 'templates', icon: <FileStack {...iconProps} /> },
  resources: { i18nPath: 'resources', iconPreset: 'users' },
  workload: { i18nPath: 'workload', icon: <LayoutGrid {...iconProps} /> },
  analytics: { i18nPath: 'analytics', iconPreset: 'chart' },
  statusMix: { i18nPath: 'charts.statusMix', icon: <PieChart {...iconProps} /> },
  rejectionCauses: { i18nPath: 'charts.rejectionCauses', icon: <Ban {...iconProps} /> },
  reservationOccupancy: {
    i18nPath: 'charts.reservationOccupancy',
    icon: <Calendar {...iconProps} />,
  },
};

const DocumentsSectionEmpty: FunctionComponent<Props> = ({
  section,
  variant = 'panel',
  className = '',
}) => {
  const { t } = useTranslation();
  const config = SECTION_CONFIG[section];
  const base = `admin.documentsModule.empty.${config.i18nPath}`;

  return (
    <AdminSectionEmptyState
      variant={variant}
      className={className}
      icon={config.icon}
      iconPreset={config.iconPreset}
      title={t(`${base}.title`)}
      description={t(`${base}.subtitle`)}
    />
  );
};

export default DocumentsSectionEmpty;
