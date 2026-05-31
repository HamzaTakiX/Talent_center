import {
  Calendar,
  FilePenLine,
  LayoutDashboard,
  ListTodo,
  LucideIcon,
  MessageSquare,
  Video,
} from 'lucide-react';
import {
  ENCADRANT_AGENDA_PATH,
  ENCADRANT_CHAT_PATH,
  ENCADRANT_PATH,
  ENCADRANT_REPORTS_PATH,
  ENCADRANT_TASK_PATH,
  ENCADRANT_WORKSPACE_PATH,
} from './routes';

export interface EncadrantNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const ENCADRANT_NAV_ITEMS: EncadrantNavItem[] = [
  { label: 'Dashboard', path: ENCADRANT_PATH, icon: LayoutDashboard },
  { label: 'Chat', path: ENCADRANT_CHAT_PATH, icon: MessageSquare },
  { label: 'Agenda', path: ENCADRANT_AGENDA_PATH, icon: Calendar },
  { label: 'Task', path: ENCADRANT_TASK_PATH, icon: ListTodo },
  { label: 'Workspace', path: ENCADRANT_WORKSPACE_PATH, icon: Video },
  { label: 'Reports', path: ENCADRANT_REPORTS_PATH, icon: FilePenLine },
];
