import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PlatformKpiStrip from '../../../../design-system/PlatformKpiStrip';
import { AdminKpiStripSkeleton } from '../../../admin/ui/AdminSectionSkeleton';
import {
  documentsStatColorMap,
  documentsStatIconMap,
} from '../data/documentsMock';
import type { DocumentsStatIconKey, StudentDocumentsStats } from '../types';

interface DocumentsStatsGridProps {
  stats: StudentDocumentsStats;
  loading?: boolean;
}

const STAT_KEYS: DocumentsStatIconKey[] = ['total', 'pending', 'validated', 'reserved'];

const DocumentsStatsGrid: FunctionComponent<DocumentsStatsGridProps> = ({
  stats,
  loading = false,
}) => {
  const { t } = useTranslation();

  const items = useMemo(
    () =>
      STAT_KEYS.map((key) => ({
        id: key,
        label: t(`student.documents.stats.${key}`),
        value: String(stats[key]),
        icon: documentsStatIconMap[key],
        iconBgClass: documentsStatColorMap[key],
      })),
    [stats, t],
  );

  if (loading) {
    return (
      <div id="student-documents-stats" className="min-w-0">
        <AdminKpiStripSkeleton count={4} />
      </div>
    );
  }

  return (
    <div id="student-documents-stats" className="min-w-0">
      <PlatformKpiStrip items={items} columns={4} ariaLabel={t('student.documents.statsAria')} />
    </div>
  );
};

export default DocumentsStatsGrid;
