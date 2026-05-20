import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AdminEntityDetailModal from '../../../ui/AdminEntityDetailModal';
import type { AdminDetailSection } from '../../../ui/AdminDetailGrid';
import type { EncadrantReportRow } from '../data/encadrantReportsMock';
import { useAdminCopy } from '../../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../../i18n/useAdminTableValues';

interface EncadrantReportDetailModalProps {
  open: boolean;
  report: EncadrantReportRow | null;
  onClose: () => void;
}

const EncadrantReportDetailModal: FunctionComponent<EncadrantReportDetailModalProps> = ({
  open,
  report,
  onClose,
}) => {
  const { t } = useTranslation();
  const { tableColumn } = useAdminCopy();
  const { reportStatus } = useAdminTableValues();

  const sections: AdminDetailSection[] = useMemo(() => {
    if (!report) return [];
    return [
      {
        title: t('admin.modules.reports.detail.general', { defaultValue: 'Informations générales' }),
        fields: [
          { label: tableColumn('encadrant'), value: report.encadrant },
          { label: tableColumn('student'), value: report.student },
          { label: tableColumn('reportType'), value: report.reportType },
          {
            label: tableColumn('status'),
            value: reportStatus(report.status),
          },
        ],
      },
      {
        title: t('admin.modules.reports.detail.dates', { defaultValue: 'Dates' }),
        fields: [
          { label: tableColumn('submittedDate'), value: report.submittedDate },
          { label: tableColumn('dueDate'), value: report.dueDate },
        ],
      },
    ];
  }, [report, reportStatus, tableColumn, t]);

  return (
    <AdminEntityDetailModal
      open={open}
      onClose={onClose}
      title={report?.reportType ?? t('admin.modules.reports.detail.title', { defaultValue: 'Détail du rapport' })}
      description={report ? `${report.encadrant} · ${report.student}` : undefined}
      sections={sections}
    />
  );
};

export default EncadrantReportDetailModal;
