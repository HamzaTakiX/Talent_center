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

export type EncadrantNavId =
  | 'dashboard'
  | 'chat'
  | 'agenda'
  | 'task'
  | 'workspace'
  | 'reports';

export interface EncadrantNavItem {
  id: EncadrantNavId;
  path: string;
  icon: LucideIcon;
}

export const ENCADRANT_NAV_ITEMS: EncadrantNavItem[] = [
  { id: 'dashboard', path: ENCADRANT_PATH, icon: LayoutDashboard },
  { id: 'chat', path: ENCADRANT_CHAT_PATH, icon: MessageSquare },
  { id: 'agenda', path: ENCADRANT_AGENDA_PATH, icon: Calendar },
  { id: 'task', path: ENCADRANT_TASK_PATH, icon: ListTodo },
  { id: 'workspace', path: ENCADRANT_WORKSPACE_PATH, icon: Video },
  { id: 'reports', path: ENCADRANT_REPORTS_PATH, icon: FilePenLine },
];

/** @deprecated Prefer `getEncadrantHeaderIcon` from `utils/encadrantPageTitle`. */
export { getEncadrantHeaderIcon } from '../utils/encadrantPageTitle';
