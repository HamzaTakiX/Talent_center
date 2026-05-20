import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import DocumentsStatusBadge from './DocumentsStatusBadge';
import DocumentsSlaBar from './DocumentsSlaBar';
import DocumentsPremiumEmpty from './DocumentsPremiumEmpty';
import type { DocumentRequestListItem } from '../types';

interface Props {
  rows: DocumentRequestListItem[];
  loading?: boolean;
}

const DocumentsRequestsModernTable: FunctionComponent<Props> = ({ rows, loading }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="admin-doc-table admin-doc-table--loading">
        <div className="admin-doc-table__head admin-doc-table__head--skeleton" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="admin-doc-table__row admin-doc-table__row--skeleton" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return <DocumentsPremiumEmpty variant="requests" />;
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
          <span className="admin-doc-table__ref">{row.reference}</span>
          <span className="admin-doc-table__student">
            <span className="admin-doc-avatar">{row.student.avatarInitials}</span>
            <span>
              <strong>{row.student.fullName}</strong>
              <small>{row.student.classGroup}</small>
            </span>
          </span>
          <span className="admin-doc-table__type">{row.documentTypeCode}</span>
          <span>
            <DocumentsStatusBadge status={row.status} />
          </span>
          <span>
            <DocumentsSlaBar percent={row.slaPercent} compact />
          </span>
          <span>{row.serviceName}</span>
          <span className="admin-doc-table__chevron">
            <ChevronRight className="h-4 w-4" aria-hidden />
          </span>
        </button>
      ))}
    </div>
  );
};

export default DocumentsRequestsModernTable;
