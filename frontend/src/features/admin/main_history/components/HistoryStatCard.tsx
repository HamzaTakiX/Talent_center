import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  Bell,
  Bot,
  BriefcaseBusiness,
  CheckSquare,
  Clock3,
  DollarSign,
  FileText,
  GraduationCap,
  Layers,
  MessageCircleMore,
  PenSquare,
  ReceiptText,
  Shield,
  ShieldAlert,
  Users,
  Video,
  LucideIcon,
} from 'lucide-react';
import type { HistoryStatItem } from '../types';
import AdminKpiStatCard from '../../ui/AdminKpiStatCard';

interface HistoryStatCardProps {
  item: HistoryStatItem;
  onClick?: () => void;
  index?: number;
}

const iconByCardKey: Record<string, LucideIcon> = {
  events_today: Activity,
  critical_events: ShieldAlert,
  automated_events: Bot,
  active_users_today: Users,
  most_active_module: Layers,
  events_last_24h: Clock3,
  total_actions: Clock3,
  students: GraduationCap,
  admins: Users,
  encadrants: Users,
  internship_offers: BriefcaseBusiness,
  applications: PenSquare,
  announcements: Bell,
  documents: ReceiptText,
  srf: DollarSign,
  chat: MessageCircleMore,
  reports: PenSquare,
  tasks: CheckSquare,
  meetings: Video,
};

const iconByType: Record<string, LucideIcon> = {
  activity: Clock3,
  users: Users,
  shield: Shield,
  graduation: GraduationCap,
  briefcase: BriefcaseBusiness,
  file: FileText,
  receipt: DollarSign,
  message: MessageCircleMore,
};

const toneByCardKey: Record<string, { accent: string; bg: string }> = {
  events_today: { accent: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
  critical_events: { accent: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)' },
  automated_events: { accent: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)' },
  active_users_today: { accent: '#059669', bg: 'rgba(5, 150, 105, 0.1)' },
  most_active_module: { accent: '#0891b2', bg: 'rgba(8, 145, 178, 0.1)' },
  events_last_24h: { accent: '#ea580c', bg: 'rgba(234, 88, 12, 0.1)' },
  total_actions: { accent: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
  students: { accent: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)' },
  admins: { accent: '#059669', bg: 'rgba(5, 150, 105, 0.1)' },
  encadrants: { accent: '#4f46e5', bg: 'rgba(79, 70, 229, 0.1)' },
  internship_offers: { accent: '#0891b2', bg: 'rgba(8, 145, 178, 0.1)' },
  applications: { accent: '#ea580c', bg: 'rgba(234, 88, 12, 0.1)' },
  announcements: { accent: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
  documents: { accent: '#d97706', bg: 'rgba(217, 119, 6, 0.1)' },
  srf: { accent: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)' },
  chat: { accent: '#14b8a6', bg: 'rgba(20, 184, 166, 0.1)' },
  reports: { accent: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)' },
  tasks: { accent: '#65a30d', bg: 'rgba(101, 163, 13, 0.1)' },
  meetings: { accent: '#d946ef', bg: 'rgba(217, 70, 239, 0.1)' },
};

const HistoryStatCard: FunctionComponent<HistoryStatCardProps> = ({ item, onClick, index = 0 }) => {
  const { t } = useTranslation();
  const Icon = iconByCardKey[item.key] ?? iconByType[item.icon] ?? Clock3;
  const { accent, bg } = toneByCardKey[item.key] ?? toneByCardKey.events_today;
  const label = item.label || t(`admin.auditCenter.cards.${item.key}`, item.label);

  let displayValue = item.value;
  if (item.key === 'most_active_module' && item.meta?.label) {
    displayValue = `${item.value} · ${String(item.meta.label)}`;
  } else if (item.key === 'most_active_actor' && item.meta?.actor_email) {
    displayValue = `${item.value} · ${String(item.meta.actor_email)}`;
  }

  return (
    <AdminKpiStatCard
      label={label}
      value={displayValue}
      icon={Icon}
      accent={accent}
      accentBg={bg}
      onClick={onClick}
      index={index}
    />
  );
};

export default HistoryStatCard;
