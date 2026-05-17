import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminCopy } from '../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import AdminRowActions from '../../ui/AdminRowActions';
import { DocumentRequestRow } from '../types';
import DocumentsRequestsToolbar from './DocumentsRequestsToolbar';
import AdminMobileRowCard from '../../shared/AdminMobileRowCard';
import AdminModuleHeader from '../../ui/AdminModuleHeader';
import { AdminListToolbarSection, AdminSearchEmptyState, AdminTableEmptyState } from '../../ui';
import { documentStatusTableBadge } from '../../ui/adminStatusBadges';

interface DocumentsRequestsTableProps {
  rows: DocumentRequestRow[];
  query: string;
  onQueryChange: (value: string) => void;
  title?: string;
  subtitle?: string;
  /** Barre recherche + filtre seulement (sans titre Document Requests). */
  compactHeader?: boolean;
  /** Colonne Class entre Student et Date. */
  showClassColumn?: boolean;
  searchPlaceholder?: string;
}

const DocumentsRequestsTable: FunctionComponent<DocumentsRequestsTableProps> = ({
  rows,
  query,
  onQueryChange,
  title,
  subtitle,
  compactHeader = false,
  showClassColumn = false,
  searchPlaceholder,
}) => {
  const { t } = useTranslation();
  const { tableColumn, emptyState } = useAdminCopy();
  const { documentStatus } = useAdminTableValues();
  const resolvedTitle = title ?? t('admin.modules.documents.title');
  const resolvedSubtitle = subtitle ?? t('admin.modules.documents.subtitle');
  const [documentTypeFilter, setDocumentTypeFilter] = useState<'all' | string>('all');

  const documentTypeOptions = useMemo(
    () => [...new Set(rows.map((r) => r.documentType))].sort((a, b) => a.localeCompare(b)),
    [rows]
  );

  useEffect(() => {
    if (
      documentTypeFilter !== 'all' &&
      !documentTypeOptions.includes(documentTypeFilter)
    ) {
      setDocumentTypeFilter('all');
    }
  }, [documentTypeFilter, documentTypeOptions]);

  const displayRows = useMemo(() => {
    if (documentTypeFilter === 'all') return rows;
    return rows.filter((r) => r.documentType === documentTypeFilter);
  }, [rows, documentTypeFilter]);

  const rowActions = (row: DocumentRequestRow, variant: 'mobile' | 'desktop' = 'desktop') => (
    <AdminRowActions
      variant={variant}
      onView={() => {}}
      onDownload={row.status === 'Validated' ? () => {} : undefined}
      onApprove={row.status === 'Pending' ? () => {} : undefined}
      onReject={row.status === 'Pending' ? () => {} : undefined}
    />
  );

  return (
    <div className="box-border flex w-full min-w-0 flex-col gap-6 admin-module-panel text-left font-inter text-base text-[var(--admin-text)] shadow-sm">
      {compactHeader ? (
        <AdminListToolbarSection>
          <DocumentsRequestsToolbar
            query={query}
            onQueryChange={onQueryChange}
            placeholder={searchPlaceholder}
            documentTypes={documentTypeOptions}
            documentTypeFilter={documentTypeFilter}
            onDocumentTypeFilterChange={setDocumentTypeFilter}
          />
        </AdminListToolbarSection>
      ) : (
        <AdminModuleHeader
          layout="toolbar"
          title={resolvedTitle}
          subtitle={resolvedSubtitle}
          actions={
            <DocumentsRequestsToolbar
              query={query}
              onQueryChange={onQueryChange}
              placeholder={searchPlaceholder}
              documentTypes={documentTypeOptions}
              documentTypeFilter={documentTypeFilter}
              onDocumentTypeFilterChange={setDocumentTypeFilter}
            />
          }
        />
      )}

      <div className="space-y-3 px-4 pb-6 pt-1 sm:px-6 lg:hidden">
        {displayRows.length === 0 ? (
          <AdminSearchEmptyState title={emptyState('documentsFilters')} />
        ) : (
        displayRows.map((row) => (
          <AdminMobileRowCard
            key={row.id}
            title={row.documentType}
            badges={
              <span className={documentStatusTableBadge(row.status)}>
                {documentStatus(row.status)}
              </span>
            }
            fields={[
              { label: tableColumn('student'), value: row.studentName },
              ...(showClassColumn
                ? [{ label: tableColumn('class'), value: row.studentClass ?? '—' } as const]
                : []),
              { label: tableColumn('submitted'), value: row.submissionDate }
            ]}
            actions={rowActions(row, 'mobile')}
          />
        )))}
      </div>

      <div className="hidden overflow-x-auto px-4 pb-6 pt-1 sm:px-6 lg:block">
        <table
          className={`w-full border-collapse font-inter text-num-14 leading-num-20 text-[var(--admin-text)] ${showClassColumn ? 'min-w-[1000px]' : 'min-w-[900px]'}`}
        >
          <thead>
            <tr className="border-b border-solid border-[var(--admin-border)]">
              <th className="px-2 py-2.5 text-start font-medium text-[var(--admin-text-secondary)]">{tableColumn('documentType')}</th>
              <th className="px-2 py-2.5 text-start font-medium text-[var(--admin-text-secondary)]">{tableColumn('student')}</th>
              {showClassColumn && (
                <th className="px-2 py-2.5 text-start font-medium text-[var(--admin-text-secondary)]">{tableColumn('class')}</th>
              )}
              <th className="px-2 py-2.5 text-start font-medium text-[var(--admin-text-secondary)]">{tableColumn('submissionDate')}</th>
              <th className="px-2 py-2.5 text-start font-medium text-[var(--admin-text-secondary)]">{tableColumn('status')}</th>
              <th className="px-2 py-2.5 text-end font-medium text-[var(--admin-text-secondary)]">{tableColumn('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.length === 0 ? (
              <AdminTableEmptyState
                colSpan={showClassColumn ? 6 : 5}
                title={emptyState('documentsFilters')}
              />
            ) : (
            displayRows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-solid border-[var(--admin-border)] last:border-b-0"
              >
                <td className="px-2 py-3 align-middle font-medium text-[var(--admin-text)]">
                  {row.documentType}
                </td>
                <td className="px-2 py-3 align-middle font-normal text-[var(--admin-text)]">
                  {row.studentName}
                </td>
                {showClassColumn && (
                  <td className="whitespace-nowrap px-2 py-3 align-middle font-normal text-[var(--admin-text-secondary)]">
                    {row.studentClass ?? '—'}
                  </td>
                )}
                <td className="whitespace-nowrap px-2 py-3 align-middle font-normal text-[var(--admin-text-secondary)]">
                  {row.submissionDate}
                </td>
                <td className="px-2 py-3 align-middle">
                  <span className={documentStatusTableBadge(row.status)}>
                    {documentStatus(row.status)}
                  </span>
                </td>
                <td className="px-2 py-3 align-middle">{rowActions(row)}</td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentsRequestsTable;
