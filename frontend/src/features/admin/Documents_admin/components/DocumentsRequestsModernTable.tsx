import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import AdminModulePanel from '../../ui/AdminModulePanel';
import { AdminPanelListSkeleton } from '../../ui/AdminSectionSkeleton';
import DocumentsStatusBadge from './DocumentsStatusBadge';
import DocumentsSlaBar from './DocumentsSlaBar';
import DocumentsSectionEmpty from './DocumentsSectionEmpty';
import DocumentsSectionHeader from './DocumentsSectionHeader';
import DocumentRequestStudentCell from './DocumentRequestStudentCell';
import type { DocumentRequestListItem } from '../types';
import { sanitizeTableCellText } from '../../../../design-system/safeContent';

interface Props {
  rows: DocumentRequestListItem[];
  loading?: boolean;
}

const SKELETON_ROWS = 5;

const DocumentsRequestsModernTable: FunctionComponent<Props> = ({ rows, loading }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const body = (() => {
    if (loading && rows.length === 0) {
      return (
        <div className="admin-doc-table-panel__body">
          <AdminPanelListSkeleton rows={SKELETON_ROWS} />
        </div>
      );
    }

    if (rows.length === 0) {
      return (
        <div className="admin-doc-table-panel__body admin-doc-table-panel__body--empty">
          <DocumentsSectionEmpty section="requests" variant="compact" />
        </div>
      );
    }

    return (
      <div className="admin-doc-table" role="table">
        <div className="admin-doc-table__head" role="row">
          <span>{t('admin.documentsModule.table.reference')}</span>
          <span>{t('admin.documentsModule.table.student')}</span>
          <span>{t('admin.documentsModule.table.type')}</span>
          <span>{t('admin.documentsModule.table.status')}</span>
          <span>{t('admin.documentsModule.table.sla')}</span>
          <span>{t('admin.documentsModule.table.service')}</span>
          <span className="admin-doc-table__actions-col">{t('admin.documentsModule.table.actions')}</span>
        </div>
        {rows.map((row) => (
          <button
            key={row.id}
            type="button"
            className="admin-doc-table__row"
            onClick={() => navigate(`/admin/documents/requests/${row.id}`)}
            role="row"
          >
            <span className="admin-doc-table__ref">{sanitizeTableCellText(row.reference)}</span>
            <DocumentRequestStudentCell student={row.student} />
            <span className="admin-doc-table__type">{sanitizeTableCellText(row.documentTypeCode)}</span>
            <span>
              <DocumentsStatusBadge status={row.status} />
            </span>
            <span>
              <DocumentsSlaBar percent={row.slaPercent} deadline={row.slaDeadline} compact />
            </span>
            <span>{sanitizeTableCellText(row.serviceName)}</span>
            <span className="admin-doc-table__chevron">
              <ChevronRight className="h-4 w-4" aria-hidden />
            </span>
          </button>
        ))}
      </div>
    );
  })();

  return (
    <AdminModulePanel className="admin-doc-table-panel">
      <DocumentsSectionHeader
        variant="recent"
        title={t('admin.documentsModule.feed.recent')}
        itemCount={loading ? undefined : rows.length}
        loading={loading}
      />
      {body}
    </AdminModulePanel>
  );
};

export default DocumentsRequestsModernTable;
