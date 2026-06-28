import { FunctionComponent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Ban,
  BarChart3,
  Calendar,
  FileStack,
  FileText,
  Inbox,
  LayoutGrid,
  PieChart,
  SearchX,
  Users,
} from 'lucide-react';
import AdminSectionEmptyState from '../../ui/AdminSectionEmptyState';
import DocumentsCompactEmpty from './DocumentsCompactEmpty';
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
  /** panel = full section ; inline = chart inset ; compact = hub-optimized footprint */
  variant?: 'panel' | 'inline' | 'compact';
  className?: string;
}

const iconProps = { className: 'h-5 w-5', strokeWidth: 1.75, 'aria-hidden': true as const };

const PRESET_ICONS: Record<AdminSectionEmptyIconPreset, ReactNode> = {
  search: <SearchX {...iconProps} />,
  inbox: <Inbox {...iconProps} />,
  reports: <FileText {...iconProps} />,
  users: <Users {...iconProps} />,
  chart: <BarChart3 {...iconProps} />,
};

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

function resolveIcon(config: (typeof SECTION_CONFIG)[DocumentsEmptySection]): ReactNode {
  if (config.icon) return config.icon;
  return PRESET_ICONS[config.iconPreset ?? 'inbox'];
}

const DocumentsSectionEmpty: FunctionComponent<Props> = ({
  section,
  variant = 'panel',
  className = '',
}) => {
  const { t } = useTranslation();
  const config = SECTION_CONFIG[section];
  const base = `admin.documentsModule.empty.${config.i18nPath}`;
  const title = t(`${base}.title`);
  const description = t(`${base}.subtitle`);
  const icon = resolveIcon(config);

  if (variant === 'compact') {
    return (
      <DocumentsCompactEmpty
        title={title}
        description={description}
        icon={icon}
        tone={section === 'requests' ? 'panel' : 'chart'}
        className={className}
      />
    );
  }

  return (
    <AdminSectionEmptyState
      variant={variant === 'inline' ? 'inline' : 'panel'}
      className={className}
      icon={config.icon}
      iconPreset={config.iconPreset}
      title={title}
      description={description}
    />
  );
};

export default DocumentsSectionEmpty;
