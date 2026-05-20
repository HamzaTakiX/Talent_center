import { FunctionComponent } from 'react';
import type { TaskTab, TaskTabId } from '../types';
import { TASK_TAB_ACTIVE, TASK_TAB_BAR, TASK_TAB_INACTIVE } from '../constants/taskStyles';

interface TaskFilterTabsProps {
  tabs: TaskTab[];
  activeTabId: TaskTabId;
  onTabChange: (tabId: TaskTabId) => void;
}

const tabLabel = (tab: TaskTab) => `${tab.label} (${tab.count})`;

const TaskFilterTabs: FunctionComponent<TaskFilterTabsProps> = ({ tabs, activeTabId, onTabChange }) => (
  <div className={TASK_TAB_BAR} role="tablist" aria-label="Filtrer les tâches">
    {tabs.map((tab) => {
      const isActive = tab.id === activeTabId;
      return (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => onTabChange(tab.id)}
          className={isActive ? TASK_TAB_ACTIVE : TASK_TAB_INACTIVE}
        >
          {tabLabel(tab)}
        </button>
      );
    })}
  </div>
);

export default TaskFilterTabs;
