import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminSearchInput, AdminSelectField } from '../../ui';
import type { DocumentListParams, DocumentRequestStatus } from '../types';

export type DocFilters = Pick<DocumentListParams, 'search' | 'status' | 'priority' | 'service'>;

interface Props {
  filters: DocFilters;
  onChange: (f: DocFilters) => void;
}

const STATUS_OPTIONS: DocumentRequestStatus[] = [
  'submitted',
  'under_verification',
  'waiting_reservation',
  'ready',
  'delivered',
  'rejected',
];

const DocumentsFiltersBar: FunctionComponent<Props> = ({ filters, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className="admin-doc-filters">
      <AdminSearchInput
        value={filters.search ?? ''}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        placeholder={t('admin.documentsModule.filters.search')}
        className="admin-doc-filters__search"
      />
      <AdminSelectField
        aria-label={t('admin.documentsModule.filters.status')}
        value={filters.status ?? ''}
        onChange={(status) =>
          onChange({ ...filters, status: (status || undefined) as DocumentRequestStatus | undefined })
        }
        options={[
          { value: '', label: t('admin.documentsModule.filters.allStatuses') },
          ...STATUS_OPTIONS.map((s) => ({
            value: s,
            label: t(`admin.documentsModule.status.${s}`),
          })),
        ]}
      />
      <button
        type="button"
        className="admin-doc-filters__clear"
        onClick={() => onChange({})}
      >
        {t('admin.documentsModule.filters.clear')}
      </button>
    </div>
  );
};

export default DocumentsFiltersBar;
