import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import type { WorkspaceTabId } from '../types';

const TABS: WorkspaceTabId[] = ['documents', 'notes', 'activity'];

interface WorkspaceTabNavProps {
  activeTab: WorkspaceTabId;
  onTabChange: (tab: WorkspaceTabId) => void;
}

const WorkspaceTabNav: FunctionComponent<WorkspaceTabNavProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();

  return (
    <div className="student-workspace-tabs-wrap">
      <nav
        className="ofative-view-switch"
        role="tablist"
        aria-label={t('student.encadrant.workspace.platform.tabs.label')}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={`ofative-view-switch__btn ${activeTab === tab ? 'is-active' : ''}`}
            onClick={() => onTabChange(tab)}
          >
            {t(`student.encadrant.workspace.platform.tabs.${tab}`)}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default WorkspaceTabNav;
