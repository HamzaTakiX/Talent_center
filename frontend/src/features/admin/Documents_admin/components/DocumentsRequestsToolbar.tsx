import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminCopy, useAdminSearchPlaceholder } from '../../i18n/useAdminCopy';
import { AdminListToolbar } from '../../ui';

interface DocumentsRequestsToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder?: string;
  documentTypes: string[];
  documentTypeFilter: 'all' | string;
  onDocumentTypeFilterChange: (value: 'all' | string) => void;
}

const DocumentsRequestsToolbar: FunctionComponent<DocumentsRequestsToolbarProps> = ({
  query,
  onQueryChange,
  placeholder,
  documentTypes,
  documentTypeFilter,
  onDocumentTypeFilterChange,
}) => {
  const { t } = useTranslation();
  const { filterLabel } = useAdminCopy();
  const defaultSearchPh = useAdminSearchPlaceholder('documents');
  const searchPh = placeholder ?? defaultSearchPh;

  const typeOptions = useMemo(
    () => [
      { value: 'all', label: filterLabel('allTypes') },
      ...documentTypes.map((type) => ({ value: type, label: type })),
    ],
    [documentTypes, filterLabel],
  );

  return (
    <AdminListToolbar
      controlsLayout="grouped"
      searchValue={query}
      onSearchChange={onQueryChange}
      searchPlaceholder={searchPh}
      searchAriaLabel={t('admin.common.aria.searchDocuments')}
      toolbarAriaLabel={t('admin.common.aria.filterDocumentRequests')}
      filter1={{
        value: documentTypeFilter,
        onChange: onDocumentTypeFilterChange,
        options: typeOptions,
        ariaLabel: filterLabel('filterDocumentType'),
      }}
    />
  );
};

export default DocumentsRequestsToolbar;
