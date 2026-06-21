import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import type { HistoryStatItem } from '../types';
import HistoryStatCard from './HistoryStatCard';
import AdminKpiGrid from '../../ui/AdminKpiGrid';
import { AdminKpiStripSkeleton } from '../../ui/AdminSectionSkeleton';
import type { ModuleAuditKey } from '../constants/moduleAuditDefinitions';

const CARDS_PREFIX = 'admin.auditCenter.cards';
const MODULE_PREFIX = 'admin.auditCenter.moduleCards';

interface HistoryAuditGridProps {
  stats: HistoryStatItem[];
  loading?: boolean;
  /** When set, labels use module-scoped i18n keys. */
  moduleKey?: ModuleAuditKey;
  columns?: 2 | 3 | 4;
}

const HistoryAuditGrid: FunctionComponent<HistoryAuditGridProps> = ({
  stats,
  loading = false,
  moduleKey,
  columns = 4,
}) => {
  const { t } = useTranslation();

  if (loading && stats.length === 0) {
    return (
      <div aria-busy className="admin-module-audit-grid w-full min-w-0">
        <AdminKpiStripSkeleton count={moduleKey ? 4 : 6} />
      </div>
    );
  }

  if (stats.length === 0) {
    return null;
  }

  const resolveLabel = (item: HistoryStatItem) => {
    if (moduleKey) {
      return t(`${MODULE_PREFIX}.${moduleKey}.${item.key}`, item.label);
    }
    return t(`${CARDS_PREFIX}.${item.key}`, item.label);
  };

  return (
    <section
      className="admin-module-audit-grid w-full min-w-0"
      aria-label={
        moduleKey
          ? t(`${MODULE_PREFIX}.gridAria`, { module: moduleKey })
          : t(`${CARDS_PREFIX}.stripAria`)
      }
      data-admin-search-id={moduleKey ? `history-module-audit-${moduleKey}` : 'history-audit-grid'}
    >
      <AdminKpiGrid columns={columns} className="admin-module-audit-grid__inner">
        {stats.map((item, index) => (
          <HistoryStatCard
            key={item.key}
            item={{ ...item, label: resolveLabel(item) }}
            index={index}
          />
        ))}
      </AdminKpiGrid>
    </section>
  );
};

export default HistoryAuditGrid;
