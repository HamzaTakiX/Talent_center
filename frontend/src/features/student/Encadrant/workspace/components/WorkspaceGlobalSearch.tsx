import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import AdminSearchInput from '../../../../admin/ui/AdminSearchInput';

interface WorkspaceGlobalSearchProps {
  search: string;
  onSearchChange: (v: string) => void;
}

const WorkspaceGlobalSearch: FunctionComponent<WorkspaceGlobalSearchProps> = ({
  search,
  onSearchChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="student-workspace-search">
      <div className="student-workspace-search__inner">
        <AdminSearchInput
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
          placeholder={t('student.encadrant.workspace.platform.search.placeholder')}
          aria-label={t('student.encadrant.workspace.platform.search.placeholder')}
        />
      </div>
    </div>
  );
};

export default WorkspaceGlobalSearch;
