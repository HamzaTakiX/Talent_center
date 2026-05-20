import { Eye, MessageSquare, PencilLine } from 'lucide-react';
import type { ReportEditorTab, ReportEditorTabId } from '../types';
import {
  REPORT_EDITOR_TAB_ACTIVE,
  REPORT_EDITOR_TAB_BAR,
  REPORT_EDITOR_TAB_INACTIVE,
} from '../constants/reportStyles';

interface ReportEditorTabsProps {
  tabs: ReportEditorTab[];
  activeTabId: ReportEditorTabId;
  onTabChange: (id: ReportEditorTabId) => void;
}

const tabIcons: Record<ReportEditorTabId, typeof PencilLine> = {
  editor: PencilLine,
  preview: Eye,
  comments: MessageSquare,
};

export default function ReportEditorTabs({
  tabs,
  activeTabId,
  onTabChange,
}: ReportEditorTabsProps) {
  return (
    <nav className={REPORT_EDITOR_TAB_BAR} aria-label="Onglets du rapport">
      {tabs.map((tab) => {
        const Icon = tabIcons[tab.id];
        const isActive = tab.id === activeTabId;
        const label =
          tab.count != null ? `${tab.label} (${tab.count})` : tab.label;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={isActive ? REPORT_EDITOR_TAB_ACTIVE : REPORT_EDITOR_TAB_INACTIVE}
            aria-selected={isActive}
            role="tab"
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
