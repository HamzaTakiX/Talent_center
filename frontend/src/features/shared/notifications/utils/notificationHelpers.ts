import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle2,
  FileText,
  Info,
  Megaphone,
  MessageSquare,
  Wallet,
} from 'lucide-react';
import type { NotificationCategory, NotificationDisplayType, NotificationItem } from '../types';

export function formatRelativeTime(isoDate: string, locale = 'fr'): string {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return locale.startsWith('fr') ? 'À l\'instant' : 'Just now';
  if (diffMin < 60) return locale.startsWith('fr') ? `Il y a ${diffMin} min` : `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return locale.startsWith('fr') ? `Il y a ${diffHours} h` : `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return locale.startsWith('fr') ? 'Hier' : 'Yesterday';
  if (diffDays < 7) return locale.startsWith('fr') ? `Il y a ${diffDays} j` : `${diffDays}d ago`;
  return date.toLocaleDateString(locale);
}

const categoryIcons: Partial<Record<NotificationCategory, typeof Bell>> = {
  documents: FileText,
  srf: Wallet,
  announcements: Megaphone,
  chat: MessageSquare,
};

const displayTypeIcons: Record<NotificationDisplayType, typeof Bell> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  system: Bell,
  action_required: AlertCircle,
};

export function getNotificationIcon(item: NotificationItem) {
  return categoryIcons[item.category] ?? displayTypeIcons[item.display_type] ?? Bell;
}

export function prioritySortWeight(priority: string): number {
  switch (priority) {
    case 'URGENT':
      return 0;
    case 'HIGH':
      return 1;
    case 'NORMAL':
      return 2;
    case 'LOW':
      return 3;
    default:
      return 4;
  }
}

export function sortNotifications(items: NotificationItem[]): NotificationItem[] {
  return [...items].sort((a, b) => {
    const priorityDiff = prioritySortWeight(a.priority) - prioritySortWeight(b.priority);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
