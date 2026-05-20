import { FileText, MessageSquare, Pencil, Users } from 'lucide-react';
import type { WorkspaceTabId, WorkspaceTabItem } from '../types';
import {
  WORKSPACE_TAB_ACTIVE,
  WORKSPACE_TAB_BAR,
  WORKSPACE_TAB_INACTIVE,
} from '../constants/workspaceStyles';

interface WorkspaceTabBarProps {
  tabs: WorkspaceTabItem[];
  activeTabId: WorkspaceTabId;
  onTabChange: (id: WorkspaceTabId) => void;
}

const tabIcons: Record<WorkspaceTabId, typeof Pencil> = {
  whiteboard: Pencil,
  documents: FileText,
  notes: MessageSquare,
  discussion: Users,
};

export default function WorkspaceTabBar({
  tabs,
  activeTabId,
  onTabChange,
}: WorkspaceTabBarProps) {
  return (
    <nav className={WORKSPACE_TAB_BAR} aria-label="Onglets workspace" role="tablist">
      {tabs.map((tab) => {
        const Icon = tabIcons[tab.id];
        const isActive = tab.id === activeTabId;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={isActive ? WORKSPACE_TAB_ACTIVE : WORKSPACE_TAB_INACTIVE}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
