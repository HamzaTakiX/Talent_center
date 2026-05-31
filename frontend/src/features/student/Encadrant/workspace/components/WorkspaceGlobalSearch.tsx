import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import AdminSearchInput from '../../../../admin/ui/AdminSearchInput';
import { WORKSPACE_GLASS_CARD } from '../constants/workspaceLayout';
export type WorkspaceSearchResults = {
  documents: import('../types').WorkspaceDocument[];
  notes: import('../types').WorkspaceNote[];
  activities: import('../types').WorkspaceActivityItem[];
  knowledge: import('../types').WorkspaceKnowledgeItem[];
};

interface WorkspaceGlobalSearchProps {
  search: string;
  onSearchChange: (v: string) => void;
  results: WorkspaceSearchResults | null;
}

const WorkspaceGlobalSearch: FunctionComponent<WorkspaceGlobalSearchProps> = ({
  search,
  onSearchChange,
  results,
}) => {
  const { t } = useTranslation();

  return (
    <section className={`${WORKSPACE_GLASS_CARD} student-workspace-search`}>
      <div className="student-workspace-search__inner">
        <AdminSearchInput
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
          placeholder={t('student.encadrant.workspace.platform.search.placeholder')}
          aria-label={t('student.encadrant.workspace.platform.search.placeholder')}
        />
        {results ? (
        <div className="student-workspace-search-results text-sm">
          <p className="m-0 mb-2 font-semibold text-[var(--admin-text)]">
            {t('student.encadrant.workspace.platform.search.results')}
          </p>
          <ul className="m-0 list-none space-y-1 p-0 text-[var(--admin-text-muted)]">
            {results.documents.length > 0 ? (
              <li>{t('student.encadrant.workspace.platform.search.docs', { count: results.documents.length })}</li>
            ) : null}
            {results.notes.length > 0 ? (
              <li>{t('student.encadrant.workspace.platform.search.notes', { count: results.notes.length })}</li>
            ) : null}
            {results.knowledge.length > 0 ? (
              <li>{t('student.encadrant.workspace.platform.search.knowledge', { count: results.knowledge.length })}</li>
            ) : null}
            {results.documents.length === 0 &&
            results.notes.length === 0 &&
            results.knowledge.length === 0 &&
            results.activities.length === 0 ? (
              <li>{t('student.encadrant.workspace.platform.search.empty')}</li>
            ) : null}
          </ul>
        </div>
        ) : null}
      </div>
    </section>
  );
};

export default WorkspaceGlobalSearch;
